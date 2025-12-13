export interface PriceSet {
    quickExterior: number;
    fullExterior: number;
    quickInterior: number;
    fullInterior: number;
    maintenance: number;
    showroom: number;
  
    addonPetHair: number;
    addonFabricProtect: number;
    addonIronDecon: number;
    [key: string]: number;
}

export type PriceTable = PriceSet;
  
  export interface BookingEvent {
    date: string; 
    start: number; 
    end: number;  
  }
  
  export type VehicleType = "sedan" | "suv" | "truck";
  
export interface DurationMap {
  [key: string]: string;
}

export interface ServiceAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface BookingPaymentSummary {
  packageName: string;
  addons: string[];
  total: number;
  deposit: number;
  balance: number;
  dateTimeText: string;
  vehicleLine: string;
  customerName: string;
  email: string;
  serviceAddress: ServiceAddress;
}

export const PAYMENT_SUMMARY_EVENT = "dg:payment-summary";
  
  export const $ = <T extends HTMLElement = HTMLElement>(
    sel: string,
    root: ParentNode = document
  ): T | null => root.querySelector(sel);
  
  export const $$ = <T extends HTMLElement = HTMLElement>(
    sel: string,
    root: ParentNode = document
  ): T[] => Array.from(root.querySelectorAll(sel)) as T[];
  
  export const money = (n: number): string =>
    `$${Number(n).toFixed(0)}`;
  
  export const pad = (n: number): string =>
    n < 10 ? `0${n}` : `${n}`;
  
  
  export const PRICES: Record<VehicleType, PriceSet> = {
    sedan: {
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
    suv: {
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
    truck: {
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
  
export const STEP3_DURATIONS: DurationMap = {
  quickExterior: "1-2 hours",
  fullExterior: "2-3 hours",
  quickInterior: "1-2 hours",
  fullInterior: "2-3 hours",
  maintenance: "2-3 hours",
  showroom: "4-5 hours"
};

const STEP3_DURATION_MINUTES: Record<keyof typeof STEP3_DURATIONS, { min: number; max: number }> = {
  quickExterior: { min: 60, max: 120 },
  fullExterior: { min: 120, max: 180 },
  quickInterior: { min: 60, max: 120 },
  fullInterior: { min: 120, max: 180 },
  maintenance: { min: 120, max: 180 },
  showroom: { min: 240, max: 300 },
};

function getSelectedServiceInfo() {
  let name = "No package selected";
  let key: keyof typeof STEP3_DURATIONS | null = null;

  const checked = document.querySelector<HTMLInputElement>("input[name='Service']:checked");
  if (checked) {
    const card = checked.closest("label");
    const nameEl = card?.querySelector<HTMLElement>(".heading-15");
    const priceEl = card?.querySelector<HTMLElement>("[data-price-key]");

    if (nameEl) name = nameEl.textContent?.trim() ?? name;
    if (priceEl) {
      const k = priceEl.getAttribute("data-price-key") as keyof typeof STEP3_DURATIONS | null;
      if (k) key = k;
    }
  }

  if (!key) {
    const compact = name.toLowerCase().replace(/\s+/g, "");
    if (compact.includes("showroom")) key = "showroom";
    else if (compact.includes("fullexterior")) key = "fullExterior";
    else if (compact.includes("quickexterior")) key = "quickExterior";
    else if (compact.includes("fullinterior")) key = "fullInterior";
    else if (compact.includes("quickinterior")) key = "quickInterior";
    else if (compact.includes("maintenance")) key = "maintenance";
  }

  const durationLabel = key ? STEP3_DURATIONS[key] : "";
  const range = key ? STEP3_DURATION_MINUTES[key] : { min: 120, max: 180 };

  return { name, key, durationLabel, range };
}
  
  
export let vehicleType: VehicleType = "sedan";

export const stepState = {
  current: 1,
  steps: [] as HTMLElement[],
    progressDots: [] as HTMLElement[],
    progressLabels: [] as HTMLElement[],
    connectors: [] as HTMLElement[]
  };
  // Step system initialization
export function initStepSystem() {
    stepState.steps = $$<HTMLElement>(".form-step");
    stepState.progressDots = $$<HTMLElement>(".progress-step");
    stepState.progressLabels = $$<HTMLElement>(".progress-label");
    stepState.connectors = $$<HTMLElement>(".progress-connector");
  
    // Allow clicking the progress dots/labels to jump to a step
    stepState.progressDots.forEach((dot) => {
      const step = Number(dot.dataset.step);
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        goToStep(step);
      });
    });

    stepState.progressLabels.forEach((label, idx) => {
      const step = idx + 1;
      label.addEventListener("click", (e) => {
        e.preventDefault();
        goToStep(step);
      });
    });

    updateStepUI();
  }

export function updateStepUI() {
  const current = stepState.current;

  stepState.steps.forEach((step) => {
    const n = Number(step.dataset.step);
      const active = n === current;
      step.classList.toggle("is-active", active);
      step.setAttribute("aria-hidden", active ? "false" : "true");
    });
  
    stepState.progressDots.forEach((dot) => {
      const n = Number(dot.dataset.step);
      dot.classList.toggle("is-active", n === current);
      dot.classList.toggle("is-complete", n < current);
    });
  
    stepState.progressLabels.forEach((label, idx) => {
      const n = idx + 1;
      label.classList.toggle("is-active", n === current);
      label.classList.toggle("is-complete", n < current);
    });
  
  stepState.connectors.forEach((con) => {
    const to = Number(con.dataset.to);
    con.classList.toggle("is-active", stepState.current === to);
    con.classList.toggle("is-complete", stepState.current >= to);
  });

}

export function goToStep(target: number) {
  const max = stepState.steps.length || 1;
  const clamped = Math.min(Math.max(target, 1), max);
  stepState.current = clamped;
  updateStepUI();
  updateOrderSummaryCard();
}

  export function goNextStep() {
    if (stepState.current < stepState.steps.length) {
      goToStep(stepState.current + 1);
    }
  }

  export function goPrevStep() {
    if (stepState.current > 1) {
      goToStep(stepState.current - 1);
    }
  }
  
  export function detectVehicleType(): VehicleType {
    const sel = $("#vehicle-type") as HTMLSelectElement | null;
  
    if (sel && sel.value) {
      const v = sel.value.toLowerCase();
      if (v.includes("truck")) return (vehicleType = "truck");
      if (v.includes("suv")) return (vehicleType = "suv");
      return (vehicleType = "sedan");
    }
  
    const checkedRadio = document.querySelector<HTMLInputElement>(
      '[data-step="1"] input[type="radio"]:checked'
    );
    if (checkedRadio) {
      const v = checkedRadio.value.toLowerCase();
      if (v.includes("truck")) return (vehicleType = "truck");
      if (v.includes("suv")) return (vehicleType = "suv");
      return (vehicleType = "sedan");
    }
  
    return vehicleType;
  }
  export function renderStep2Prices() {
    const v = detectVehicleType();
    const priceSet = PRICES[v];
    const nodes = $$<HTMLElement>("[data-price-key]");
  
    nodes.forEach((node) => {
      const key = node.getAttribute("data-price-key") as keyof PriceSet;
      if (!key) return;
      const val = priceSet[key as keyof PriceSet];
      if (val == null) return;
  
      const raw = node.textContent?.trim() ?? "";
      const prefix = raw.startsWith("+") ? "+" : "";
      node.textContent = prefix ? `${prefix}${val}` : `$${val}`;
    });
  }
  
export function updateSelectionSummary() {
    const pkgNameEl = $("#package-name");
    const pkgPriceEl = $("#package-price");
    const addonsCountEl = $("#addons-count");
    const addingPriceEl = $("#adding-price");
    const addonsListEl = $("#addons-list");
    const totalPriceEl = $("#total-price");

    // If step 2 elements are not in DOM yet (e.g., user is still on step 1), exit safely
    if (!pkgNameEl || !pkgPriceEl || !addonsCountEl || !addingPriceEl || !addonsListEl || !totalPriceEl) {
      return;
    }

    const v = detectVehicleType();
    const priceSet = PRICES[v];

    let pkgName = "No package selected";
    let pkgPrice = 0;

    const checked = document.querySelector<HTMLInputElement>("input[name='Service']:checked");
    if (checked) {
      const card = checked.closest("label")!;
      const nameEl = card.querySelector<HTMLElement>(".heading-15");
      const priceEl = card.querySelector<HTMLElement>("[data-price-key]");

      if (nameEl) pkgName = nameEl.textContent?.trim() ?? "";
      if (priceEl) {
        const key = priceEl.getAttribute("data-price-key") as keyof PriceSet;
        if (priceSet[key] != null) pkgPrice = priceSet[key];
      }
    }

    pkgNameEl.textContent = pkgName;
    pkgPriceEl.textContent = `$${pkgPrice}`;

    const addonNames: string[] = [];
    let addonsTotal = 0;

    $$(".checkbox-field-2 input[type='checkbox']").forEach((cb) => {
      const input = cb as HTMLInputElement;
      if (!input.checked) return;

      const wrap = input.closest("label")!;
      const nameEl = wrap.querySelector<HTMLElement>(".heading-18");
      const priceEl = wrap.querySelector<HTMLElement>("[data-price-key]");

      if (nameEl) addonNames.push(nameEl.textContent!.trim());
      if (priceEl) {
        const key = priceEl.getAttribute("data-price-key") as keyof PriceSet;
        const val = priceSet[key] ?? PRICES.sedan[key] ?? 0;
        addonsTotal += Number(val);
      }
    });

    addonsCountEl.textContent = `Add-ons (${addonNames.length} selected)`;
    addingPriceEl.textContent = `$${addonsTotal}`;
    addonsListEl.innerHTML = addonNames.length > 0 ? addonNames.map((n) => `• ${n}`).join("<br>") : "";
    totalPriceEl.textContent = `$${pkgPrice + addonsTotal}`;

    updateOrderSummaryCard();
}

function getSelectedPackageAndAddons() {
  const v = detectVehicleType();
  const priceSet = PRICES[v];

  let pkgName = "No package selected";
  let pkgPrice = 0;
  const checked = document.querySelector<HTMLInputElement>("input[name='Service']:checked");
  if (checked) {
    const card = checked.closest("label")!;
    const nameEl = card.querySelector<HTMLElement>(".heading-15");
    const priceEl = card.querySelector<HTMLElement>("[data-price-key]");
    if (nameEl) pkgName = nameEl.textContent?.trim() ?? pkgName;
    if (priceEl) {
      const key = priceEl.getAttribute("data-price-key") as keyof PriceSet;
      if (priceSet[key] != null) pkgPrice = priceSet[key];
    }
  }

  const addons: { name: string; price: number }[] = [];
  $$(".checkbox-field-2 input[type='checkbox']").forEach((cb) => {
    const input = cb as HTMLInputElement;
    if (!input.checked) return;
    const wrap = input.closest("label");
    const nameEl = wrap?.querySelector<HTMLElement>(".heading-18");
    const priceEl = wrap?.querySelector<HTMLElement>("[data-price-key]");
    const name = nameEl?.textContent?.trim() ?? "Add-on";
    const key = (priceEl?.getAttribute("data-price-key") as keyof PriceSet | null) ?? null;
    const price = key ? priceSet[key] ?? PRICES.sedan[key] ?? 0 : 0;
    addons.push({ name, price: Number(price) });
  });

  const total = pkgPrice + addons.reduce((sum, a) => sum + a.price, 0);
  return { pkgName, pkgPrice, addons, total };
}
  
export function updateStep3Summary() {
  let name = "No package selected";
  let key: keyof PriceSet | null = null;

  const checked = document.querySelector<HTMLInputElement>("input[name='Service']:checked");
    if (checked) {
      const card = checked.closest("label")!;
      const nameEl = card.querySelector<HTMLElement>(".heading-15");
      const priceEl = card.querySelector<HTMLElement>("[data-price-key]");
  
      if (nameEl) name = nameEl.textContent?.trim() ?? "";
      if (priceEl) key = priceEl.getAttribute("data-price-key") as keyof PriceSet;
    }
  
    const display =
      /detail$/i.test(name) || name === "No package selected"
        ? name
        : `${name} Detail`;
  
    const pkgName2 = $("#package-name-2");
    if (pkgName2) pkgName2.textContent = display;
  
    const addonCount = $$(".checkbox-field-2 input[type='checkbox']").filter(
      (cb) => (cb as HTMLInputElement).checked
    ).length;
  
  const addonsCount2 = $("#addons-count-2");
  if (addonsCount2) addonsCount2.textContent = `Add-ons (${addonCount} selected)`;

  let duration = "";
  if (key && STEP3_DURATIONS[key as keyof typeof STEP3_DURATIONS]) {
      duration = STEP3_DURATIONS[key as keyof typeof STEP3_DURATIONS];
    } else {
      const compact = name.toLowerCase().replace(/\s+/g, "");
      if (compact.includes("showroom")) duration = STEP3_DURATIONS.showroom;
      else if (compact.includes("fullexterior"))
        duration = STEP3_DURATIONS.fullExterior;
      else if (compact.includes("quickexterior"))
        duration = STEP3_DURATIONS.quickExterior;
      else if (compact.includes("fullinterior"))
        duration = STEP3_DURATIONS.fullInterior;
      else if (compact.includes("quickinterior"))
        duration = STEP3_DURATIONS.quickInterior;
      else if (compact.includes("maintenance"))
        duration = STEP3_DURATIONS.maintenance;
    }

  const durEl = $("#estimated-duration");
  if (durEl)
    durEl.textContent = duration ? `Estimated duration: ${duration}` : "Estimated duration: —";

  const availableTimesLabel = $("#available-times-label");
  const durationInfo = $("#duration-info");
  if (availableTimesLabel && !calendar.selectedDate) {
    availableTimesLabel.textContent = "Select a date to see available times";
  }
  if (durationInfo && !calendar.selectedTime) {
    durationInfo.textContent = "Please select a time to see your service schedule.";
  }
}

export const calendar = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    selectedDate: "",
    selectedTime: "",
    events: [] as BookingEvent[],
  };
  
  export function daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
  
export function firstWeekday(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function isShowroomDetailSelected(): boolean {
  const checked = document.querySelector<HTMLInputElement>("input[name='Service']:checked");
  if (!checked) return false;
  return checked.value.toLowerCase().includes("show room");
}

export function renderCalendar() {
    const monthLabel = $("#monthLabel");
    if (!monthLabel) return;
  
    const monthName = new Date(calendar.year, calendar.month).toLocaleString(
      "default",
      { month: "long" }
    );
  
    monthLabel.textContent = `${monthName} ${calendar.year}`;
  
    const grid = $$(".calendar-day");
    grid.forEach((d) => {
      d.classList.remove("disabled", "selected", "today", "has-event");
      d.querySelector(".day-nummber")!.textContent = "";
    });
  
    const totalDays = daysInMonth(calendar.year, calendar.month);
    const startPosition = firstWeekday(calendar.year, calendar.month);
  
    grid.forEach((cell) => cell.setAttribute("data-date", ""));
  
    for (let i = 1; i <= totalDays; i++) {
      const index = startPosition + (i - 1);
      const cell = grid[index];
      if (!cell) continue;
  
      const dayNum = cell.querySelector(".day-nummber");
      if (dayNum) dayNum.textContent = String(i);
  
      const dateStr = `${calendar.year}-${pad(calendar.month + 1)}-${pad(i)}`;
      cell.setAttribute("data-date", dateStr);
  
      const today = new Date();
      const isToday =
        today.getFullYear() === calendar.year &&
        today.getMonth() === calendar.month &&
        today.getDate() === i;
  
      if (isToday) cell.classList.add("today");
  
      if (new Date(dateStr).getTime() < today.setHours(0, 0, 0, 0)) {
        cell.classList.add("disabled");
      }
  
      const hasEvent = calendar.events.some((e) => e.date === dateStr);
      if (hasEvent) cell.classList.add("has-event");
  
      if (calendar.selectedDate === dateStr) {
        cell.classList.add("selected");
      }
    }
  }
  
  export function nextMonth() {
    calendar.month++;
    if (calendar.month > 11) {
      calendar.month = 0;
      calendar.year++;
    }
    renderCalendar();
  }
  
  export function prevMonth() {
    calendar.month--;
    if (calendar.month < 0) {
      calendar.month = 11;
      calendar.year--;
    }
    renderCalendar();
  }
  
  export function initDateClicking() {
    $$(".calendar-day").forEach((day) => {
      day.addEventListener("click", () => {
        if (day.classList.contains("disabled")) return;
  
        const date = day.getAttribute("data-date");
        if (!date) return;
  
        calendar.selectedDate = date;
  
        $("#selectedDate")!.setAttribute("value", date);
  
        $$(".calendar-day").forEach((d) => d.classList.remove("selected"));
        day.classList.add("selected");
  
        renderTimeSlots();
        updateStep3ServiceSummary();
      });
    });
  }
  
export function formatTimeFromMinutes(minutes: number): string {
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const period = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
  }
  
  export function generateTimeSlots(startHour: number, endHour: number, stepMinutes = 30): string[] {
    const slots: string[] = [];
    for (let minutes = startHour * 60; minutes <= endHour * 60; minutes += stepMinutes) {
      slots.push(formatTimeFromMinutes(minutes));
    }
    return slots;
  }
  
  // 8:00 AM to 5:00 PM in 30-minute increments
  export const TIME_SLOTS = generateTimeSlots(8, 17, 30);
  
export function timeToMinutes(time: string): number {
  const [raw, period] = time.split(" ");
  const [hRaw, mRaw] = raw.split(":").map(Number);
  let h = hRaw;
  const m = mRaw;

  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;

  return h * 60 + m;
}
  
export function renderTimeSlots() {
  const grid = $(".grid");
  if (!grid) return;

  grid.innerHTML = "";

  if (!calendar.selectedDate) return;

    const selectedDateObj = calendar.selectedDate;
  const selectedDate = new Date(`${calendar.selectedDate}T00:00:00`);
  const month = selectedDate.getMonth(); // 0-based
  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
  const showroomSelected = isShowroomDetailSelected();
  const showroomLimited = showroomSelected && !isWeekend && !(month === 5 || month === 6); // limit on weekdays outside June/July

  const slots = showroomLimited ? generateTimeSlots(8, 15, 30) : TIME_SLOTS;

  const availableTimesLabel = $("#available-times-label");
  if (availableTimesLabel) {
    availableTimesLabel.textContent = calendar.selectedDate
      ? `Available times for ${selectedDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`
      : "Select a date to see available times";
  }

  // clear previous time selection
  calendar.selectedTime = "";
  $("#selectedTime")?.setAttribute("value", "");
  $$(".time-slot").forEach((s) => s.classList.remove("is-selected", "selected"));

  for (const t of slots) {
    const btn = document.createElement("div");
    btn.className = "time-slot";
    btn.textContent = t;

    const start = timeToMinutes(t);
      const evt = calendar.events.find((e) => e.date === selectedDateObj);
  
      let disabled = false;
  
      if (evt) {
        const overlap =
          (start >= evt.start && start < evt.end) ||
          (start + 30 > evt.start && start + 30 <= evt.end);
        if (overlap) disabled = true;
      }
  
      if (disabled) {
        btn.classList.add("disabled");
      }
  
    btn.addEventListener("click", () => {
      if (btn.classList.contains("disabled")) return;

      calendar.selectedTime = t;
      $("#selectedTime")!.setAttribute("value", t);

      $$(".time-slot").forEach((s) => s.classList.remove("is-selected", "selected"));
      btn.classList.add("is-selected");

      updateStep3ServiceSummary();
    });
  
      grid.appendChild(btn);
    }
  }
  
export function updateStep3ServiceSummary() {
  const dateEl = $("#summary-date");
  const timeEl = $("#summary-time");
  const serviceEl = $("#summary-service");
  const durEl = $("#summary-duration");
  const durationInfo = $("#duration-info");

  if (dateEl) {
    if (calendar.selectedDate) {
      const d = new Date(`${calendar.selectedDate}T00:00:00`);
      dateEl.textContent = d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } else {
      dateEl.textContent = "Select a date";
    }
  }

  const { name, durationLabel, range } = getSelectedServiceInfo();
  if (serviceEl) serviceEl.textContent = name;
  if (durEl) durEl.textContent = durationLabel || "—";

  if (timeEl) {
    if (calendar.selectedTime) {
      const startMins = timeToMinutes(calendar.selectedTime);
      const endMins = startMins + range.max;
      const endTime = formatTimeFromMinutes(endMins);
      timeEl.textContent = `${calendar.selectedTime} - ${endTime}`;
    } else {
      timeEl.textContent = "Select a time";
    }
  }

  if (durationInfo) {
    if (calendar.selectedTime) {
      const startMins = timeToMinutes(calendar.selectedTime);
      const endMins = startMins + range.max;
      const endTime = formatTimeFromMinutes(endMins);
      const labelText = durationLabel || "this service";
      durationInfo.textContent = `Your ${name} service will take approximately ${labelText}. We'll arrive at ${calendar.selectedTime} and complete the service by ${endTime}.`;
    } else {
      durationInfo.textContent = "Please select a time to see your service schedule.";
    }
  }

  updateOrderSummaryCard();
}
  
  export function initCalendarSystem() {
    renderCalendar();
    initDateClicking();
  
    $("#nextMonth")?.addEventListener("click", nextMonth);
    $("#prevMonth")?.addEventListener("click", prevMonth);
  }
  
  export function validateRequiredField(id: string): boolean {
    const el = $<HTMLInputElement>(`#${id}`);
    if (!el) return false;
  
    const valid = el.value.trim().length > 0;
    el.classList.toggle("input-error", !valid);
  
    return valid;
  }
  
  export function validateEmail(id: string): boolean {
    const el = $<HTMLInputElement>(`#${id}`);
    if (!el) return false;
  
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
    el.classList.toggle("input-error", !valid);
  
    return valid;
  }
  
  export function validatePhone(id: string): boolean {
    const el = $<HTMLInputElement>(`#${id}`);
    if (!el) return false;
  
    const digits = el.value.replace(/\D/g, "");
    const valid = digits.length >= 10;
    el.classList.toggle("input-error", !valid);
  
    return valid;
  }
  
  export function validateZip(id: string): boolean {
    const el = $<HTMLInputElement>(`#${id}`);
    if (!el) return false;
  
  const valid = /^\d{5}$/.test(el.value.trim());
  el.classList.toggle("input-error", !valid);

  return valid;
}

export function getServiceAddressFields(): ServiceAddress {
  return {
    street: $<HTMLInputElement>("#street-address")?.value?.trim() ?? "",
    city: $<HTMLInputElement>("#city")?.value?.trim() ?? "",
    state: $<HTMLInputElement>("#state")?.value?.trim() ?? "",
    zip: $<HTMLInputElement>("#zip-code")?.value?.trim() ?? "",
  };
}

export function getCustomerContact() {
  const firstName = $<HTMLInputElement>("#first-name")?.value?.trim() ?? "";
  const lastName = $<HTMLInputElement>("#last-name")?.value?.trim() ?? "";
  const email = $<HTMLInputElement>("#email-address")?.value?.trim() ?? "";

  return { firstName, lastName, email };
}

export function getBookingPaymentSummary(): BookingPaymentSummary {
  const { pkgName, addons, total } = getSelectedPackageAndAddons();
  const deposit = calculateDeposit(total);
  const address = getServiceAddressFields();
  const { firstName, lastName, email } = getCustomerContact();
  const customerName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return {
    packageName: pkgName,
    addons: addons.map((a) => a.name),
    total,
    deposit,
    balance: Math.max(total - deposit, 0),
    dateTimeText: formatDateTimeForSummary(),
    vehicleLine: formatVehicleLine(),
    customerName,
    email,
    serviceAddress: address,
  };
}

export function broadcastPaymentSummary(): BookingPaymentSummary | null {
  if (typeof document === "undefined") return null;
  const detail = getBookingPaymentSummary();
  document.dispatchEvent(
    new CustomEvent<BookingPaymentSummary>(PAYMENT_SUMMARY_EVENT, { detail })
  );
  return detail;
}
    
  export async function geocodeAddress(): Promise<{ lat: number; lng: number } | null> {
    const street = $<HTMLInputElement>("#street-address")?.value ?? "";
    const city = $<HTMLInputElement>("#city")?.value ?? "";
    const state = $<HTMLInputElement>("#state")?.value ?? "";
    const zip = $<HTMLInputElement>("#zip-code")?.value ?? "";
  
    const fullAddress = `${street}, ${city}, ${state} ${zip}`;
  
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      fullAddress
    )}&key=${window.DG_GMAPS_API_KEY}`;
  
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
  
      const data = await res.json();
      if (!data.results?.length) return null;
  
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    } catch {
      return null;
    }
  }
    
  export function haversineDistanceMiles(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 3958.8;
  
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c;
  }
  
  
  export async function checkServiceArea(): Promise<boolean> {
    const result = await geocodeAddress();
    if (!result) return false;
  
    const miles = haversineDistanceMiles(
      window.DG_SERVICE_CENTER_LAT,
      window.DG_SERVICE_CENTER_LNG,
      result.lat,
      result.lng
    );
  
    return miles <= 25;
  }
    
  export async function updateServiceAreaWarning() {
    const block = $<HTMLElement>(".flex-block-349"); // the yellow warning container
    if (!block) return;
  
    block.style.display = "none";
  
    const ok = await checkServiceArea();
    if (!ok) {
      block.style.display = "flex";
    }
  }
  
  export async function validateContactInfo(): Promise<boolean> {
    const valid =
      validateRequiredField("first-name") &&
      validateRequiredField("last-name") &&
      validatePhone("phone-number") &&
      validateEmail("email-address") &&
      validateRequiredField("street-address") &&
      validateRequiredField("city") &&
      validateRequiredField("state") &&
      validateZip("zip-code");
  
    if (!valid) return false;
  
    await updateServiceAreaWarning();
  
    const insideArea = await checkServiceArea();
    if (!insideArea) {
      return false;
    }
  
    return true;
  }
  

  export function initContactInfoStep() {
  [
    "first-name",
    "last-name",
    "phone-number",
    "email-address",
      "street-address",
      "city",
      "state",
      "zip-code",
    ].forEach((id) => {
      $(`#${id}`)?.addEventListener("blur", () => {
        validateContactInfo();
        updateOrderSummaryCard();
      });
    });

    ["vehicle-year", "vehicle-make", "vehicle-model", "vehicle-color"].forEach((id) => {
      $(`#${id}`)?.addEventListener("blur", () => updateOrderSummaryCard());
    });
  
  ["street-address", "city", "state", "zip-code"].forEach((id) => {
    $(`#${id}`)?.addEventListener(
      "input",
      debounce(() => {
          updateServiceAreaWarning();
          updateOrderSummaryCard();
        }, 500)
      );
    });
  }
    
  export function debounce(fn: (...args: unknown[]) => void, delay: number) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: unknown[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

declare global {
    interface Window {
      DG_SERVICE_CENTER_LAT: number;
      DG_SERVICE_CENTER_LNG: number;
      DG_GMAPS_API_KEY: string;
    }
  }

function formatDateTimeForSummary(): string {
  if (!calendar.selectedDate) return "Select a date & time";

  const d = new Date(`${calendar.selectedDate}T00:00:00`);
  const dateText = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (calendar.selectedTime) return `${dateText} at ${calendar.selectedTime}`;
  return dateText;
}

function formatAddressLine(): string {
  const street = $<HTMLInputElement>("#street-address")?.value?.trim() ?? "";
  const city = $<HTMLInputElement>("#city")?.value?.trim() ?? "";
  const state = $<HTMLInputElement>("#state")?.value?.trim() ?? "";
  const zip = $<HTMLInputElement>("#zip-code")?.value?.trim() ?? "";
  const parts = [street, city, state, zip].filter(Boolean);
  return parts.join(", ") || "Add your service address";
}

function formatVehicleLine(): string {
  const year = $<HTMLInputElement>("#vehicle-year")?.value?.trim() ?? "";
  const make = $<HTMLInputElement>("#vehicle-make")?.value?.trim() ?? "";
  const model = $<HTMLInputElement>("#vehicle-model")?.value?.trim() ?? "";
  const color = $<HTMLInputElement>("#vehicle-color")?.value?.trim() ?? "";
  const type = detectVehicleType();
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

  const main = [year, make, model].filter(Boolean).join(" ").trim();
  const extra = color ? `, ${color}` : "";
  const withType = main ? `${main}${extra} (${typeLabel})` : `Vehicle (${typeLabel})`;
  return withType || "Add vehicle details";
}

export function updateOrderSummaryCard() {
  const { pkgName, pkgPrice, addons, total } = getSelectedPackageAndAddons();

  const serviceNameEl = $("#order-service-name");
  const servicePriceEl = $("#order-service-price");
  const serviceSubtitleEl = $("#order-service-subtitle");
  const addonsContainer = $("#order-addons");

  if (serviceNameEl) serviceNameEl.textContent = pkgName;
  if (servicePriceEl) servicePriceEl.textContent = `$${pkgPrice}`;
  if (serviceSubtitleEl) {
    serviceSubtitleEl.textContent = pkgName !== "No package selected" ? "Selected service" : "";
  }

  if (addonsContainer) {
    addonsContainer.innerHTML = "";
    if (addons.length === 0) {
      const empty = document.createElement("div");
      empty.className = "order-line-subtitle";
      empty.textContent = "No add-ons selected";
      addonsContainer.appendChild(empty);
    } else {
      addons.forEach((addon) => {
        const line = document.createElement("div");
        line.className = "order-line";

        const text = document.createElement("div");
        text.className = "order-line-text";

        const title = document.createElement("div");
        title.className = "order-line-title";
        title.textContent = addon.name;

        const sub = document.createElement("div");
        sub.className = "order-line-subtitle";
        sub.textContent = "Add-on service";

        text.appendChild(title);
        text.appendChild(sub);

        const price = document.createElement("div");
        price.className = "order-line-price";
        price.textContent = `$${addon.price}`;

        line.appendChild(text);
        line.appendChild(price);

        addonsContainer.appendChild(line);
      });
    }
  }

  const dateTimeEl = $("#order-date-time");
  if (dateTimeEl) dateTimeEl.textContent = formatDateTimeForSummary();

  const addrEl = $("#order-address");
  if (addrEl) addrEl.textContent = formatAddressLine();

  const vehicleEl = $("#order-vehicle");
  if (vehicleEl) vehicleEl.textContent = formatVehicleLine();

  updateCostSummaryDisplay(total);
  broadcastPaymentSummary();
}

function updateCostSummaryDisplay(total: number) {
  const deposit = calculateDeposit(total);
  const balance = Math.max(total - deposit, 0);

  const serviceTotalEl = $("#cost-service-total");
  const depositEl = $("#cost-deposit");
  const balanceEl = $("#cost-balance");
  const depositAmountDisplayEl = $("#deposit-amount-display");
  const depositBalanceDisplayEl = $("#deposit-balance-display");
  const termsDepositEl = $("#terms-deposit-amount");

  if (serviceTotalEl) serviceTotalEl.textContent = `$${total.toFixed(2)}`;
  if (depositEl) depositEl.textContent = `$${deposit.toFixed(2)}`;
  if (balanceEl) balanceEl.textContent = `$${balance.toFixed(2)}`;
  if (depositAmountDisplayEl) depositAmountDisplayEl.textContent = `$${deposit.toFixed(2)}`;
  if (depositBalanceDisplayEl) depositBalanceDisplayEl.textContent = `$${balance.toFixed(2)}`;
  if (termsDepositEl) termsDepositEl.textContent = `$${deposit.toFixed(2)}`;
}
  

  export function calculateDeposit(total: number): number {
    return total >= 200 ? 40 : 20;
  }

export function initButtons() {
    $$("[data-next]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
  
        if (stepState.current === 1) {
          detectVehicleType();
          renderStep2Prices();
        }
  
        if (stepState.current === 2) {
          const chosen = document.querySelector<HTMLInputElement>(
            "input[name='Service']:checked"
          );
          if (!chosen) {
            alert("Please select a service package.");
            return;
          }
          updateSelectionSummary();
        }
  
        if (stepState.current === 3) {
          if (!calendar.selectedDate) {
            alert("Please select a date.");
            return;
          }
          if (!calendar.selectedTime) {
            alert("Please select a time.");
            return;
          }
        }
  
        if (stepState.current === 4) {
          const ok = await validateContactInfo();
          if (!ok) return;
          updateOrderSummaryCard();
        }

        goNextStep();
      });
    });
  
    $$("[data-back]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        goPrevStep();
      });
    });
  }
  
  export function initLivePriceUpdates() {
  $$("input[name='Service']").forEach((radio) => {
    radio.addEventListener("change", () => {
      updateSelectionSummary();
      updateStep3Summary();
      renderStep2Prices();
      // Refresh available times if a date is already selected (e.g., Show Room Detail limits weekday slots)
      if (calendar.selectedDate) {
        calendar.selectedTime = "";
        renderTimeSlots();
      }
      updateOrderSummaryCard();
    });
  });

  $$("input[type='checkbox']").forEach((cb) => {
    cb.addEventListener("change", () => {
      updateSelectionSummary();
      updateStep3Summary();
      updateOrderSummaryCard();
    });
  });
  
    $("#vehicle-type")?.addEventListener("change", () => {
      detectVehicleType();
      renderStep2Prices();
      updateSelectionSummary();
      updateOrderSummaryCard();
    });
  }
  
  export function initBookingSystem() {
    initStepSystem();
    initButtons();
  
    initLivePriceUpdates();
    renderStep2Prices();
    updateSelectionSummary();
  
  initCalendarSystem();
  updateStep3ServiceSummary();

  initContactInfoStep();

  updateOrderSummaryCard();
  
  console.log("%cBooking System Initialized", "color: #00aaff; font-size: 18px;");
}
  
  if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
      try {
        initBookingSystem();
      } catch (err) {
        console.error("Booking init failed:", err);
      }
    });
  }
