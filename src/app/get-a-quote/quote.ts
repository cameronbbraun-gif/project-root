type UploadStatus = "queued" | "uploading" | "done" | "error";

interface UploadItem {
  file: File;
  id: string;
  _pct?: number;
  _status?: UploadStatus;
  _tick?: number | null;
  _tickStart?: number;
  _done?: boolean;
  _url?: string;
}

interface QuoteApiResponse {
  ok?: boolean;
  error?: string;
  missing?: string[];
  file?: { url?: string };
}

const form = document.getElementById("quote-form") as HTMLFormElement | null;
const dropzone = document.getElementById("upload-dropzone") as HTMLElement | null;
const photosInput = document.getElementById("photos") as HTMLInputElement | null;
const list = document.getElementById("upload-list") as HTMLElement | null;
const uploadBtn = document.querySelector(".upload-btn") as HTMLButtonElement | HTMLAnchorElement | null;

const uploadBatch: string = (() => {
  const t = new Date();
  const localTimestamp = t.toLocaleString("sv-SE").replace(/[ :]/g, "-");
  const rand = (
    Math.random().toString(16).slice(2) + Date.now().toString(16)
  ).slice(0, 12);
  return `${localTimestamp}-${rand}`;
})();

const batchHidden = document.getElementById("upload_batch") as HTMLInputElement | null;

if (uploadBtn && photosInput) {
    uploadBtn.addEventListener("click", (e: Event) => {    e.preventDefault();
    e.stopPropagation();
    photosInput.click();
  });
}

if (batchHidden) {
  batchHidden.value = uploadBatch;
}

const isNextLocal =
  (location.hostname === "localhost" || location.hostname === "127.0.0.1") &&
  (location.port === "3000" || location.port === "");

const isLiveServer =
  (location.hostname === "localhost" || location.hostname === "127.0.0.1") &&
  location.port === "5500";

const isProduction =
  location.hostname === "detailgeeksautospa.com" ||
  location.hostname === "www.detailgeeksautospa.com";

let API_BASE = "";
let IMG_BASE = "";

if (isNextLocal) {
  API_BASE = "http://localhost:3000";
  IMG_BASE = "http://localhost:3000";
} else if (isLiveServer) {
  API_BASE = "http://localhost:3000";
  IMG_BASE = "http://localhost:3000";
} else if (isProduction) {
  API_BASE = "https://detailgeeksautospa.com";
  IMG_BASE = "https://detailgeeksautospa.com";
} else {
  API_BASE = "http://localhost:3000";
  IMG_BASE = "http://localhost:3000";
}

console.log("Environment detection →", {
  isNextLocal,
  isLiveServer,
  isProduction,
  API_BASE,
  IMG_BASE,
});

const MAX_SIZE = 25 * 1024 * 1024;
const ACCEPTED_TYPES: string[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/jpg",
];

const selectedFiles: UploadItem[] = [];

function safeUUID(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
  }
  const base = "xxxxxxxxyxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return base + Date.now().toString(16);
}

const byKey = (f: File): string => `${f.name}-${f.size}-${f.lastModified}`;

function syncInputFiles(): void {
  if (!photosInput) return;
  const dataTransfer = new DataTransfer();
  selectedFiles.forEach(({ file }) => dataTransfer.items.add(file));
  photosInput.files = dataTransfer.files;
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  const k = 1024;
  const units = ["KB", "MB", "GB"];
  let i = -1;
  let val = b;
  do {
    val = val / k;
    i++;
  } while (val >= k && i < units.length - 1);
  return `${val.toFixed(val < 10 ? 2 : 0)} ${units[i]}`;
}

