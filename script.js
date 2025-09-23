feather.replace();

const wednesdayItems = [
  { duration: 20, name: "Rehraas" },
  { duration: 35, name: "Simran" },
  { duration: 20, name: "Gurbani Vichar" },
  { duration: 20, name: "Kirtan" },
  { duration: 20, name: "Kirtan" },
  { duration: -1, name: "Ardaas" },
  { duration: -1, name: "Hukamnama" },
  { duration: -1, name: "Kirtan Sohila" },
];

const saturdayItems = [
  { duration: 50, name: "Simran" },
  { duration: 40, name: "Gurbani Vichar" },
  { duration: 20, name: "Rehraas" },
  { duration: 20, name: "Kirtan" },
  { duration: 20, name: "Kirtan" },
  { duration: 20, name: "Kirtan" },
  { duration: 20, name: "Kirtan" },
  { duration: -1, name: "Ardaas" },
  { duration: -1, name: "Hukamnama" },
  { duration: -1, name: "Kirtan Sohila" },
];

// Generate button removed — schedule will auto-generate
document.getElementById("copy-btn").addEventListener("click", copyToClipboard);

// Auto-generate when start-time or day changes
document.getElementById("start-time").addEventListener("input", () => {
  generateSchedule();
});
document.getElementById("day-selector").addEventListener("change", () => {
  // set sensible default start time per day before generating
  const day = document.getElementById("day-selector").value;
  setDefaultStartForDay(day);
  generateSchedule();
});

// initial render
window.addEventListener("load", () => {
  const day = document.getElementById("day-selector").value;
  setDefaultStartForDay(day);
  generateSchedule();
});

