const form = document.getElementById('quote-form');
const dropzone = document.getElementById('upload-dropzone');
const photosInput = document.getElementById('photos');
const list = document.getElementById('upload-list');
const uploadBtn = document.querySelector('.upload-btn');
// One batch id per quote (timestamp + random). Used as the S3 "folder".
const uploadBatch = (function(){
  const t = new Date();
  // Format like "2025-11-01-16-45-22" (local time)
  const localTimestamp = t.toLocaleString('sv-SE').replace(/[ :]/g, '-'); 
  const rand = (Math.random().toString(16).slice(2) + Date.now().toString(16)).slice(0,12);
  return `${localTimestamp}-${rand}`;
})();
const batchHidden = document.getElementById('upload_batch');
if (uploadBtn && photosInput) {
  uploadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    photosInput.click();
  });
}
if (batchHidden) batchHidden.value = uploadBatch;

// Point API to Next.js dev server when running the page via Live Server (127.0.0.1:5500)
const isLiveServer = (location.hostname === '127.0.0.1' || location.hostname === 'localhost') && location.port === '5500';
const API_BASE = isLiveServer ? 'http://localhost:3000' : '';
const IMG_BASE = isLiveServer ? 'http://localhost:3000' : '';

const MAX_SIZE = 25 * 1024 * 1024; // 25MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
let selectedFiles = [];