function startSimulatedProgress(
  item: UploadItem,
  renderCb: () => void
): void {
  stopSimulatedProgress(item);
  item._tickStart = Date.now();
  item._tick = window.setInterval(() => {
    if (item._status !== "uploading") {
      stopSimulatedProgress(item);
      return;
    }
    const cap = 95;
    const step = 1;
    const next = Math.min(cap, (item._pct || 0) + step);
    if (next !== item._pct) {
      item._pct = next;
      const row = document.querySelector(
        `.upload-item[data-id="${item.id}"]`
      ) as HTMLElement | null;
      const bar = row
        ? (row.querySelector(".progress-bar") as HTMLElement | null)
        : null;
      const pctEl = row
        ? (row.querySelector(".file-percent") as HTMLElement | null)
        : null;
      if (bar) {
        bar.style.setProperty("width", `${item._pct}%`, "important");
      }
      if (pctEl) {
        pctEl.textContent = `${item._pct}%`;
      } else {
        renderCb();
      }
      console.debug("[quote] sim tick", item._pct);
    }
    if ((item._pct || 0) >= cap) {
      stopSimulatedProgress(item);
    }
  }, 150);
}

function stopSimulatedProgress(item: UploadItem): void {
  if (item._tick != null) {
    clearInterval(item._tick);
    item._tick = null;
  }
}

function animateTo(
  item: UploadItem,
  targetPct: number,
  durationMs: number,
  renderCb: () => void
): void {
  const startPct = item._pct || 0;
  const delta = targetPct - startPct;
  const t0 = performance.now();

  function frame(t: number): void {
    const k = Math.min(1, (t - t0) / Math.max(1, durationMs));
    item._pct = Math.round(startPct + delta * k);
    renderCb();
    if (k < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}


async function uploadOneFile(item: UploadItem, idx: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", item.file);

    item._status = "uploading";
    item._pct = 1;

    const renderNow = (): void => render();
    const renderRow = (): void => {
      const row = document.querySelector(
        `.upload-item[data-id="${item.id}"]`
      ) as HTMLElement | null;
      const bar = row
        ? (row.querySelector(".progress-bar") as HTMLElement | null)
        : null;
      const pctEl = row
        ? (row.querySelector(".file-percent") as HTMLElement | null)
        : null;
      const pct = item._pct || 0;
      if (bar) bar.style.setProperty("width", `${pct}%`, "important");
      if (pctEl) pctEl.textContent = `${pct}%`;
    };

    renderNow();

    const requestUrl = `${API_BASE}/api/quote/upload`;

    xhr.open("POST", requestUrl, true);
    xhr.responseType = "text";
    xhr.setRequestHeader("Accept", "application/json");

    const MIN_VISIBLE_MS = 900;
    const startTime = Date.now();

    startSimulatedProgress(item, renderRow);

    xhr.upload.onprogress = (evt: ProgressEvent<EventTarget>): void => {
      if (!evt.lengthComputable) return;
      stopSimulatedProgress(item);
      const loaded = evt.loaded;
      const total = Math.max(1, evt.total);
      const pct = Math.round((loaded / total) * 100);
      const target = Math.min(98, pct);
      const current = item._pct || 0;
      const clampedTarget = Math.min(target, current + 10);
      if (clampedTarget > current) {
        const start = current;
        const end = clampedTarget;
        const t0 = performance.now();
        const dur = 250;
        function step(t: number): void {
          const k = Math.min(1, (t - t0) / dur);
          item._pct = Math.round(start + (end - start) * k);
          renderRow();
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
    };

    xhr.onload = (): void => {
      const status = xhr.status;
      const raw = xhr.responseText || "";

      const finalize = (): void => {
        stopSimulatedProgress(item);
        let data: QuoteApiResponse = {};
        try {
          data = JSON.parse(raw || "{}") as QuoteApiResponse;
        } catch {
        }
        item._done = true;
        item._status = "done";
        item._pct = 100;

        const row = document.querySelector(
          `.upload-item[data-id="${item.id}"]`
        ) as HTMLElement | null;
        const bar = row
          ? (row.querySelector(".progress-bar") as HTMLElement | null)
          : null;
        const pctEl = row
          ? (row.querySelector(".file-percent") as HTMLElement | null)
          : null;
        const btn = row
          ? (row.querySelector(".file-action") as HTMLButtonElement | null)
          : null;

        if (bar) bar.style.setProperty("width", "100%", "important");
        if (pctEl) pctEl.textContent = "100%";
        if (btn) {
          btn.classList.add("complete");
          const c = btn.querySelector(".icon-check") as HTMLElement | null;
          const t = btn.querySelector(".icon-trash") as HTMLElement | null;
          if (c) c.style.display = "inline";
          if (t) t.style.display = "none";
        }

        console.debug("[quote] upload complete", {
          id: item.id,
          url: item._url || null,
          status,
          data,
        });

        if (data && data.file && data.file.url) {
          item._url = data.file.url;
        }

        renderRow();
        resolve(data);
      };

      if (status >= 200 && status < 300) {
        const elapsed = Date.now() - startTime;
        const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
        setTimeout(finalize, wait);
      } else {
        stopSimulatedProgress(item);
        item._status = "error";

        let errMsg = `HTTP ${status}`;
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object" && "error" in parsed) {
            errMsg = `HTTP ${status}: ${(parsed as QuoteApiResponse).error}`;
          }
        } catch {
          if (raw && raw.trim()) {
            errMsg = `HTTP ${status}: ${raw.slice(0, 200)}`;
          }
        }

        console.error("[quote] upload failed", {
          status,
          requestUrl,
          responseSnippet: raw ? raw.slice(0, 500) : "(empty)",
        });

        renderNow();
        reject(new Error(errMsg));
      }
    };

    xhr.onerror = (): void => {
      stopSimulatedProgress(item);
      item._status = "error";
      renderNow();
      reject(new Error("Network error"));
    };

    fd.append("batch", uploadBatch);
    xhr.send(fd);
  });
}

