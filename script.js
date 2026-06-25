const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_CUSTOM_DAYS = 1000000;
const milestoneDays = [7777, 10000, 20000, 30000];

const form = document.querySelector("#birthday-form");
const birthdateInput = document.querySelector("#birthdate");
const customDaysField = document.querySelector("#custom-days-field");
const customDaysInput = document.querySelector("#custom-days");
const statusText = document.querySelector("#status");
const summary = document.querySelector("#summary");
const todayPrefix = document.querySelector("#today-prefix");
const todayDays = document.querySelector("#today-days");
const todaySuffix = document.querySelector("#today-suffix");
const todayDate = document.querySelector("#today-date");
const customResult = document.querySelector("#custom-result");
const customLabel = document.querySelector("#custom-label");
const customDate = document.querySelector("#custom-date");

function normalizeDigits(value) {
  return value.replace(/[０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0),
  );
}

function parseDateInput(value) {
  const digits = normalizeDigits(value.trim());
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec(digits);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function getTodayParts() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

function toUtcTime(parts) {
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function addDays(parts, days) {
  const date = new Date(toUtcTime(parts) + days * MS_PER_DAY);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function diffDays(start, end) {
  return Math.floor((toUtcTime(end) - toUtcTime(start)) / MS_PER_DAY);
}

function formatDate(parts) {
  return `${parts.year}/${parts.month}/${parts.day}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function parseCustomDays(value) {
  if (typeof value !== "string") return null;

  const trimmed = normalizeDigits(value.trim());
  if (trimmed === "") return null;
  if (!/^\d+$/.test(trimmed)) return Number.NaN;
  return Number(trimmed);
}

function renderMilestones(birthParts) {
  milestoneDays.forEach((days) => {
    const output = document.querySelector(`#date-${days}`);
    output.value = formatDate(addDays(birthParts, days));
  });
}

function renderCustomDay(birthParts, customDays) {
  if (!customResult || !customLabel || !customDate) return;

  if (customDays === null) {
    customResult.hidden = true;
    return;
  }

  customLabel.textContent = `${formatNumber(customDays)}ﾆﾁ`;
  customDate.value = formatDate(addDays(birthParts, customDays));
  customResult.hidden = false;
}

function calculate() {
  const birthParts = parseDateInput(birthdateInput.value);
  const customDays = customDaysField?.hidden
    ? null
    : parseCustomDays(customDaysInput?.value);

  statusText.textContent = "";
  summary.hidden = true;

  if (!birthParts) {
    statusText.textContent = "ﾀﾝｼﾞｮｳﾋﾞﾊ 8ｹﾀﾉ ｽｳｼﾞﾃﾞ ﾆｭｳﾘｮｸｼﾃｸﾀﾞｻｲ｡";
    return;
  }

  if (
    customDays !== null &&
    (!Number.isSafeInteger(customDays) || customDays > MAX_CUSTOM_DAYS)
  ) {
    statusText.textContent = "Nﾊ 0ｲｼﾞｮｳ 1,000,000ｲｶﾉ ｾｲｽｳﾃﾞ ﾆｭｳﾘｮｸｼﾃｸﾀﾞｻｲ｡";
    return;
  }

  const todayParts = getTodayParts();
  const elapsedDays = diffDays(birthParts, todayParts);

  todayPrefix.textContent = "ｷｮｳﾊ";
  todayDays.value = formatNumber(elapsedDays);
  todaySuffix.textContent = "ﾆﾁﾒﾃﾞｽ";
  todayDate.textContent = "";

  if (customDaysField) {
    customDaysField.hidden = false;
    form.classList.add("has-custom");
  }
  renderMilestones(birthParts);
  renderCustomDay(birthParts, customDays);
  summary.hidden = false;
}

function sanitizeNumericInput(input) {
  const normalized = normalizeDigits(input.value);
  const digitsOnly = normalized.replace(/\D/g, "");
  if (input.value !== digitsOnly) {
    input.value = digitsOnly;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculate();
});

birthdateInput.addEventListener("input", () => {
  sanitizeNumericInput(birthdateInput);
  if (birthdateInput.value.length === 8) calculate();
});

customDaysInput?.addEventListener("input", () => {
  sanitizeNumericInput(customDaysInput);
  if (birthdateInput.value.length === 8) calculate();
});