// Safe UUID for browsers without crypto.randomUUID
function safeUUID() {
  try { if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID(); } catch {}
  return ('xxxxxxxxyxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  })) + Date.now().toString(16);
}

const byKey = f => `${f.name}-${f.size}-${f.lastModified}`;

function syncInputFiles() {
    if (!photosInput) return;
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(({file}) => dataTransfer.items.add(file));
    photosInput.files = dataTransfer.files;
}

function formatBytes(b) {
    if (b < 1024) return `${b} B`;
    const k = 1024, units = ['KB', 'MB', 'GB'];
    let i = -1, val = b;
    do { val = val / k; i++; } while (val >= k && i < units.length - 1);
    return `${val.toFixed(val < 10 ? 2 : 0)} ${units[i]}`;
}

// ---- Progress helpers (simulate + animate) ----
function startSimulatedProgress(item, renderCb) {
  stopSimulatedProgress(item);
  item._tickStart = Date.now();
  item._tick = setInterval(() => {
    if (item._status !== 'uploading') return stopSimulatedProgress(item);
    const cap = 95;
    const step = 1; // 1% per tick
    const next = Math.min(cap, (item._pct || 0) + step);
    if (next !== item._pct) {
      item._pct = next;
      // Direct DOM update for this item
      const row = document.querySelector(`.upload-item[data-id="${item.id}"]`);
      const bar = row ? row.querySelector('.progress-bar') : null;
      const pctEl = row ? row.querySelector('.file-percent') : null;
      if (bar) bar.style.setProperty('width', `${item._pct}%`, 'important');
      if (pctEl) pctEl.textContent = `${item._pct}%`;
      else renderCb();
      console.debug('[quote] sim tick', item._pct);
    }
    if (item._pct >= cap) stopSimulatedProgress(item);
  }, 150);
}
function stopSimulatedProgress(item) {
  if (item._tick) {
    clearInterval(item._tick);
    item._tick = null;
  }
}
function animateTo(item, targetPct, durationMs, renderCb) {
  const startPct = item._pct || 0;
  const delta = targetPct - startPct;
  const t0 = performance.now();
  function frame(t) {
    const k = Math.min(1, (t - t0) / Math.max(1, durationMs));
    item._pct = Math.round(startPct + delta * k);
    renderCb();
    if (k < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

async function uploadOneFile(item, idx) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append('file', item.file);
    item._status = 'uploading';
    item._pct = 0;
    // Direct DOM nudge: show initial 1% so users see movement right away
    item._pct = 1;
    const renderNow = () => render();
    const renderRow = () => {
      const row = document.querySelector(`.upload-item[data-id="${item.id}"]`);
      const bar = row ? row.querySelector('.progress-bar') : null;
      const pctEl = row ? row.querySelector('.file-percent') : null;
      if (bar) bar.style.setProperty('width', `${item._pct || 0}%`, 'important');
      if (pctEl) pctEl.textContent = `${item._pct || 0}%`;
    };
    renderNow();
    xhr.open('POST', `${API_BASE}/api/quote/upload`, true);
    xhr.responseType = 'text';
    xhr.setRequestHeader('Accept', 'application/json');

    const MIN_VISIBLE_MS = 900;
    let startTime = Date.now();
    startSimulatedProgress(item, renderRow);

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      stopSimulatedProgress(item);
      const loaded = evt.loaded, total = Math.max(1, evt.total);
      const pct = Math.round((loaded / total) * 100);
      // Never show 100 here; reserve that for onload
      const target = Math.min(98, pct); // keep headroom
      const current = item._pct || 0;
      // Limit large jumps for visible movement
      const clampedTarget = Math.min(target, current + 10);
      if (clampedTarget > current) {
        // Animate to clampedTarget over ~250ms
        const start = current;
        const end = clampedTarget;
        const t0 = performance.now();
        const dur = 250;
        function step(t) {
          const k = Math.min(1, (t - t0) / dur);
          item._pct = Math.round(start + (end - start) * k);
          renderRow();
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
    };

    xhr.onload = () => {
      const status = xhr.status;
      const requestUrl = `${API_BASE}/api/quote/upload`;
      const raw = xhr.responseText || '';

      const finalize = () => {
        stopSimulatedProgress(item);
        let data = {};
        try { data = JSON.parse(raw || '{}'); } catch { /* tolerate empty/invalid JSON */ }
        item._done = true;
        item._status = 'done';
        item._pct = 100;
        // Finalize DOM to 100% and add checkmark
        const row = document.querySelector(`.upload-item[data-id="${item.id}"]`);
        const bar = row ? row.querySelector('.progress-bar') : null;
        const pctEl = row ? row.querySelector('.file-percent') : null;
        const btn = row ? row.querySelector('.file-action') : null;
        if (bar) bar.style.setProperty('width', `100%`, 'important');
        if (pctEl) pctEl.textContent = `100%`;
        if (btn) btn.classList.add('complete');
        if (btn) {
          const c = btn.querySelector('.icon-check');
          const t = btn.querySelector('.icon-trash');
          if (c) c.style.display = 'inline';
          if (t) t.style.display = 'none';
        }
        console.debug('[quote] upload complete', { id: item.id, url: item._url || null, status, data });
        if (data && data.file && data.file.url) item._url = data.file.url;
        renderRow();
        resolve(data);
      };

      if (status >= 200 && status < 300) {
        const elapsed = Date.now() - startTime;
        const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
        setTimeout(finalize, wait);
      } else {
        stopSimulatedProgress(item);
        item._status = 'error';

        let errMsg = `HTTP ${status}`;
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.error) errMsg = `HTTP ${status}: ${parsed.error}`;
        } catch {
          if (raw && raw.trim()) errMsg = `HTTP ${status}: ${raw.slice(0, 200)}`;
        }

        console.error('[quote] upload failed', {
          status,
          requestUrl,
          responseSnippet: raw ? raw.slice(0, 500) : '(empty)',
        });

        renderNow();
        reject(new Error(errMsg));
      }
    };

    xhr.onerror = () => {
      stopSimulatedProgress(item);
      item._status = 'error';
      renderNow();
      reject(new Error('Network error'));
    };

    fd.append('batch', uploadBatch);
    xhr.send(fd);
  });
}

function render() {
  if (!list) return;
  list.innerHTML = '';
  selectedFiles.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'upload-item';
    li.dataset.id = item.id;

    const row = document.createElement('div');
    row.className = 'upload-row';

    const icon = document.createElement('div');
    icon.className = 'fileicon';
    icon.innerHTML = '';

    const main = document.createElement('div');
    main.className = 'file-main';

    const name = document.createElement('div');
    name.className = 'file-name';
    name.textContent = item.file.name;

    const size = document.createElement('div');
    size.className = 'file-size';
    size.textContent = formatBytes(item.file.size);

    main.appendChild(name);
    main.appendChild(size);

    const percent = document.createElement('div');
    percent.className = 'file-percent';
    percent.textContent = (item._pct != null ? item._pct : 0) + '%';

    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.className = 'file-action';
    if (item._done) actionBtn.classList.add('complete');
    actionBtn.setAttribute('aria-label', item._done ? `Uploaded ${item.file.name}` : `Remove ${item.file.name}`);
    actionBtn.innerHTML = `
      <span class="icon-check" aria-hidden="true"></span>
      <span class="icon-trash" aria-hidden="true"></span>
    `;
    const checkEl = actionBtn.querySelector('.icon-check');
    const trashEl = actionBtn.querySelector('.icon-trash');
    if (checkEl) checkEl.style.display = item._done ? 'inline' : 'none';
    if (trashEl) trashEl.style.display = item._done ? 'none' : 'inline';
    actionBtn.addEventListener('click', () => {
      selectedFiles.splice(idx, 1);
      syncInputFiles();
      render();
    });

    row.appendChild(icon);
    row.appendChild(main);
    row.appendChild(percent);
    row.appendChild(actionBtn);

    const prog = document.createElement('div');
    prog.className = 'progress';
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    const pctVal = `${item._pct || 0}%`;
    bar.style.setProperty('width', pctVal, 'important');
    prog.appendChild(bar);

    li.appendChild(row);
    li.appendChild(prog);
    list.appendChild(li);
  });
}