function generateSchedule() {
  const startTime = document.getElementById("start-time").value;
  if (!startTime) {
    alert("Please set a start time first");
    return;
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const selectedDay = document.getElementById("day-selector").value;
  const items = selectedDay === "wednesday" ? wednesdayItems : saturdayItems;

  generateDaySchedule(selectedDay, items, startHour, startMinute);

  document.getElementById("schedule-title").textContent = `${
    selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)
  } Sangat`;

  document.getElementById("schedule-container").classList.remove("hidden");
  document.getElementById("output-container").classList.remove("hidden");

  generateTextOutput(items);
}

function generateDaySchedule(day, items, startHour, startMinute) {
  const container = document.getElementById("schedule-items");
  container.innerHTML = "";

  let currentHour = startHour;
  let currentMinute = startMinute;

  items.forEach((item, index) => {
    const startTime = `${currentHour
      .toString()
      .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    let endTime = "";
    if (item.duration >= 0) {
      let endHour = currentHour;
      let endMinute = currentMinute + item.duration;

      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute = endMinute % 60;
      }

      endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`;
      currentHour = endHour;
      currentMinute = endMinute;
    }

    const itemDiv = document.createElement("div");
    itemDiv.className =
      "schedule-item bg-gray-50 p-4 rounded-lg border border-gray-200";

    itemDiv.innerHTML = `
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div class="flex-1">
                        <h3 class="font-medium text-gray-800">${item.name}</h3>
                        ${
                          item.duration >= 0
                            ? `<span class="text-sm text-gray-500" data-duration-label="${index}">${item.duration} minutes</span>`
                            : ""
                        }
                    </div>
                    <div class="flex items-center gap-3 flex-wrap">
            ${
              item.duration >= 0
                ? `
              <div class="flex items-center gap-2 flex-wrap">
                <div class="flex items-center gap-1">
                  <button type="button" data-decrement-start="${index}" class="text-xs px-2 py-1 bg-gray-100 rounded">-5</button>
                  <input type="time" data-start-index="${index}" value="${startTime}" class="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-28 min-w-[6.5rem]">
                  <button type="button" data-increment-start="${index}" class="text-xs px-2 py-1 bg-gray-100 rounded">+5</button>
                </div>
                <span class="text-sm text-gray-400">to</span>
                <div class="flex items-center gap-1">
                  <button type="button" data-decrement-end="${index}" class="text-xs px-2 py-1 bg-gray-100 rounded">-5</button>
                  <input type="time" data-end-index="${index}" value="${endTime}" class="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-28 min-w-[6.5rem]">
                  <button type="button" data-increment-end="${index}" class="text-xs px-2 py-1 bg-gray-100 rounded">+5</button>
                </div>
              </div>
            `
                : ""
            }
            <input type="text" data-index="${index}" placeholder="Sevadar name" class="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 flex-1 min-w-0">
            <button type="button" data-delete-index="${index}" title="Delete item" class="ml-2 text-xs px-2 py-1 bg-red-100 text-red-600 rounded">
              <i data-feather="trash-2" class="w-4 h-4"></i>
            </button>
                    </div>
                </div>
            `;

    // store computed start/end on the element for later recompute
    itemDiv.dataset.index = index;
    if (startTime) itemDiv.dataset.computedStart = startTime;
    if (endTime) itemDiv.dataset.computedEnd = endTime;
    // expose duration on element for quick lookup
    if (typeof item.duration !== "undefined")
      itemDiv.dataset.duration = String(item.duration);

    container.appendChild(itemDiv);
  });

  // helper: recompute following items when an item's time changes
  function recomputeFollowing(changedIndex) {
    // start from the changedIndex; determine its end time then propagate
    const children = Array.from(container.children);
    // find starting time for propagation
    let startHour = 0,
      startMinute = 0;
    // if changed item has an end input, use that; otherwise if it has a start input, use its end computed via duration
    const changedEl = children.find(
      (c) => Number(c.dataset.index) === Number(changedIndex)
    );
    if (!changedEl) return;

    const startInp = changedEl.querySelector(
      `input[data-start-index="${changedIndex}"]`
    );
    const endInp = changedEl.querySelector(
      `input[data-end-index="${changedIndex}"]`
    );

    if (endInp && endInp.value) {
      [startHour, startMinute] = endInp.value.split(":").map(Number);
      // update the duration for the changedIndex based on start input if available
      if (startInp && startInp.value) {
        const [sh, sm] = startInp.value.split(":").map(Number);
        const newDur = startHour * 60 + startMinute - (sh * 60 + sm);
        // persist to items array and element dataset
        items[changedIndex].duration = newDur;
        changedEl.dataset.duration = String(newDur);
        const label = changedEl.querySelector(
          `[data-duration-label="${changedIndex}"]`
        );
        if (label) label.textContent = `${newDur} minutes`;
      }
    } else if (startInp && startInp.value) {
      // compute end from duration
      const dur =
        items[changedIndex].duration > 0 ? items[changedIndex].duration : 0;
      let sh = Number(startInp.value.split(":")[0]);
      let sm = Number(startInp.value.split(":")[1]);
      let total = sh * 60 + sm + dur;
      if (total >= 24 * 60) total = 24 * 60 - 1;
      startHour = Math.floor(total / 60);
      startMinute = total % 60;
    } else if (changedEl.dataset.computedEnd) {
      [startHour, startMinute] = changedEl.dataset.computedEnd
        .split(":")
        .map(Number);
    } else {
      return;
    }

    // propagate to subsequent items
    for (let i = Number(changedIndex) + 1; i < items.length; i++) {
      const el = children.find((c) => Number(c.dataset.index) === i);
      if (!el) continue;
      const si = el.querySelector(`input[data-start-index="${i}"]`);
      const ei = el.querySelector(`input[data-end-index="${i}"]`);

      // set start
      const newStartH = String(startHour).padStart(2, "0");
      const newStartM = String(startMinute).padStart(2, "0");
      if (si) si.value = `${newStartH}:${newStartM}`;

      // compute end based on duration (ensure we read any updated dataset value first)
      const dur =
        typeof items[i].duration === "number" && items[i].duration >= 0
          ? items[i].duration
          : 0;
      let total = startHour * 60 + startMinute + dur;
      if (total >= 24 * 60) total = 24 * 60 - 1;
      const newEndH = Math.floor(total / 60);
      const newEndM = total % 60;
      if (ei)
        ei.value = `${String(newEndH).padStart(2, "0")}:${String(
          newEndM
        ).padStart(2, "0")}`;

      // update the element dataset's computed times
      el.dataset.computedStart = `${String(startHour).padStart(
        2,
        "0"
      )}:${String(startMinute).padStart(2, "0")}`;
      el.dataset.computedEnd = `${String(newEndH).padStart(2, "0")}:${String(
        newEndM
      ).padStart(2, "0")}`;

      // update for next
      startHour = newEndH;
      startMinute = newEndM;
    }
  }
  // expose for delegated listeners
  container.recomputeFollowing = recomputeFollowing;
  // ensure icons render for any newly added trash buttons
  feather.replace();
}