function render(): void {
  if (!list) return;
  list.innerHTML = "";

  selectedFiles.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "upload-item";
    li.dataset.id = item.id;

    const row = document.createElement("div");
    row.className = "upload-row";

    const icon = document.createElement("div");
    icon.className = "fileicon";
    icon.innerHTML = "";

    const main = document.createElement("div");
    main.className = "file-main";

    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = item.file.name;

    const size = document.createElement("div");
    size.className = "file-size";
    size.textContent = formatBytes(item.file.size);

    main.appendChild(name);
    main.appendChild(size);

    const percent = document.createElement("div");
    percent.className = "file-percent";
    percent.textContent = `${item._pct != null ? item._pct : 0}%`;

    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className = "file-action";
    if (item._done) actionBtn.classList.add("complete");
    actionBtn.setAttribute(
      "aria-label",
      item._done
        ? `Uploaded ${item.file.name}`
        : `Remove ${item.file.name}`
    );
    actionBtn.innerHTML = `
      <span class="icon-check" aria-hidden="true"></span>
      <span class="icon-trash" aria-hidden="true"></span>
    `;
    const checkEl = actionBtn.querySelector(".icon-check") as HTMLElement | null;
    const trashEl = actionBtn.querySelector(".icon-trash") as HTMLElement | null;
    if (checkEl) checkEl.style.display = item._done ? "inline" : "none";
    if (trashEl) trashEl.style.display = item._done ? "none" : "inline";

    actionBtn.addEventListener("click", () => {
      selectedFiles.splice(idx, 1);
      syncInputFiles();
      render();
    });

    row.appendChild(icon);
    row.appendChild(main);
    row.appendChild(percent);
    row.appendChild(actionBtn);

    const prog = document.createElement("div");
    prog.className = "progress";
    const bar = document.createElement("div");
    bar.className = "progress-bar";
    const pctVal = `${item._pct || 0}%`;
    bar.style.setProperty("width", pctVal, "important");
    prog.appendChild(bar);

    li.appendChild(row);
    li.appendChild(prog);
    list.appendChild(li);
  });
}

// ---- File selection / drag-and-drop ----

function addFiles(files: FileList | null | undefined): void {
  const incoming = files ? Array.from(files) : [];
  const valid = incoming.filter((f) => {
    const okType =
      ACCEPTED_TYPES.includes(f.type) || f.type.startsWith("image/");
    const okSize = f.size <= MAX_SIZE;
    return okType && okSize;
  });

  const have = new Set(selectedFiles.map((f) => byKey(f.file)));
  valid.forEach((f) => {
    const k = byKey(f);
    if (!have.has(k)) {
      const item: UploadItem = {
        file: f,
        id: safeUUID(),
        _pct: 0,
        _status: "queued",
      };
      selectedFiles.push(item);
      have.add(k);
      // Fire-and-forget upload
      uploadOneFile(item, selectedFiles.length - 1).catch(() => {
      });
    }
  });

  syncInputFiles();
  render();
}

