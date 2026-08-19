// ==========================================================================
// อัตราภาษีป้ายดึงมาจาก Google Sheet เพื่อให้เจ้าหน้าที่แก้ไขอัตราได้เอง
// โดยไม่ต้องแก้โค้ด — วิธีตั้งค่าดูที่ไฟล์ "คู่มือแก้ไขอัตราภาษี"
// ==========================================================================

const SHEET_ID = "1I691xwuZc-AxHLhSu6UaioMpc_WHT4ZuxGHaZaCvfWA";
const SHEET_NAME = "rates"; // ชื่อแท็บ (tab) ในไฟล์ Google Sheet

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

// ข้อมูลสำรอง (fallback) — ใช้กรณีโหลดจาก Google Sheet ไม่ได้
const FALLBACK_RATES = [
  { code: "1_a", label: "1(ก) อักษรไทยล้วน — ป้ายเคลื่อนที่/เปลี่ยนข้อความได้ (10 บาท)", rate: 10 },
  { code: "1_b", label: "1(ข) อักษรไทยล้วน — ป้ายนอกจาก (ก) (5 บาท)", rate: 5 },
  { code: "2_a", label: "2(ก) ไทยปนต่างประเทศ/ภาพ — ป้ายเคลื่อนที่/เปลี่ยนข้อความได้ (52 บาท)", rate: 52 },
  { code: "2_b", label: "2(ข) ไทยปนต่างประเทศ/ภาพ — ป้ายนอกจาก (ก) (26 บาท)", rate: 26 },
  { code: "3_a", label: "3(ก) ไม่มีอักษรไทย — ป้ายเคลื่อนที่/เปลี่ยนข้อความได้ (52 บาท)", rate: 52 },
  { code: "3_b", label: "3(ข) ไม่มีอักษรไทย — ป้ายนอกจาก (ก) (50 บาท)", rate: 50 },
];
const FALLBACK_MIN_TAX = 200;
const FALLBACK_UNIT_SIZE = 500;

let RATES = FALLBACK_RATES;
let MIN_TAX = FALLBACK_MIN_TAX;
let UNIT_SIZE = FALLBACK_UNIT_SIZE;

function parseCsvLine(line) {
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      cells.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  cells.push(cur);
  return cells.map(c => c.trim());
}

function parseCsv(text) {
  return text.split(/\r?\n/).filter(l => l.trim() !== "").map(parseCsvLine);
}

async function loadRatesFromSheet() {
  const statusEl = document.getElementById("rate-source-status");
  if (SHEET_ID === "ใส่_SPREADSHEET_ID_ตรงนี้") {
    if (statusEl) {
      statusEl.textContent = "ยังไม่ได้เชื่อมต่อ Google Sheet — กำลังใช้อัตราภาษีสำรองในโค้ด";
      statusEl.style.color = "#B45309";
    }
    return;
  }
  try {
    const res = await fetch(SHEET_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("โหลดชีตไม่สำเร็จ: " + res.status);
    const text = await res.text();
    const rows = parseCsv(text);
    const dataRows = rows.slice(1).filter(r => r[0]);

    const newRates = [];
    let newMinTax = FALLBACK_MIN_TAX;
    let newUnitSize = FALLBACK_UNIT_SIZE;

    dataRows.forEach(r => {
      const code = r[0];
      const label = r[1];
      const rate = parseFloat(r[2]);
      if (!code || isNaN(rate)) return;
      if (code === "MIN_TAX") { newMinTax = rate; return; }
      if (code === "UNIT_SIZE") { newUnitSize = rate; return; }
      newRates.push({ code, label, rate });
    });

    if (newRates.length === 0) throw new Error("ไม่พบข้อมูลอัตราภาษีในชีต");

    RATES = newRates;
    MIN_TAX = newMinTax;
    UNIT_SIZE = newUnitSize;

    rebuildCategoryDropdown();
    if (statusEl) {
      statusEl.textContent = "โหลดอัตราภาษีล่าสุดจาก Google Sheet เรียบร้อย (" + new Date().toLocaleString("th-TH") + ")";
      statusEl.style.color = "#166534";
    }
  } catch (err) {
    console.error("โหลดอัตราภาษีจาก Google Sheet ไม่สำเร็จ:", err);
    if (statusEl) {
      statusEl.textContent = "โหลดข้อมูลล่าสุดจาก Google Sheet ไม่สำเร็จ — กำลังใช้อัตราภาษีสำรองในโค้ดแทน กรุณาตรวจสอบอินเทอร์เน็ตหรือแจ้งผู้ดูแลระบบ";
      statusEl.style.color = "#B91C1C";
    }
  }
}

function rebuildCategoryDropdown() {
  const select = document.getElementById("category");
  if (!select) return;
  const prevValue = select.value;
  select.innerHTML = "";
  RATES.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r.code;
    opt.textContent = r.label;
    select.appendChild(opt);
  });
  if (RATES.some(r => r.code === prevValue)) select.value = prevValue;
  calculateTax();
}

function getRateByCode(code) {
  const found = RATES.find(r => r.code === code);
  return found ? found.rate : 0;
}

function toggleQuarterField(){
  const isNew = document.getElementById('isNewSign').checked;
  document.getElementById('quarterField').style.display = isNew ? 'block' : 'none';
  calculateTax();
}

function calculateTax(){
  const widthEl = document.getElementById('width');
  const lengthEl = document.getElementById('length');
  const width = parseFloat(widthEl.value);
  const length = parseFloat(lengthEl.value);
  const category = document.getElementById('category').value;
  const isNewSign = document.getElementById('isNewSign').checked;
  const quarter = isNewSign ? (parseFloat(document.getElementById('quarter').value) || 1.0) : 1.0;

  const errorEl = document.getElementById('size-error');
  const validSize = Number.isFinite(width) && Number.isFinite(length) && width > 0 && length > 0;
  errorEl.style.display = (widthEl.value !== '' || lengthEl.value !== '') && !validSize ? 'block' : 'none';

  const area = validSize ? width * length : 0;
  const baseUnits = area > 0 ? Math.ceil(area / UNIT_SIZE) : 0;

  const rate = getRateByCode(category);

  const annualTax = baseUnits * rate;
  const proratedTax = annualTax * quarter;

  let finalTax = 0;
  let showNotice = false;
  if(proratedTax > 0){
    if(proratedTax < MIN_TAX){ finalTax = MIN_TAX; showNotice = true; }
    else{ finalTax = proratedTax; }
  }

  document.getElementById('area-result').innerText = area.toLocaleString(undefined,{maximumFractionDigits:1});
  document.getElementById('units-result').innerText = baseUnits.toLocaleString();
  document.getElementById('rate-result').innerText = rate;
  document.getElementById('final-tax').innerText = finalTax.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  document.getElementById('min-tax-notice').style.display = showNotice ? 'block' : 'none';
  const noticeTextEl = document.getElementById('min-tax-amount');
  if (noticeTextEl) noticeTextEl.textContent = MIN_TAX.toLocaleString();
}

document.addEventListener('DOMContentLoaded', () => {
  calculateTax();
  loadRatesFromSheet();
});