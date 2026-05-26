const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_CUSTOM_DAYS = 1000000;
const milestoneDays = [10000, 20000, 30000];

const form = document.querySelector("#birthday-form");
const birthdateInput = document.querySelector("#birthdate");
const customDaysInput = document.querySelector("#custom-days");
const statusText = document.querySelector("#status");
const summary = document.querySelector("#summary");
const todayDays = document.querySelector("#today-days");
const todayDate = document.querySelector("#today-date");
const customResult = document.querySelector("#custom-result");
const customLabel = document.querySelector("#custom-label");
const customDate = document.querySelector("#custom-date");

function parseDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
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
  return `${parts.year}年${parts.month}月${parts.day}日`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function parseCustomDays(value) {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (!/^\d+$/.test(trimmed)) return Number.NaN;
  return Number(trimmed);
}

function formatInputDate(parts) {
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}

function renderMilestones(birthParts) {
  milestoneDays.forEach((days) => {
    const output = document.querySelector(`#date-${days}`);
    output.value = formatDate(addDays(birthParts, days));
  });
}

function renderCustomDay(birthParts, customDays) {
  if (customDays === null) {
    customResult.hidden = true;
    return;
  }

  customLabel.textContent = `${formatNumber(customDays)}日`;
  customDate.value = formatDate(addDays(birthParts, customDays));
  customResult.hidden = false;
}

function calculate() {
  const birthParts = parseDateInput(birthdateInput.value);
  const customDays = parseCustomDays(customDaysInput.value);

  statusText.textContent = "";
  summary.hidden = true;

  if (!birthParts) {
    statusText.textContent = "生年月日を入力してください。";
    return;
  }

  if (
    customDays !== null &&
    (!Number.isSafeInteger(customDays) || customDays > MAX_CUSTOM_DAYS)
  ) {
    statusText.textContent = "Nは0以上1000000以下の整数で入力してください。";
    return;
  }

  const todayParts = getTodayParts();
  const elapsedDays = diffDays(birthParts, todayParts);

  if (elapsedDays < 0) {
    statusText.textContent = "未来の日付は生年月日として計算できません。";
    return;
  }

  todayDays.value = formatNumber(elapsedDays);
  todayDate.textContent = `${formatDate(todayParts)}時点（誕生日 = 0日目）`;
  renderMilestones(birthParts);
  renderCustomDay(birthParts, customDays);
  summary.hidden = false;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculate();
});

birthdateInput.max = formatInputDate(getTodayParts());
birthdateInput.addEventListener("change", calculate);
customDaysInput.addEventListener("input", () => {
  if (birthdateInput.value) calculate();
});