if (dropzone && photosInput) {
  dropzone.addEventListener("click", () => {
    photosInput.click();
  });

  photosInput.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLInputElement;
    addFiles(target.files);
    target.value = "";
  });

  ["dragenter", "dragover"].forEach((evtName) => {
    dropzone.addEventListener(evtName, (e) => {
      const dragEvent = e as DragEvent;
      dragEvent.preventDefault();
      dragEvent.stopPropagation();
      dropzone.style.borderColor = "#fff";
      dropzone.style.backgroundColor = "rgba(255,255,255,0.04)";
    });
  });

  ["dragleave", "dragend", "drop"].forEach((evtName) => {
    dropzone.addEventListener(evtName, (e) => {
      const dragEvent = e as DragEvent;
      dragEvent.preventDefault();
      dragEvent.stopPropagation();
      dropzone.style.borderColor = "rgba(255,255,255,0.7)";
      dropzone.style.backgroundColor = "transparent";
    });
  });

  dropzone.addEventListener("drop", (e) => {
    const dragEvent = e as DragEvent;
    addFiles(dragEvent.dataTransfer?.files || null);
  });
}


if (form) {
  const container = form.closest(".w-form") as HTMLElement | null;
  const donePane = container?.querySelector(".w-form-done") as
    | HTMLElement
    | null;
  const failPane = container?.querySelector(".w-form-fail") as
    | HTMLElement
    | null;
  const submitBtn = form.querySelector(
    "#submit-quote"
  ) as HTMLInputElement | HTMLButtonElement | null;

  function show(el: HTMLElement | null | undefined): void {
    if (el) el.style.display = "block";
  }

  function hide(el: HTMLElement | null | undefined): void {
    if (el) el.style.display = "none";
  }

  form.addEventListener("submit", async (e: SubmitEvent) => {
    e.preventDefault();
    hide(donePane);
    hide(failPane);

    if (!submitBtn) return;

    submitBtn.disabled = true;
    const originalText = submitBtn.value;
    const waitLabel = form.getAttribute("data-wait") || "Please wait...";
    submitBtn.value = waitLabel;

    try {
      const fd = new FormData(form);
      const pending = selectedFiles.filter((it) => it._status !== "done");
      if (pending.length) {
        window.alert("Please wait for all uploads to finish before sending.");
        submitBtn.disabled = false;
        submitBtn.value = originalText;
        return;
      }

      fd.delete("photos");
      selectedFiles.forEach((it) => {
        if (it._url) fd.append("uploadedPhotos[]", it._url);
      });

      const res = await fetch(`${API_BASE}/api/quote`, {
        method: "POST",
        body: fd,
      });

      const data = (await res.json()) as QuoteApiResponse;

      const errorBox = document.querySelector(
        ".w-form-fail div"
      ) as HTMLElement | null;
      const failWrapper = document.querySelector(
        ".w-form-fail"
      ) as HTMLElement | null;

      if (!res.ok || !data || !data.ok) {
        let msg = "Oops! Something went wrong while submitting the form.";
        if (
          data &&
          data.error === "Missing required fields" &&
          Array.isArray(data.missing)
        ) {
          msg =
            "Please fill out the following required fields:<br>" +
            data.missing.join(", ");
        } else if (data && data.error) {
          msg = data.error;
        }

        if (errorBox) errorBox.innerHTML = msg;
        if (failWrapper) failWrapper.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.value = originalText;
        return;
      }

      if (donePane) show(donePane);
      if (failPane) hide(failPane);
      form.reset();
    } catch (err) {
      console.error("[quote] submit error:", err);
      const errorBox = document.querySelector(
        ".w-form-fail div"
      ) as HTMLElement | null;
      const failWrapper = document.querySelector(
        ".w-form-fail"
      ) as HTMLElement | null;
      if (errorBox) {
        errorBox.textContent = "Network error — please try again later.";
      }
      if (failWrapper) failWrapper.style.display = "block";
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.value = originalText;
      }
    }
  });
}

export {};