// PURE: no event listeners added here
function generateTextOutput(items) {
  const selectedDay = document.getElementById("day-selector").value;
  let output = ``;

  let currentTime = document
    .getElementById("start-time")
    .value.split(":")
    .map(Number);
  let currentHour = currentTime[0];
  let currentMinute = currentTime[1];

  items.forEach((item, index) => {
    const personInput = document.querySelector(`input[data-index="${index}"]`);
    const personName = personInput ? personInput.value : "";

    const startInput = document.querySelector(
      `input[data-start-index="${index}"]`
    );
    const endInput = document.querySelector(`input[data-end-index="${index}"]`);

    let formattedStart = "";
    let formattedEnd = "";

    function to12Hour(h, m) {
      const hour = Number(h);
      const minute = Number(m);
      const ampm = hour >= 12 ? "PM" : "AM";
      const h12 = hour % 12 === 0 ? 12 : hour % 12;
      return `${h12}:${String(minute).padStart(2, "0")} ${ampm}`;
    }

    // determine start
    if (startInput && startInput.value) {
      const [sh, sm] = startInput.value.split(":").map(Number);
      formattedStart = to12Hour(sh, sm);
    } else {
      formattedStart = to12Hour(currentHour, currentMinute);
    }

    // determine end
    if (endInput && endInput.value) {
      const [eh, em] = endInput.value.split(":").map(Number);
      formattedEnd = to12Hour(eh, em);
      currentHour = eh;
      currentMinute = em;
    } else if (item.duration >= 0) {
      let endHour = currentHour;
      let endMinute =
        currentMinute +
        (typeof item.duration === "number" && item.duration >= 0
          ? item.duration
          : 0);
      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute = endMinute % 60;
      }
      formattedEnd = to12Hour(endHour, endMinute);
      currentHour = endHour;
      currentMinute = endMinute;
    }

    if (item.duration >= 0) {
      output += `${formattedStart}-${formattedEnd} ${item.name}${
        personName ? `: ${personName}` : ""
      }\n`;
    } else {
      output += `${item.name}${personName ? `: ${personName}` : ""}\n`;
    }
  });

  document.getElementById("text-output").value = output;
}

// Delegated listener: attaches ONCE
document.getElementById("schedule-items").addEventListener("input", (e) => {
  if (e.target.matches('input[type="time"], input[type="text"]')) {
    const selectedDay = document.getElementById("day-selector").value;
    const items = selectedDay === "wednesday" ? wednesdayItems : saturdayItems;

    // if a time input changed, auto-shift following items and persist duration
    if (e.target.matches('input[type="time"]')) {
      const startAttr = e.target.getAttribute("data-start-index");
      const endAttr = e.target.getAttribute("data-end-index");
      const changedIndex =
        startAttr !== null
          ? Number(startAttr)
          : endAttr !== null
          ? Number(endAttr)
          : null;

      // If both start and end inputs exist for this item, compute new duration and persist
      const container = document.getElementById("schedule-items");
      const changedEl = Array.from(container.children).find(
        (c) => Number(c.dataset.index) === changedIndex
      );
      if (changedEl) {
        const sInp = changedEl.querySelector(
          `input[data-start-index="${changedIndex}"]`
        );
        const eInp = changedEl.querySelector(
          `input[data-end-index="${changedIndex}"]`
        );
        if (sInp && eInp && sInp.value && eInp.value) {
          const [sh, sm] = sInp.value.split(":").map(Number);
          const [eh, em] = eInp.value.split(":").map(Number);
          let newDur = eh * 60 + em - (sh * 60 + sm);
          if (newDur < 0) newDur = 0;
          items[changedIndex].duration = newDur;
          changedEl.dataset.duration = String(newDur);
          const label = changedEl.querySelector(
            `[data-duration-label="${changedIndex}"]`
          );
          if (label) label.textContent = `${newDur} minutes`;
        }
      }

      // recompute following items to keep continuity
      if (container && typeof container.recomputeFollowing === "function") {
        container.recomputeFollowing(changedIndex);
      } else {
        // as fallback, trigger full regenerate and then output
        generateSchedule();
      }
    }

    generateTextOutput(items);
  }
});

