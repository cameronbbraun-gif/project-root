(function () {
  const stripePublicKey = "pk_test_51RUynnChISbTJ9pZEcGL0hmmtYiESdAP44FwucoUxI7uvLnix9mDCJdUWLtbhIigS7FjbleR01IOXXfp5s4YKxWh00usslLdM9"; // ← Insert your pk_live_ or pk_test_ key here
  let stripe = null;
  let elements = null;
  let cardElement = null;

  function setupStripe() {
    if (!stripePublicKey) return;

    stripe = Stripe(stripePublicKey);
    elements = stripe.elements();

    // Card input element
    cardElement = elements.create("card", {
      hidePostalCode: false,
      style: {
        base: {
          fontSize: "16px",
          color: "#1f2937",
          fontFamily: "'Inter', sans-serif"
        }
      }
    });

    const cardMount = document.getElementById("card-element");
    if (cardMount) {
      cardElement.mount("#card-element");
    }

    // Stripe Payment Request Button Element (Apple Pay / Google Pay / Link)
    const paymentRequest = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: { label: "Deposit", amount: 0 },
      requestPayerName: true,
      requestPayerEmail: true
    });

    const prButton = elements.create("paymentRequestButton", {
      paymentRequest,
      style: {
        paymentRequestButton: {
          type: "default",
          theme: "dark",
          height: "48px"
        }
      }
    });

    paymentRequest.canMakePayment().then(function (result) {
      const container = document.getElementById("payment-request-button");

      if (result) {
        container.style.display = "block";
        prButton.mount("#payment-request-button");
      } else {
        container.style.display = "none";
      }
    });
  }

  window.setupStripe = setupStripe;
  const steps = Array.from(document.querySelectorAll('.form-step'));
  const progressDots = Array.from(document.querySelectorAll('.progress-step'));
  const progressLabels = Array.from(document.querySelectorAll('.progress-label'));
  const connectors = Array.from(document.querySelectorAll('.progress-connector'));

  const PRICES = {
    sedan:  {
      quickExterior: 49,  
      fullExterior: 99,  
      quickInterior: 59,
      fullInterior: 109,  
      maintenance: 99,   
      showroom: 179,
      addonPetHair: 29,   
      addonFabricProtect: 29, 
      addonIronDecon: 39
    },
    suv:    {
      quickExterior: 59,  
      fullExterior: 109, 
      quickInterior: 69,
      fullInterior: 119,  
      maintenance: 109,  
      showroom: 189,
      addonPetHair: 29,   
      addonFabricProtect: 29, 
      addonIronDecon: 39
    },
    truck:  {
      quickExterior: 69,  
      fullExterior: 119, 
      quickInterior: 79,
      fullInterior: 139,  
      maintenance: 119,  
      showroom: 199,
      addonPetHair: 29,   
      addonFabricProtect: 29, 
      addonIronDecon: 39
    }
  };

  const STEP3_DURATIONS = {
    quickExterior: '1-2 hours',
    fullExterior:  '2-3 hours',
    quickInterior: '1-2 hours',
    fullInterior:  '2-3 hours',
    maintenance:   '2-3 hours',
    showroom:      '4-5 hours'
  };

  let vehicleType = 'sedan';

  function getVehicleSelect() {
    return (
      document.getElementById('vehicle-type') ||
      document.querySelector('select[name="vehicle-type"]') ||
      document.querySelector('[data-step="1"] select[name="field"]') ||
      document.querySelector('[data-step="1"] select[data-name="Field"]')
    );
  }

  const money = n => `$${Number(n).toFixed(0)}`;
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const fmt = n => `$${Number(n || 0).toFixed(0)}`;

  function getVehicleType() {
    const sel = document.getElementById('vehicle-type');
    if (!sel) return vehicleType || 'sedan';
    const v = String(sel.value || '').toLowerCase();
    if (v.includes('truck')) return 'truck';
    if (v.includes('suv'))   return 'suv';
    if (v.includes('sedan')) return 'sedan';
    return vehicleType || 'sedan';
  }

  function detectVehicleType() {
    const step1 = document.querySelector('[data-step="1"]');
    if (!step1) return;
    const select = step1.querySelector('select');
    if (select && /sedan|suv|truck/i.test(select.value)) {
      vehicleType = select.value.toLowerCase();
      return;
    }
    const checked = step1.querySelector('input[type="radio"]:checked');
    if (checked && /sedan|suv|truck/i.test(checked.value)) {
      vehicleType = checked.value.toLowerCase();
    }
  }

  function renderStep2Prices() {
    const sel = document.getElementById('vehicle-type');
    if (sel && sel.value) {
      const v = String(sel.value).toLowerCase();
      vehicleType = v.includes('truck') ? 'truck' : (v.includes('suv') ? 'suv' : 'sedan');
    }

    const priceSet = PRICES[vehicleType] || PRICES.sedan;
    const root = document;

    const nodes = Array.from(root.querySelectorAll('[data-price-key]'));
    nodes.forEach(node => {
      const key = node.getAttribute('data-price-key');
      if (!key || priceSet[key] == null) return;
      const original = (node.textContent || '').trim();
      const isAddon = original.startsWith('+');
      const val = `$${Number(priceSet[key]).toFixed(0)}`;
      node.textContent = isAddon ? `+${val.replace('$', '')}` : val;
    });

    function keyFromLabel(raw) {
      const label = String(raw || '').toLowerCase();
      if (label.includes('quick') && label.includes('exterior')) return 'quickExterior';
      if (label.includes('full')  && label.includes('exterior')) return 'fullExterior';
      if (label.includes('quick') && label.includes('interior')) return 'quickInterior';
      if (label.includes('full')  && label.includes('interior')) return 'fullInterior';
      if (label.includes('maintenance')) return 'maintenance';
      if (label.includes('show') && label.includes('room')) return 'showroom';
      if (label.includes('pet') && label.includes('hair')) return 'addonPetHair';
      if (label.includes('fabric') && (label.includes('protect') || label.includes('protection'))) return 'addonFabricProtect';
      if (label.includes('iron') && (label.includes('decon') || label.includes('decontamination'))) return 'addonIronDecon';
      return null;
    }

    const rows = Array.from(root.querySelectorAll('.w-layout-hflex'));
    rows.forEach(row => {
      if (row.querySelector('[data-price-key]')) return;

      const title = row.querySelector('h6, .heading-15, .heading-16, .heading-18');
      if (!title) return;

      const key = keyFromLabel(title.textContent);
      if (!key || priceSet[key] == null) return;

      const candidatePrices = Array.from(row.querySelectorAll('h6.heading-16, h6.heading-18'));
      const price = candidatePrices.find(n => /^[+$]/.test((n.textContent || '').trim()));
      if (!price) return;

      const original = (price.textContent || '').trim();
      const isAddon = original.startsWith('+');
      const val = `$${Number(priceSet[key]).toFixed(0)}`;
      price.textContent = isAddon ? `+${val.replace('$', '')}` : val;
    });
  }

  function updateSelectionSummary() {
    const vt = getVehicleType();
    const priceSet = PRICES[vt] || PRICES.sedan;

    let pkgName = 'No package selected';
    let pkgPrice = 0;
    const checkedPkg = $('input[name="Service"]:checked');
    if (checkedPkg) {
      const card = checkedPkg.closest('label');
      const nameNode = card && card.querySelector('.heading-15');
      const priceNode = card && card.querySelector('[data-price-key]');
      if (nameNode) pkgName = (nameNode.textContent || '').trim();
      if (priceNode) {
        const key = priceNode.getAttribute('data-price-key');
        if (key && priceSet[key] != null) pkgPrice = Number(priceSet[key]);
      }
    }
    $('#package-name')  && ($('#package-name').textContent  = pkgName);
    $('#package-price') && ($('#package-price').textContent = fmt(pkgPrice));

    let addonNames = [];
    let addonsTotal = 0;
    $$('.checkbox-field-2 input[type="checkbox"]').forEach(cb => {
      if (!cb.checked) return;
      const label = cb.closest('label');
      const nameNode = label && label.querySelector('.heading-18');
      const priceNode = label && label.querySelector('[data-price-key]');
      if (nameNode) addonNames.push((nameNode.textContent || '').trim());
      if (priceNode) {
        const key = priceNode.getAttribute('data-price-key');
        const val = (PRICES.sedan[key] != null) ? PRICES.sedan[key] : priceSet[key];
        addonsTotal += Number(val || 0);
      }
    });

    $('#addons-count') && ($('#addons-count').textContent = `Add-ons (${addonNames.length} selected)`);
    $('#adding-price') && ($('#adding-price').textContent = fmt(addonsTotal));
    const listEl = $('#addons-list');
    if (listEl) listEl.innerHTML = addonNames.length ? addonNames.map(n => `• ${n}`).join('<br>') : '';

    $('#total-price') && ($('#total-price').textContent = fmt(pkgPrice + addonsTotal));
  }

  function updateStep3Summary() {
    let name = 'No package selected';
    let key  = null;

    const checked = document.querySelector("input[name='Service']:checked");
    if (checked) {
      const card    = checked.closest('label');
      const nameEl  = card && card.querySelector('.heading-15');
      const priceEl = card && card.querySelector('[data-price-key]');
      if (nameEl)  name = (nameEl.textContent || '').trim();
      if (priceEl) key  = priceEl.getAttribute('data-price-key');
    }

    const display = /detail$/i.test(name) || name === 'No package selected' ? name : `${name} Detail`;
    const pkgName2 = document.getElementById('package-name-2');
    if (pkgName2) pkgName2.textContent = display;

    const addonCount = Array
      .from(document.querySelectorAll('.checkbox-field-2 input[type="checkbox"]'))
      .filter(cb => cb.checked).length;
    const addonsCount2 = document.getElementById('addons-count-2');
    if (addonsCount2) addonsCount2.textContent = `Add-ons (${addonCount} selected)`;

    let duration = '';
    if (key && STEP3_DURATIONS[key]) {
      duration = STEP3_DURATIONS[key];
    } else {
      const compact = (name || '').toLowerCase().replace(/\s+/g, '');
      if (compact.includes('showroom'))      duration = STEP3_DURATIONS.showroom;
      else if (compact.includes('fullexterior'))  duration = STEP3_DURATIONS.fullExterior;
      else if (compact.includes('quickexterior')) duration = STEP3_DURATIONS.quickExterior;
      else if (compact.includes('fullinterior'))  duration = STEP3_DURATIONS.fullInterior;
      else if (compact.includes('quickinterior')) duration = STEP3_DURATIONS.quickInterior;
      else if (compact.includes('maintenance'))   duration = STEP3_DURATIONS.maintenance;
    }
    const durEl = document.getElementById('estimated-duration');
    if (durEl) durEl.textContent = duration ? `Estimated duration: ${duration}` : 'Estimated duration: —';
  }

  let current = 1;

  function updateUI() {
    steps.forEach(s => {
      const n = Number(s.dataset.step);
      const active = n === current;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
      if (active) {
        const headingId = s.getAttribute('aria-labelledby');
        const heading = headingId && document.getElementById(headingId);
        if (heading) heading.setAttribute('tabindex', '-1'), heading.focus();
      }
    });

    progressDots.forEach(d => {
      const n = Number(d.dataset.step);
      d.classList.toggle('is-complete', n < current);
      d.classList.toggle('is-active', n === current);
    });

    progressLabels.forEach((lbl, i) => {
      const n = i + 1;
      lbl.classList.toggle('is-complete', n < current);
      lbl.classList.toggle('is-active', n === current);
    });

    connectors.forEach(c => {
      const to = Number(c.dataset.to);
      c.classList.toggle('is-complete', current >= to);
      c.classList.toggle('is-active', current === to);
    });

    if (current === 2) {
      detectVehicleType();
      renderStep2Prices();
      updateSelectionSummary();
      updateStep3Summary();
    }
  }

  function goNext() {
    if (current < steps.length) {
      current++;
      updateUI();
    }
  }

  function goBack() {
    if (current > 1) {
      current--;
      updateUI();
    }
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    if (a.hasAttribute('data-next')) {
      e.preventDefault();
      goNext();
      detectVehicleType();
      renderStep2Prices();
      setTimeout(renderStep2Prices, 0);
      setTimeout(updateSelectionSummary, 0);
      setTimeout(updateStep3Summary, 0);
    }
    if (a.hasAttribute('data-back')) {
      e.preventDefault();
      goBack();
    }
  });

  progressDots.forEach(d => d.addEventListener('click', () => {
    current = Number(d.dataset.step) || current;
    updateUI();
    if (Number(d.dataset.step) === 5) {
      if (typeof updateStep5OrderSummary === "function") {
        updateStep5OrderSummary();
      } else if (typeof autoUpdateStep5 === "function") {
        autoUpdateStep5();
      }
    }
  }));

  $$("input[name='Service']").forEach(r => {
    r.addEventListener('change', updateSelectionSummary);
    r.addEventListener('change', updateStep3Summary);
  });
  $$('.checkbox-field-2 input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', updateSelectionSummary);
    cb.addEventListener('change', updateStep3Summary);
  });

  const step1 = document.querySelector('[data-step="1"]');
  if (step1) {
    step1.addEventListener('change', (e) => {
      const t = e.target;
      if (t && (t.tagName === 'SELECT' || t.type === 'radio')) {
        const val = String(t.value || '').toLowerCase().replace(/\s+/g, '');
        if (['sedan','suv','truck','largesuv','largesuv/truck'].includes(val)) {
          vehicleType = (val === 'largesuv' || val === 'largesuv/truck') ? 'truck' : val;
          if (current === 2) {
            renderStep2Prices();
            updateSelectionSummary();
            updateStep3Summary();
          }
        }
      }
    });
  }

  updateUI();

  const vehicleSelect = getVehicleSelect();
  if (vehicleSelect) {
    const norm = v => String(v || '').toLowerCase().replace(/\s+/g, '');
    const initial = norm(vehicleSelect.value);
    if (initial) vehicleType = initial.includes('truck') ? 'truck' : initial;

    vehicleSelect.addEventListener('change', (e) => {
      const val = norm(e.target.value);
      if (!val) return;
      vehicleType = val.includes('truck') ? 'truck' : (val.includes('suv') ? 'suv' : 'sedan');
      renderStep2Prices();
      requestAnimationFrame(renderStep2Prices);
      updateSelectionSummary();
      requestAnimationFrame(updateSelectionSummary);
      updateStep3Summary();
      requestAnimationFrame(updateStep3Summary);
    });
  }

  renderStep2Prices();
  updateSelectionSummary();
  updateStep3Summary();

  document.addEventListener('DOMContentLoaded', () => {
    detectVehicleType();
    if (document.querySelector('[data-step="2"].is-active')) renderStep2Prices();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.querySelector('[data-step="1"]');
    if (!step1) return;
    const form = step1.closest('form');
    if (form) form.setAttribute('autocomplete', 'off');

    function findField(keywords) {
      const sel = keywords.map(k => [
        `input[id*="${k}"]`,
        `input[name*="${k}"]`,
        `input[placeholder*="${k}"]`,
        `input[aria-label*="${k}"]`
      ].join(',')).join(',');
      return Array.from(step1.querySelectorAll(sel));
    }

    const makeInputs  = findField(['make','Make']);
    const modelInputs = findField(['model','Model']);
    const colorInputs = findField(['color','Color','colour','Colour']);
    const yearInputs  = findField(['year','Year']);
    const targets = [...new Set([...makeInputs, ...modelInputs, ...colorInputs, ...yearInputs])];

    targets.forEach((input) => {
      input.setAttribute('autocomplete', 'new-password');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'none');
      input.setAttribute('spellcheck', 'false');

      const map = {
        make:  'vehicle_make',
        model: 'vehicle_model',
        color: 'vehicle_color',
        colour:'vehicle_color',
        year:  'vehicle_year'
      };
      for (const key in map) {
        const re = new RegExp(key, 'i');
        if (re.test(input.name || '') || re.test(input.id || '') || re.test(input.getAttribute('aria-label') || '') || re.test(input.getAttribute('placeholder') || '')) {
          input.name = map[key];
          break;
        }
      }

      if (/year/i.test(input.name) || /year/i.test(input.id || '') || /year/i.test(input.getAttribute('placeholder') || '')) {
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('pattern', '\\d*');
      }

      input.addEventListener('focus', () => {
        if (input.matches(':-webkit-autofill')) input.value = '';
      });
    });
  });

  window.addEventListener('load', () => {
    renderStep2Prices();
    requestAnimationFrame(renderStep2Prices);
    updateSelectionSummary();
    requestAnimationFrame(updateSelectionSummary);
    updateStep3Summary();
    requestAnimationFrame(updateStep3Summary);
  });
  (function setupCalendar(){
    const monthLabel = document.getElementById('monthLabel');
    const prevBtn    = document.getElementById('prevMonth');
    const nextBtn    = document.getElementById('nextMonth');
    const grid       = document.querySelector('.calendar-grid');
    const hiddenDate = document.getElementById('selectedDate');

    if (!monthLabel || !prevBtn || !nextBtn || !grid) return;

    [prevBtn, nextBtn].forEach(btn => {
      btn.style.cursor = 'pointer';
      btn.style.transition = 'opacity 120ms ease, transform 120ms ease, filter 120ms ease';
      btn.addEventListener('mouseenter', () => {
        if (btn.style.pointerEvents === 'none') return;
        btn.style.opacity = '0.8';
        btn.style.transform = 'scale(1.06)';
        btn.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.opacity = '1';
        btn.style.transform = 'none';
        btn.style.filter = 'none';
      });
    });

    const COLOR_SELECTED_BG = '#1F2937';
    const COLOR_SELECTED_FG = '#FFFFFF';
    const COLOR_PAST        = '#9CA3AF';

    const today      = new Date();
    const minMonth   = new Date(today.getFullYear(), today.getMonth(), 1);
    let viewMonth    = new Date(minMonth.getTime());

    const pad = n => (n < 10 ? '0' + n : '' + n);
    const fmtISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const isSameDay = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
    const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    let selectedISO = null;
  function renderCalendar(){
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  monthLabel.textContent = `${monthNames[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`;

  const atMin = (viewMonth.getFullYear() === minMonth.getFullYear() && viewMonth.getMonth() === minMonth.getMonth());
  prevBtn.style.pointerEvents = atMin ? 'none' : 'auto';
  prevBtn.style.opacity = atMin ? '0.35' : '1';
  prevBtn.style.cursor = atMin ? 'default' : 'pointer';

  grid.innerHTML = '';

  const y = viewMonth.getFullYear();
  const m = viewMonth.getMonth();
  const firstOfMonth = new Date(y, m, 1);
  const firstWeekday = firstOfMonth.getDay();
  const daysInMonth  = new Date(y, m + 1, 0).getDate();
  const daysInPrev   = new Date(y, m, 0).getDate();

  function createDayCell(dateObj, isOtherMonth){
    const iso = fmtISO(dateObj);
    const isPast = startOfDay(dateObj) < startOfDay(today);

    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day' + (isOtherMonth ? ' other-month' : '');
    dayEl.setAttribute('data-date', iso);

    const num = document.createElement('div');
    num.className = 'day-nummber';
    num.textContent = String(dateObj.getDate());

    dayEl.style.display = 'flex';
    dayEl.style.alignItems = 'center';
    dayEl.style.justifyContent = 'center';
    dayEl.style.borderRadius = '8px';
    dayEl.style.userSelect = 'none';
    dayEl.style.cursor = 'pointer';
    dayEl.style.transition = 'box-shadow 120ms ease, background-color 120ms ease, color 120ms ease';

    if (isPast){
      num.style.color = COLOR_PAST;
      dayEl.style.cursor = 'default';
      dayEl.dataset.disabled = 'true';
    }

    if (selectedISO && selectedISO === iso){
      dayEl.style.background = COLOR_SELECTED_BG;
      num.style.color = COLOR_SELECTED_FG;
    }

    dayEl.addEventListener('mouseenter', () => {
      if (dayEl.dataset.disabled === 'true') return;
      dayEl.style.boxShadow = '0 0 0 2px rgba(17,24,39,0.35) inset';
    });
    dayEl.addEventListener('mouseleave', () => {
      dayEl.style.boxShadow = 'none';
    });

    dayEl.addEventListener('click', () => {
      if (dayEl.dataset.disabled === 'true') return;

      grid.querySelectorAll('.calendar-day').forEach(el => {
        el.style.background = '';
        const nn = el.querySelector('.day-nummber');
        if (!nn) return;
        if (el.dataset.disabled === 'true') {
          nn.style.color = COLOR_PAST;
        } else {
          nn.style.color = '';
        }
      });

      dayEl.style.background = COLOR_SELECTED_BG;
      num.style.color = COLOR_SELECTED_FG;
      selectedISO = iso;
      if (hiddenDate) hiddenDate.value = selectedISO;

      const summaryDate = document.getElementById('summary-date');
      if (summaryDate){
        const d = new Date(selectedISO + 'T00:00:00');
        summaryDate.textContent = d.toLocaleDateString(undefined, {year:'numeric', month:'long', day:'numeric'});
      }
    });

    dayEl.appendChild(num);
    return dayEl;
  }

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, daysInPrev - i);
    grid.appendChild(createDayCell(d, true));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    grid.appendChild(createDayCell(new Date(y, m, day), false));
  }

  const remainder = grid.children.length % 7;
  const addNext = remainder === 0 ? 0 : (7 - remainder);
  for (let i = 1; i <= addNext; i++) {
    grid.appendChild(createDayCell(new Date(y, m + 1, i), true));
  }

  while (grid.children.length < 42) {
    const idx = grid.children.length - (firstWeekday + daysInMonth);
    grid.appendChild(createDayCell(new Date(y, m + 1, addNext + idx + 1), true));
  }
  while (grid.children.length > 42) {
    grid.removeChild(grid.lastChild);
  }
}

    nextBtn.addEventListener('click', () => {
      viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
      renderCalendar();
    });
    prevBtn.addEventListener('click', () => {
      if (viewMonth.getFullYear() === minMonth.getFullYear() && viewMonth.getMonth() === minMonth.getMonth()) return;
      viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
      if (viewMonth < minMonth) viewMonth = new Date(minMonth.getTime());
      renderCalendar();
    });

    renderCalendar();

    (function scheduleMidnightTick(){
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
      setTimeout(() => { renderCalendar(); scheduleMidnightTick(); }, next - now);
    })();
  })();
  (function () {
    const step3 = document.querySelector('.form-step[data-step="3"]');
    if (!step3) return;
  
    const timeTitle   = step3.querySelector('.heading-23');  // "Available times for …"
    const timeGrid    = step3.querySelector('.grid');        // container to render time slots
    const hiddenDate  = document.getElementById('selectedDate');
    const hiddenTime  = document.getElementById('selectedTime');
    const durationSection = step3.querySelector('.flex-block-334'); // top Service Duration block
  
    const DURATION_MAX_HRS = {
      quickExterior: 2,
      fullExterior: 3,
      quickInterior: 2,
      fullInterior: 3,
      maintenance: 3,
      showroom: 5
    };

    function getSelectedServiceInfo() {
      let rawName = 'No package selected';
      let duration = '';

      const checked = document.querySelector("input[name='Service']:checked");
      if (checked) {
        const card = checked.closest('label');
        const nameEl = card && card.querySelector('.heading-15');
        if (nameEl) rawName = (nameEl.textContent || '').trim();
      }

      const compact = rawName.toLowerCase().replace(/\s+/g, '');
      if (compact.includes('showroom')) {
        duration = '4-5 hours';
      } else if (compact.includes('fullexterior')) {
        duration = '2-3 hours';
      } else if (compact.includes('quickexterior')) {
        duration = '1-2 hours';
      } else if (compact.includes('fullinterior')) {
        duration = '2-3 hours';
      } else if (compact.includes('quickinterior')) {
        duration = '1-2 hours';
      } else if (compact.includes('maintenance')) {
        duration = '2-3 hours';
      }

      const display =
        /detail$/i.test(rawName) || rawName === 'No package selected'
          ? rawName
          : `${rawName} Detail`;

      return { name: display, duration };
    }

    function updateDurationUI(startLabel, endLabel) {
      const { name, duration } = getSelectedServiceInfo();

      const hasFullInfo =
        !!(duration && startLabel && endLabel && name && name !== 'No package selected');

      if (durationSection) {
        durationSection.style.display = hasFullInfo ? '' : 'none';
      }

      const durationInfoEl = step3.querySelector('.duration-info');
      if (durationInfoEl) {
        if (!hasFullInfo) {
          durationInfoEl.textContent = '';
        } else {
          durationInfoEl.textContent =
            `Your ${name} service will take approximately ${duration}. ` +
            `We'll arrive at ${startLabel} and complete the service by ${endLabel}.`;
        }
      }

      const summaryService = document.getElementById('summary-service');
      if (summaryService) {
        summaryService.textContent =
          name === 'No package selected' ? '' : name;
      }

      const summaryDuration = document.getElementById('summary-duration');
      if (summaryDuration) {
        summaryDuration.textContent = duration || '';
      }

      const dateISO = getSelectedISO();
      const summaryDate = document.getElementById('summary-date');
      if (summaryDate) {
        if (dateISO) {
          const d = new Date(`${dateISO}T00:00:00`);
          summaryDate.textContent = d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } else {
          summaryDate.textContent = 'Select a date';
        }
      }

      const summaryTime = document.getElementById('summary-time');
      if (summaryTime) {
        if (hasFullInfo) {
          summaryTime.textContent = `${startLabel} - ${endLabel}`;
        } else {
          summaryTime.textContent = 'Select a time';
        }
      }
    }
  
    const SELECTED_CLASS = 'is-selected';
  
    const DAY_STORAGE_KEY = 'dg_bookings';
    function readBookings() {
      try { return JSON.parse(localStorage.getItem(DAY_STORAGE_KEY) || '[]'); } catch { return []; }
    }
    function saveBookings(list) {
      localStorage.setItem(DAY_STORAGE_KEY, JSON.stringify(list));
    }
    function addBooking(dateISO, startMin, endMin) {
      const list = readBookings();
      list.push({ date: dateISO, start: startMin, end: endMin });
      saveBookings(list);
    }
    function getBookingsFor(dateISO) {
      return readBookings().filter(b => b.date === dateISO);
    }
    function rangesOverlap(aStart, aEnd, bStart, bEnd) {
      return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
    }
  
    function minutesFromMidnight(h, m = 0) { return h * 60 + m; }
    function minutesToLabel(total) {
      let h = Math.floor(total / 60);
      const m = total % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = (h % 12) || 12;
      return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
    }
    function labelToMinutes(label) {
      const [, hh, mm, ampm] = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(label) || [];
      if (!hh) return null;
      let h = Number(hh) % 12;
      const m = Number(mm);
      if (/pm/i.test(ampm)) h += 12;
      return minutesFromMidnight(h, m);
    }
  
    function getSelectedPackageKey() {
      const checked = document.querySelector("input[name='Service']:checked");
      if (!checked) return null;
      const priceEl = checked.closest('label')?.querySelector('[data-price-key]');
      return priceEl ? priceEl.getAttribute('data-price-key') : null;
    }
    function getSelectedDurationMaxHours() {
      const key = getSelectedPackageKey();
      if (key && DURATION_MAX_HRS[key]) return DURATION_MAX_HRS[key];
  
      const checked = document.querySelector("input[name='Service']:checked");
      const name = checked?.closest('label')?.querySelector('.heading-15')?.textContent?.toLowerCase() ?? '';
      if (name.includes('show room')) return 5;
      if (name.includes('full exterior')) return 3;
      if (name.includes('quick exterior')) return 2;
      if (name.includes('full interior')) return 3;
      if (name.includes('quick interior')) return 2;
      if (name.includes('maintenance')) return 3;
      return 2;
    }
  
    function getSelectedISO() {
      return hiddenDate?.value || null;
    }
  
    function setTimeHeading(dateISO) {
      if (!timeTitle) return;
      if (!dateISO) {
        timeTitle.textContent = 'Select a date to view available times';
        return;
      }
      const d = new Date(`${dateISO}T00:00:00`);
      const nice = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      timeTitle.textContent = `Available times for ${nice}`;
    }
  
    function renderTimeSlots() {
      if (!timeGrid) return;

      const dateISO = getSelectedISO();
      setTimeHeading(dateISO);
      if (!dateISO) {
        timeGrid.innerHTML = '';
        return;
      }

      const currentSelected = hiddenTime?.value || '';

      timeGrid.innerHTML = '';

      const END = minutesFromMidnight(17, 0);
      let START = minutesFromMidnight(7, 0);
      
      if (dateISO) {
        const d = new Date(`${dateISO}T00:00:00`);
        const month = d.getMonth();
        const dayOfWeek = d.getDay();
      
        const isSummerMonth = month === 5 || month === 6;
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      
        if (!isSummerMonth && isWeekday) {
          START = minutesFromMidnight(15, 0);
        }
      }

      const durationHrs = getSelectedDurationMaxHours();
      const longService = durationHrs >= 4;

      const latestStart = longService ? minutesFromMidnight(15, 0) : END;

      const dayBookings = getBookingsFor(dateISO);

      for (let t = START; t <= END; t += 30) {
        if (t > latestStart) continue;

        const slotStart = t;
        const slotEnd   = t + durationHrs * 60;

        const overlaps = dayBookings.some(b => rangesOverlap(slotStart, slotEnd, b.start, b.end));
        if (overlaps) continue;

        const card = document.createElement('div');
        card.className = 'w-layout-vflex time-slot';

        const timeEl = document.createElement('div');
        timeEl.className = 'time-text';
        timeEl.textContent = minutesToLabel(t);

        const statusEl = document.createElement('div');
        statusEl.className = 'status-text';
        statusEl.textContent = 'Available';

        if (currentSelected === timeEl.textContent) {
          card.classList.add(SELECTED_CLASS);
          const stMinSel = labelToMinutes(timeEl.textContent);
          const endMinSel = stMinSel + durationHrs * 60;
          const startLabelSel = timeEl.textContent;
          const endLabelSel = minutesToLabel(endMinSel);
          updateDurationUI(startLabelSel, endLabelSel);
        }

        card.addEventListener('click', () => {
          timeGrid.querySelectorAll('.time-slot').forEach(el => el.classList.remove(SELECTED_CLASS));
          card.classList.add(SELECTED_CLASS);

          if (hiddenTime) hiddenTime.value = timeEl.textContent;

          const stMin = labelToMinutes(timeEl.textContent);
          const endMin = stMin + durationHrs * 60;
          const startLabel = timeEl.textContent;
          const endLabel = minutesToLabel(endMin);
          const sumTime = document.getElementById('summary-time');
          if (sumTime) sumTime.textContent = `${startLabel} - ${endLabel}`;
          updateDurationUI(startLabel, endLabel);
        });

        card.appendChild(timeEl);
        card.appendChild(statusEl);
        timeGrid.appendChild(card);
      }
    }
  
    window.__dgRenderTimeSlots = renderTimeSlots;
  
    document.addEventListener('click', (e) => {
      const day = e.target.closest('.calendar-day');
      if (!day) return;
      const iso = day.dataset.date;
      if (!iso) return;

      if (hiddenDate) hiddenDate.value = iso;

      if (hiddenTime) hiddenTime.value = '';

      const summaryDate = document.getElementById('summary-date');
      if (summaryDate) {
        const d = new Date(`${iso}T00:00:00`);
        summaryDate.textContent = d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      renderTimeSlots();
      updateDurationUI(null, null);
    });
  
    const observer = hiddenDate ? new MutationObserver(renderTimeSlots) : null;
    if (observer && hiddenDate) {
      observer.observe(hiddenDate, { attributes: true, attributeFilter: ['value'] });
    }
  
    document.querySelectorAll("input[name='Service']").forEach(radio => {
      radio.addEventListener('change', () => {
        renderTimeSlots();

        const label = hiddenTime ? hiddenTime.value : '';
        if (label) {
          const startMin = labelToMinutes(label);
          const durationHrs = getSelectedDurationMaxHours();
          const endMin = startMin + durationHrs * 60;
          const endLabel = minutesToLabel(endMin);
          updateDurationUI(label, endLabel);
        } else {
          updateDurationUI(null, null);
        }
      });
    });

    document.addEventListener('click', (e) => {
      const button = e.target.closest('a.nextbutton');
      if (!button) return;
  
      const parentStep = button.closest('.form-step');
      if (!parentStep) return;
  
      if (parentStep.dataset.step === '5') {
        const dateISO = getSelectedISO();
        const label   = hiddenTime?.value || '';
        if (!dateISO || !label) return;
  
        const startMin = labelToMinutes(label);
        const durationHrs = getSelectedDurationMaxHours();
        const endMin   = startMin + durationHrs * 60;
  
        addBooking(dateISO, startMin, endMin);
        renderTimeSlots();
      }
    });
  
    setTimeHeading(getSelectedISO());
    renderTimeSlots();
    updateDurationUI(null, null);
  })();

  (function setupServiceAreaCheck() {
    const step4 = document.querySelector('.form-step[data-step="4"]');
    if (!step4) return;

    const warningBlock = step4.querySelector('.flex-block-349');
    if (!warningBlock) return;

    warningBlock.style.display = 'none';

    function findInputByLabelText(root, textFragment) {
      const labels = Array.from(root.querySelectorAll('label'));
      const targetLabel = labels.find((lbl) =>
        (lbl.textContent || '').toLowerCase().includes(textFragment.toLowerCase())
      );
      if (!targetLabel) return null;
      const wrapper =
        targetLabel.closest('.w-layout-vflex, .w-layout-hflex') ||
        targetLabel.parentElement;
      if (!wrapper) return null;
      return wrapper.querySelector('input');
    }

    const streetInput = findInputByLabelText(step4, 'street address');
    const cityInput   = findInputByLabelText(step4, 'city');
    const stateInput  = findInputByLabelText(step4, 'state');
    const zipInput    = findInputByLabelText(step4, 'zip code');

    const SERVICE_CENTER = {
      lat: Number(window.DG_SERVICE_CENTER_LAT || 0),
      lng: Number(window.DG_SERVICE_CENTER_LNG || 0)
    };

    const SERVICE_RADIUS_MILES = Number(
      window.DG_SERVICE_RADIUS_MILES || 25
    );

    const GOOGLE_MAPS_API_KEY = window.DG_GMAPS_API_KEY || '';

    const SERVICE_POLYGON = [
      { lat: 27.9703446, lng: -82.5535114 },
      { lat: 27.9388052, lng: -82.5500781 },
      { lat: 27.9175715, lng: -82.5384052 },
      { lat: 27.8908719, lng: -82.5493915 },
      { lat: 27.8665938, lng: -82.5583179 },
      { lat: 27.8131628, lng: -82.5432117 },
      { lat: 27.8113408, lng: -82.4676807 },
      { lat: 27.8659868, lng: -82.4553211 },
      { lat: 27.9017953, lng: -82.447768 },
      { lat: 27.8939063, lng: -82.4257953 },
      { lat: 27.8932994, lng: -82.3832233 },
      { lat: 27.9278856, lng: -82.3468311 },
      { lat: 27.9721639, lng: -82.360564 },
      { lat: 28.023698, lng: -82.3509509 },
      { lat: 28.0812658, lng: -82.3475177 },
      { lat: 28.1127635, lng: -82.2431476 },
      { lat: 28.3982421, lng: -82.1655567 },
      { lat: 28.3879733, lng: -82.2610004 },
      { lat: 28.350514, lng: -82.3221118 },
      { lat: 28.3190863, lng: -82.3763568 },
      { lat: 28.3305706, lng: -82.49034 },
      { lat: 28.2906726, lng: -82.5500781 },
      { lat: 28.2011499, lng: -82.5706775 },
      { lat: 28.1563605, lng: -82.5933368 },
      { lat: 28.1145804, lng: -82.5919635 },
      { lat: 28.0739958, lng: -82.6276691 },
      { lat: 28.0449108, lng: -82.6599414 },
      { lat: 28.0006623, lng: -82.6764209 },
      { lat: 27.9576086, lng: -82.5782306 },
      { lat: 27.9600347, lng: -82.5617511 },
      { lat: 27.9703446, lng: -82.5535114 }
    ];

    console.log(
      '[DG] Service area config:',
      SERVICE_CENTER,
      'radius (mi):',
      SERVICE_RADIUS_MILES,
      'has API key:',
      !!GOOGLE_MAPS_API_KEY
    );

    if (!streetInput || !cityInput || !stateInput || !zipInput) {
      return;
    }


    function isPointInsidePolygon(point, polygon) {
      const x = point.lng;
      const y = point.lat;
      let inside = false;

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng, yi = polygon[i].lat;
        const xj = polygon[j].lng, yj = polygon[j].lat;

        const intersect =
          ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
      }

      return inside;
    }

    function haversineDistanceMiles(p1, p2) {
      const R = 3958.8;
      const toRad = deg => deg * Math.PI / 180;
      const dLat = toRad(p2.lat - p1.lat);
      const dLng = toRad(p2.lng - p1.lng);
      const a = Math.sin(dLat/2)**2 +
                Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
                Math.sin(dLng/2)**2;
      return 2 * R * Math.asin(Math.sqrt(a));
    }

    function debounce(fn, delay) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }

    function hideWarning() {
      if (warningBlock) warningBlock.style.display = 'none';
    }

    function showWarning() {
      if (warningBlock) warningBlock.style.display = '';
    }

    async function checkServiceArea() {
      const street = streetInput.value.trim();
      const city   = cityInput.value.trim();
      const state  = stateInput.value.trim();
      const zip    = zipInput.value.trim();

      if (!street || !city || !state || !zip) {
        hideWarning();
        return;
      }

      const fullAddress = `${street}, ${city}, ${state} ${zip}`;

      if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        hideWarning();
        return;
      }

      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Geocoding request failed');
        const data = await res.json();
        if (!data.results || !data.results.length) {
          hideWarning();
          return;
        }

        const loc = data.results[0].geometry.location;
        const point = { lat: loc.lat, lng: loc.lng };
        const insidePoly = isPointInsidePolygon(point, SERVICE_POLYGON);
        const distMiles = haversineDistanceMiles(point, SERVICE_CENTER);
        const inside = insidePoly || distMiles <= SERVICE_RADIUS_MILES;

        console.log('[DG] Inside custom polygon:', inside);

        if (!inside) {
          showWarning();
        } else {
          hideWarning();
        }
      } catch (err) {
        console.error('Error checking service area:', err);
        hideWarning();
      }
    }

    const debouncedCheck = debounce(checkServiceArea, 600);

    [streetInput, cityInput, stateInput, zipInput].forEach((input) => {
      input.addEventListener('input', debouncedCheck);
      input.addEventListener('blur', debouncedCheck);
    });
  })();

  (function () {

    const PACKAGE_DEPOSITS = {
      quickExterior: 20,
      fullExterior: 30,
      quickInterior: 20,
      fullInterior: 30,
      maintenance: 30,
      showroom: 50
    };
  
    function getSelectedPackageKey() {
      const checked = document.querySelector("input[name='Service']:checked");
      if (!checked) return null;

      const label = checked.closest("label");
      if (!label) return null;

      const priceEl = label.querySelector("[data-price-key]");
      if (priceEl) {
        const key = priceEl.getAttribute("data-price-key");
        if (key && PACKAGE_DEPOSITS[key] != null) return key;
      }

      // Fallback: detect from service title
      const raw = (label.querySelector(".heading-15")?.textContent || "").toLowerCase();
      if (raw.includes("quick") && raw.includes("exterior")) return "quickExterior";
      if (raw.includes("full")  && raw.includes("exterior")) return "fullExterior";
      if (raw.includes("quick") && raw.includes("interior")) return "quickInterior";
      if (raw.includes("full")  && raw.includes("interior")) return "fullInterior";
      if (raw.includes("maintenance")) return "maintenance";
      if (raw.includes("show")) return "showroom";

      return null;
    }
  
    function getSelectedPackageName() {
      const r = document.querySelector("input[name='Service']:checked");
      if (!r) return "";
      return r.closest("label").querySelector(".heading-15").textContent.trim();
    }
  
    function getSelectedPackagePrice() {
      const r = document.querySelector("input[name='Service']:checked");
      if (!r) return 0;
      return Number(r.closest("label").querySelector("[data-price-key]").textContent.replace(/\$/g, ""));
    }
  
    function getSelectedAddOns() {
      const arr = [];
      document.querySelectorAll(".checkbox-field-2 input[type='checkbox']").forEach(cb => {
        if (cb.checked) {
          const wrap = cb.closest("label");
          const name = wrap.querySelector(".heading-18").textContent.trim();
          const price = Number(
            wrap.querySelector("[data-price-key]").textContent.replace(/\D/g, "")
          );
          arr.push({ name, price });
        }
      });
      return arr;
    }
  
    function formatAddress() {
      const street = document.getElementById("street-address").value;
      const city = document.getElementById("city").value;
      const state = document.getElementById("state").value;
      const zip = document.getElementById("zip-code").value;
      return `${street}, ${city}, ${state} ${zip}`;
    }
  
    function formatCar() {
      const year = document.getElementById("vehicle-year").value;
      const make = document.getElementById("vehicle-make").value;
      const model = document.getElementById("vehicle-model").value;
      const type = document.getElementById("vehicle-type").value;
      const typeName = type === "suv" ? "SUV" : type === "truck" ? "Truck" : "Sedan";
      return `${year} ${make} ${model} (${typeName})`;
    }
  
    function formatDateTime() {
      const date = document.getElementById("selectedDate").value;
      const time = document.getElementById("selectedTime").value;
  
      if (!date || !time) return "";
  
      const d = new Date(date + "T00:00:00");
      const pretty = d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
  
      return `${pretty} at ${time}`;
    }
  
    function updateStep5OrderSummary() {
      const pkgKey = getSelectedPackageKey();
      const pkgName = getSelectedPackageName();
      const pkgPrice = getSelectedPackagePrice();

      const addons = getSelectedAddOns();
      const addTotal = addons.reduce((s, a) => s + a.price, 0);

      const total = pkgPrice + addTotal;
      const deposit = (pkgKey && PACKAGE_DEPOSITS[pkgKey] != null)
        ? PACKAGE_DEPOSITS[pkgKey]
        : 0;
      const remaining = total - deposit;

      const serviceName = document.querySelector("#step-5 .service");
      const servicePrice = document.querySelector("#step-5 .service-price");

      if (serviceName) serviceName.textContent = pkgName;
      if (servicePrice) servicePrice.textContent = `$${pkgPrice}`;

      const pet = document.getElementById("pet-hair-removal");
      const fabric = document.getElementById("fabric-protection-coating");
      const iron = document.getElementById("iron-decontamination-treatment");

      pet.style.display = "none";
      fabric.style.display = "none";
      iron.style.display = "none";

      addons.forEach(add => {
        if (add.name.includes("Pet Hair")) pet.style.display = "flex";
        if (add.name.includes("Fabric Protection")) fabric.style.display = "flex";
        if (add.name.includes("Iron Decontamination")) iron.style.display = "flex";
      });

      const totalEl = document.querySelector("#step-5 .text-block-22");
      totalEl.textContent = `$${total}`;

      const dueTodayLine = document.getElementById("summary-deposit-due");
      if (dueTodayLine) {
        dueTodayLine.textContent = `$${deposit}`;
      }

      const termsDepositText = document.getElementById("terms-text");

      if (termsDepositText) {
        if (deposit > 0) {
          termsDepositText.innerHTML =
            `I agree to the <a href="terms-of-service.html" class="link-19">Terms of Service</a> and ` +
            `<a href="privacy-policy.html" class="link-20">Privacy Policy</a>. ` +
            `I understand that a $${deposit} deposit is required to secure my booking and the remaining balance ` +
            `of $${remaining} will be collected on service day.`;
        } else {
          termsDepositText.innerHTML =
            `I agree to the <a href="terms-of-service.html" class="link-19">Terms of Service</a> and ` +
            `<a href="privacy-policy.html" class="link-20">Privacy Policy</a>.`;
        }
      }

      document.getElementById("deposit-payment").textContent =
        `You're paying a $${deposit} deposit today to secure your booking. ` +
        `The remaining balance of $${remaining} will be collected on service day.`;

      document.getElementById("deposit-amount").textContent = `$${deposit}`;

      document.getElementById("date-time").textContent = formatDateTime();
      document.getElementById("address").textContent = formatAddress();
      document.getElementById("car-type").textContent = formatCar();
    }
  
    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-next]");
      if (!btn) return;

      const step = btn.closest(".form-step")?.dataset.step;

      if (step === "4") {
        updateStep5OrderSummary();
      }
    });

    window.updateStep5OrderSummary = updateStep5OrderSummary;
    function autoUpdateStep5() {
      const step5 = document.querySelector('.form-step[data-step="5"]');
      if (step5 && step5.classList.contains('is-active')) {
        updateStep5OrderSummary();
      }
    }

    document.querySelectorAll("input[name='Service']").forEach(r => {
      r.addEventListener("change", autoUpdateStep5);
    });

    document.querySelectorAll(".checkbox-field-2 input[type='checkbox']").forEach(cb => {
      cb.addEventListener("change", autoUpdateStep5);
    });
  
  })();
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("card-element")) {
      setupStripe();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("paypal-button-container")) {

      function getDepositCents() {
        const depositText = document.getElementById("deposit-amount")?.textContent || "$0";
        const deposit = Number(depositText.replace(/[^0-9]/g, ""));
        return deposit * 100;
      }

      paypal.Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal"
        },

        createOrder: function (data, actions) {
          const depositInDollars = getDepositCents() / 100;

          return actions.order.create({
            purchase_units: [{
              amount: { value: depositInDollars.toFixed(2) },
              description: "Detail Geeks Booking Deposit"
            }]
          });
        },

        onApprove: function (data, actions) {
          return actions.order.capture().then(function (details) {

            fetch("/api/save-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: details.id,
                amount: getDepositCents(),
                provider: "paypal"
              })
            });

            window.location.href = "/booking-success.html";
          });
        },

        onError: function (err) {
          console.error("PayPal Error:", err);
          window.location.href = "/booking-error.html";
        }
      }).render('#paypal-button-container');
    }
  });
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-next]");
    if (!btn) return;

    const step = btn.closest(".form-step")?.dataset.step;

    if (step === "5") {
      e.preventDefault();

      const nextButton = btn;
      nextButton.classList.add("is-loading");
      nextButton.style.pointerEvents = "none";

      const loader = document.createElement("div");
      loader.id = "payment-loader";
      loader.style.width = "24px";
      loader.style.height = "24px";
      loader.style.border = "3px solid #ffffff";
      loader.style.borderTopColor = "transparent";
      loader.style.borderRadius = "50%";
      loader.style.marginLeft = "10px";
      loader.style.animation = "spin 0.8s linear infinite";
      nextButton.appendChild(loader);

      const depositText = document.getElementById("deposit-amount").textContent; // "$20"
      const deposit = Number(depositText.replace(/[^0-9]/g, "")); // 20
      const amountInCents = deposit * 100;

      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInCents,
          description: "Detail Geeks Booking Deposit",
          email: document.getElementById("email")?.value || ""
        })
      });

      const data = await res.json();
      const clientSecret = data.clientSecret;

      if (!clientSecret) {
        alert("Unable to start payment. Please try again.");
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: document.getElementById("cardholder-name").value,
            email: document.getElementById("email")?.value || ""
          }
        }
      });

      if (error) {
        window.location.href = "/booking-error.html";
        return;
      }

      console.log("Payment successful:", paymentIntent.id);

      fetch("/api/save-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: paymentIntent.id,
          amount: amountInCents,
        })
      });

      window.location.href = "/booking-success.html";
      return;
    }
  });
const spinnerStyle = document.createElement("style");
spinnerStyle.textContent = `
  @keyframes spin { 
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .is-loading { opacity: 0.7; }
`;
document.head.appendChild(spinnerStyle);
})();