function addFiles(files) {
    const incoming = Array.from(files || []);
    const valid = incoming.filter(f => {
        const okType = ACCEPTED_TYPES.includes(f.type) || f.type.startsWith('image/');
        const okSize = f.size <= MAX_SIZE;
        return okType && okSize;
});

    const have = new Set(selectedFiles.map(f => byKey(f.file)));
    valid.forEach((f) => {
      const k = byKey(f);
      if (!have.has(k)) {
        const item = { file: f, id: safeUUID(), _pct: 0, _status: 'queued' };
        selectedFiles.push(item);
        have.add(k);
        uploadOneFile(item, selectedFiles.length - 1).catch(() => {/* error state already set */});
      }
    });

    syncInputFiles();
    render();
}

if (dropzone && photosInput) {
    dropzone.addEventListener('click', () => photosInput.click());

    photosInput.addEventListener('change', (e) => {
        addFiles(e.target.files);
        photosInput.value = '';
    });

    ['dragenter', 'dragover'].forEach(evt => {
        dropzone.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.style.borderColor = '#fff';
            dropzone.style.backgroundColor = 'rgba(255,255,255,0.04)';
        });
    });
    ['dragleave', 'dragend', 'drop'].forEach(evt => {
        dropzone.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.style.borderColor = 'rgba(255,255,255,0.7)';
            dropzone.style.backgroundColor = 'transparent';
        });
    });
    dropzone.addEventListener('drop', (e) => addFiles(e.dataTransfer?.files || []));
}

if (form) {
    const container = form.closest('.w-form')
    const donePane = container?.querySelector('.w-form-done');
    const failPane = container?.querySelector('.w-form-fail');
    const submitBtn = form.querySelector('#submit-quote');

    function show(el) { if (el) el.style.display = 'block'; }
    function hide(el) { if (el) el.style.display = 'none'; }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hide(donePane);
        hide(failPane);

        submitBtn.disabled = true;
        const originalText = submitBtn.value;
        submitBtn.value = form.getAttribute('data-wait') || 'Please wait...';

        try {
            const fd = new FormData(form);
            const pending = selectedFiles.filter(it => it._status !== 'done');
            if (pending.length) {
              alert('Please wait for all uploads to finish before sending.');
              submitBtn.disabled = false;
              submitBtn.value = originalText;
              return;
            }
            fd.delete('photos');
            selectedFiles.forEach((it) => {
              if (it._url) fd.append('uploadedPhotos[]', it._url);
            });

            const res = await fetch(`${API_BASE}/api/quote`, { method: 'POST', body: fd });
            const data = await res.json();

            const errorBox = document.querySelector('.w-form-fail div');
            const failWrapper = document.querySelector('.w-form-fail');

            if (!res.ok || !data.ok) {
              let msg = 'Oops! Something went wrong while submitting the form.';
              if (data.error === 'Missing required fields' && Array.isArray(data.missing)) {
                msg = 'Please fill out the following required fields:<br>' + data.missing.join(', ');
              } else if (data.error) {
                msg = data.error;
              }

              if (errorBox) errorBox.innerHTML = msg;
              if (failWrapper) failWrapper.style.display = 'block';
              submitBtn.disabled = false;
              submitBtn.value = originalText;
              return;
            }

            // ✅ Success
            if (donePane) show(donePane);
            if (failPane) hide(failPane);
            form.reset();

        } catch (err) {
          console.error('[quote] submit error:', err);
          const errorBox = document.querySelector('.w-form-fail div');
          const failWrapper = document.querySelector('.w-form-fail');
          if (errorBox) errorBox.textContent = 'Network error — please try again later.';
          if (failWrapper) failWrapper.style.display = 'block';
        } finally {
          submitBtn.disabled = false;
          submitBtn.value = originalText;
        }
    });
}