// Delegated click handler for +/- buttons
document.getElementById("schedule-items").addEventListener("click", (e) => {
  const btn = e.target;
  if (!btn) return;
  // deletion handler
  if (btn.hasAttribute("data-delete-index")) {
    const delIndex = Number(btn.getAttribute("data-delete-index"));
    const selectedDay = document.getElementById("day-selector").value;
    let removed = null;
    if (selectedDay === "wednesday") {
      removed = wednesdayItems.splice(delIndex, 1)[0];
    } else {
      removed = saturdayItems.splice(delIndex, 1)[0];
    }
    // push to undo stack
    window.__undoStack = window.__undoStack || [];
    window.__undoStack.push({
      day: selectedDay,
      index: delIndex,
      item: removed,
    });
    // enable both undo buttons
    const undoBtn = document.getElementById("undo-btn");
    const undoBtnTop = document.getElementById("undo-btn-top");
    if (undoBtn) undoBtn.disabled = false;
    if (undoBtnTop) undoBtnTop.disabled = false;
    // regenerate schedule after deletion
    generateSchedule();
    return;
  }

  const attr = Array.from(btn.attributes)
    .map((a) => a.name)
    .find(
      (n) =>
        n && (n.startsWith("data-increment") || n.startsWith("data-decrement"))
    );
  if (!attr) return;

  // Determine which index and whether start or end
  const parts = attr.split("-"); // e.g., data-increment-start -> ['data','increment','start']
  const mode = parts[1]; // increment or decrement
  const which = parts[2]; // start or end
  const index = btn.getAttribute(attr);
  if (index === null) return;

  const inputSelector =
    which === "start"
      ? `input[data-start-index="${index}"]`
      : `input[data-end-index="${index}"]`;
  const timeInput = document.querySelector(inputSelector);
  if (!timeInput) return;

  // Parse time HH:MM
  const [h, m] = timeInput.value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return;

  let totalMinutes = h * 60 + m + (mode === "increment" ? 5 : -5);
  if (totalMinutes < 0) totalMinutes = 0;
  if (totalMinutes > 23 * 60 + 59) totalMinutes = 23 * 60 + 59;

  const newH = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const newM = (totalMinutes % 60).toString().padStart(2, "0");
  timeInput.value = `${newH}:${newM}`;

  // after adjusting time, recompute and persist duration for this item if both start and end exist
  const selectedDay = document.getElementById("day-selector").value;
  const items = selectedDay === "wednesday" ? wednesdayItems : saturdayItems;

  const idx = Number(index);
  const container = document.getElementById("schedule-items");
  const el = Array.from(container.children).find(
    (c) => Number(c.dataset.index) === idx
  );
  if (el) {
    const sInp = el.querySelector(`input[data-start-index="${idx}"]`);
    const eInp = el.querySelector(`input[data-end-index="${idx}"]`);
    if (sInp && eInp && sInp.value && eInp.value) {
      const [sh, sm] = sInp.value.split(":").map(Number);
      const [eh, em] = eInp.value.split(":").map(Number);
      let newDur = eh * 60 + em - (sh * 60 + sm);
      if (newDur < 0) newDur = 0;
      items[idx].duration = newDur;
      el.dataset.duration = String(newDur);
      const label = el.querySelector(`[data-duration-label="${idx}"]`);
      if (label) label.textContent = `${newDur} minutes`;
    }

    // call recomputeFollowing to propagate the change
    if (container && typeof container.recomputeFollowing === "function") {
      container.recomputeFollowing(idx);
    } else {
      generateSchedule();
    }
  }

  generateTextOutput(items);
});

// Undo logic (reusable)
function performUndo() {
  window.__undoStack = window.__undoStack || [];
  const last = window.__undoStack.pop();
  if (!last) return;
  const { day, index, item } = last;
  if (day === "wednesday") {
    wednesdayItems.splice(index, 0, item);
    document.getElementById("day-selector").value = "wednesday";
  } else {
    saturdayItems.splice(index, 0, item);
    document.getElementById("day-selector").value = "saturday";
  }
  // regenerate schedule
  generateSchedule();
  // disable both undo buttons if stack empty
  const undoBtn = document.getElementById("undo-btn");
  const undoBtnTop = document.getElementById("undo-btn-top");
  if (!window.__undoStack.length) {
    if (undoBtn) undoBtn.disabled = true;
    if (undoBtnTop) undoBtnTop.disabled = true;
  }
}

// wire both undo buttons
const _undoBtn = document.getElementById("undo-btn");
if (_undoBtn) _undoBtn.addEventListener("click", performUndo);
const _undoBtnTop = document.getElementById("undo-btn-top");
if (_undoBtnTop) _undoBtnTop.addEventListener("click", performUndo);

// set initial default based on currently selected day
(function initDefaultStart() {
  const day = document.getElementById("day-selector").value;
  setDefaultStartForDay(day);
})();
function setDefaultStartForDay(day) {
  const startInput = document.getElementById("start-time");
  if (!startInput) return;
  if (day === "wednesday") {
    startInput.value = "18:00";
  } else if (day === "saturday") {
    startInput.value = "15:30";
  }
}

function copyToClipboard() {
  const output = document.getElementById("text-output");
  output.select();
  document.execCommand("copy");

  const copyBtn = document.getElementById("copy-btn");
  const originalText = copyBtn.innerHTML;
  copyBtn.innerHTML = '<i data-feather="check" class="w-4 h-4"></i> Copied!';
  feather.replace();

  setTimeout(() => {
    copyBtn.innerHTML = originalText;
    feather.replace();
  }, 2000);
}
