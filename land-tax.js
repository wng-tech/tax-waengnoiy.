// ==========================================================================
// ตารางราคาประเมินสิ่งปลูกสร้าง และตารางค่าเสื่อมราคา ดึงจาก Google Sheet
// เพื่อให้เจ้าหน้าที่แก้ไขได้เอง — วิธีตั้งค่าดูที่ "คู่มือแก้ไขอัตราภาษี"
// ==========================================================================

const LT_DEP_SHEET_ID = "1nwRhZAoW5Pachp3L8HOAl6ttCdRsP8k-MG1nsgtsXU0";   // ไฟล์ตารางค่าเสื่อมราคา
const LT_PRICE_SHEET_ID = "189qmWeGH2nacYbrL9ZZNzErrqhuNIZrOfC7YUPtz-sQ"; // ไฟล์ตารางราคาประเมินสิ่งปลูกสร้าง

// ชื่อแท็บ (tab) ในแต่ละไฟล์ — ถ้าคุณยังไม่ได้เปลี่ยนชื่อแท็บ ให้แก้ตรงนี้ให้ตรงกับชื่อแท็บจริง
// (ค่าเริ่มต้นของ Google Sheet มักเป็น "Sheet1" ถ้ายังไม่เคยเปลี่ยนชื่อ)
const LT_PRICE_TAB = "prices";
const LT_DEP_TAB = "depreciation";

function ltPriceSheetUrl() {
  return `https://docs.google.com/spreadsheets/d/${LT_PRICE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${LT_PRICE_TAB}`;
}
function ltDepSheetUrl() {
  return `https://docs.google.com/spreadsheets/d/${LT_DEP_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${LT_DEP_TAB}`;
}

// ----- ข้อมูลสำรอง (fallback) ใช้เมื่อโหลดจาก Google Sheet ไม่ได้ -----
const LT_FALLBACK_PRICES = [
  { code: "101", name: "บ้านพักอาศัยไม้ชั้นเดียว", price: 8600 },
  { code: "102", name: "บ้านพักอาศัยไม้ชั้นเดียวใต้ถุนสูง", price: 8600 },
  { code: "103", name: "บ้านพักอาศัยตึกชั้นเดียว", price: 8450 },
  { code: "104", name: "บ้านพักอาศัยไม้สองชั้น", price: 8250 },
  { code: "105", name: "บ้านพักอาศัยตึกสองชั้น", price: 8350 },
  { code: "106", name: "บ้านพักอาศัยครึ่งตึกครึ่งไม้สองชั้น", price: 8450 },
  { code: "107", name: "บ้านพักอาศัยตึกสามชั้น", price: 8150 },
  { code: "108", name: "บ้านพักอาศัยแฝดตึกสองชั้น", price: 8000 },
  { code: "109", name: "บ้านพักอาศัยแฝดตึกสามชั้น", price: 7800 },
  { code: "110", name: "บ้านทรงไทยไม้ชั้นเดียวใต้ถุนสูง", price: 9550 },
  { code: "111", name: "บ้านทรงไทยครึ่งตึกครึ่งไม้สองชั้น", price: 9300 },
  { code: "112", name: "บ้านพักอาศัยแฝดตึกชั้นเดียว", price: 8700 },
  { code: "201", name: "บ้านแถว (ทาวน์เฮาส์) ชั้นเดียว", price: 7700 },
  { code: "202", name: "บ้านแถว (ทาวน์เฮาส์) สองชั้น", price: 7500 },
  { code: "203", name: "บ้านแถว (ทาวน์เฮาส์) สามชั้น", price: 7550 },
  { code: "204", name: "บ้านแถว (ทาวน์เฮาส์) สี่ชั้น", price: 7500 },
  { code: "301", name: "ห้องแถวไม้ชั้นเดียว", price: 7650 },
  { code: "302", name: "ห้องแถวไม้สองชั้น", price: 8200 },
  { code: "303", name: "ห้องแถวครึ่งตึกครึ่งไม้สองชั้น", price: 8050 },
  { code: "401", name: "ตึกแถวชั้นเดียว", price: 7450 },
  { code: "402", name: "ตึกแถวสองชั้น", price: 8050 },
  { code: "403", name: "ตึกแถวสองชั้นครึ่ง", price: 8000 },
  { code: "404", name: "ตึกแถวสามชั้น", price: 8100 },
  { code: "405", name: "ตึกแถวสามชั้นครึ่ง", price: 8100 },
  { code: "406", name: "ตึกแถวสี่ชั้น", price: 8350 },
  { code: "407", name: "ตึกแถวสี่ชั้นครึ่ง", price: 8350 },
  { code: "408", name: "ตึกแถวห้าชั้น", price: 8350 },
  { code: "409", name: "ตึกแถวหกชั้น", price: 8400 },
  { code: "501", name: "คลังสินค้า พื้นที่ไม่เกิน 300 ตารางเมตร", price: 5650 },
  { code: "502", name: "คลังสินค้า พื้นที่เกินกว่า 300 ตารางเมตรขึ้นไป", price: 3500 },
  { code: "503", name: "เรือนคนใช้/ครัว", price: 6600 },
  { code: "504", name: "โรงจอดรถ", price: 2550 },
  { code: "505", name: "สถานศึกษา", price: 7400 },
  { code: "506/1", name: "โรงแรม ความสูงไม่เกิน 5 ชั้น", price: 9550 },
  { code: "506/2", name: "โรงแรม ความสูงเกินกว่า 5 ชั้นขึ้นไป", price: 9600 },
  { code: "507", name: "โรงมหรสพ", price: 7500 },
  { code: "508", name: "สถานพยาบาล", price: 9300 },
  { code: "509/1", name: "สำนักงาน ความสูงไม่เกิน 5 ชั้น", price: 7450 },
  { code: "509/2", name: "สำนักงาน ความสูงเกินกว่า 5 ชั้นขึ้นไป", price: 8800 },
  { code: "510", name: "ภัตตาคาร", price: 6850 },
  { code: "511/1", name: "ห้างสรรพสินค้า", price: 8900 },
  { code: "511/2", name: "อาคารพาณิชยกรรม ประเภทค้าปลีกค้าส่ง", price: 7350 },
  { code: "512", name: "สถานีบริการน้ำมันเชื้อเพลิง", price: 5350 },
  { code: "513", name: "โรงงาน", price: 5900 },
  { code: "514", name: "ตลาด พื้นที่ไม่เกิน 1000 ตารางเมตร", price: 3600 },
  { code: "515", name: "ตลาด พื้นที่เกินกว่า 1000 ตารางเมตรขึ้นไป", price: 3700 },
  { code: "516", name: "อาคารพาณิชย์ ประเภทโฮมออฟฟิศ", price: 8800 },
  { code: "517", name: "โรงเลี้ยงสัตว์", price: 2000 },
  { code: "518", name: "โรงงานซ่อมรถยนต์", price: 5600 },
  { code: "519", name: "อาคารจอดรถ", price: 5300 },
  { code: "520/1", name: "อาคารอยู่อาศัยรวม ความสูงไม่เกิน 5 ชั้น", price: 7900 },
  { code: "520/2", name: "อาคารอยู่อาศัยรวม ความสูงเกินกว่า 5 ชั้นขึ้นไป", price: 8700 },
  { code: "521", name: "ป้อมยาม", price: 5900 },
  { code: "522", name: "อาคารพาณิชย์ ประเภทโชว์รูมรถยนต์", price: 5200 },
  { code: "523", name: "ห้องน้ำรวม", price: 6100 },
  { code: "601", name: "รั้วคอนกรีต", price: 2050 },
  { code: "602", name: "รั้วลวดหนาม", price: 400 },
  { code: "603", name: "รั้วสังกะสี", price: 550 },
  { code: "604", name: "รั้วลวดถัก", price: 900 },
  { code: "605", name: "รั้วไม้", price: 1400 },
  { code: "606", name: "รั้วเหล็กดัด", price: 2800 },
  { code: "607", name: "รั้วอัลลอยด์", price: 5950 },
  { code: "608", name: "สระว่ายน้ำ", price: 7500 },
  { code: "609", name: "ลานกีฬาอเนกประสงค์", price: 750 },
  { code: "610", name: "ถนนคอนกรีต", price: 850 },
  { code: "611", name: "ลานคอนกรีต", price: 500 },
  { code: "612", name: "ถนนลาดยาง", price: 600 },
  { code: "613", name: "ป้ายโฆษณา", price: 8550 },
  { code: "614", name: "ท่าเทียบเรือ", price: 11000 },
];

const LT_FALLBACK_DEP = [
  { age: 1, tuek: "1%", half: "2%", wood: "3%" },
  { age: 2, tuek: "2%", half: "4%", wood: "6%" },
  { age: 3, tuek: "3%", half: "6%", wood: "9%" },
  { age: 4, tuek: "4%", half: "8%", wood: "12%" },
  { age: 5, tuek: "5%", half: "10%", wood: "15%" },
  { age: 6, tuek: "6%", half: "14%", wood: "20%" },
  { age: 7, tuek: "7%", half: "18%", wood: "25%" },
  { age: 8, tuek: "8%", half: "22%", wood: "30%" },
  { age: 9, tuek: "9%", half: "26%", wood: "35%" },
  { age: 10, tuek: "10%", half: "30%", wood: "40%" },
  { age: 11, tuek: "12%", half: "34%", wood: "45%" },
  { age: 12, tuek: "14%", half: "38%", wood: "50%" },
  { age: 13, tuek: "16%", half: "42%", wood: "55%" },
  { age: 14, tuek: "18%", half: "46%", wood: "60%" },
  { age: 15, tuek: "20%", half: "50%", wood: "65%" },
  { age: 16, tuek: "22%", half: "55%", wood: "72%" },
  { age: 17, tuek: "24%", half: "60%", wood: "79%" },
  { age: 18, tuek: "26%", half: "65%", wood: "86%" },
  { age: 19, tuek: "28%", half: "70%", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 20, tuek: "30%", half: "75%", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 21, tuek: "32%", half: "80%", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 22, tuek: "34%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 23, tuek: "36%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 24, tuek: "38%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 25, tuek: "40%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 26, tuek: "42%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 27, tuek: "44%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 28, tuek: "46%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 29, tuek: "48%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 30, tuek: "50%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 31, tuek: "52%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 32, tuek: "54%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 33, tuek: "56%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 34, tuek: "58%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 35, tuek: "60%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 36, tuek: "62%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 37, tuek: "64%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 38, tuek: "66%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 39, tuek: "68%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 40, tuek: "70%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 41, tuek: "72%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 42, tuek: "74%", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 43, tuek: "76% ตลอดอายุการใช้งาน", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 44, tuek: "76% ตลอดอายุการใช้งาน", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 45, tuek: "76% ตลอดอายุการใช้งาน", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 46, tuek: "76% ตลอดอายุการใช้งาน", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 47, tuek: "76% ตลอดอายุการใช้งาน", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 48, tuek: "76% ตลอดอายุการใช้งาน", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 49, tuek: "76% ตลอดอายุการใช้งาน", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 50, tuek: "76% ตลอดอายุการใช้งาน", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 51, tuek: "76% ตลอดอายุการใช้งาน", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 52, tuek: "76% ตลอดอายุการใช้งาน", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 53, tuek: "76% ตลอดอายุการใช้งาน", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
  { age: 54, tuek: "76% ตลอดอายุการใช้งาน", half: "85%ตลอดอายุการใช้งาน", wood: "93% ตลอดอายุการใช้งาน" },
];

let LT_PRICES = LT_FALLBACK_PRICES;
let LT_DEP = LT_FALLBACK_DEP;

function ltParseCsvLine(line) {
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuotes = !inQuotes; }
    else if (c === "," && !inQuotes) { cells.push(cur); cur = ""; }
    else { cur += c; }
  }
  cells.push(cur);
  return cells.map(c => c.trim());
}
function ltParseCsv(text) {
  return text.split(/\r?\n/).filter(l => l.trim() !== "").map(ltParseCsvLine);
}

async function ltLoadFromSheet() {
  const statusEl = document.getElementById("lt-source-status");
  const results = [];

  try {
    const res = await fetch(ltPriceSheetUrl(), { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const rows = ltParseCsv(await res.text()).slice(1).filter(r => r[0]);
    const newPrices = rows.map(r => ({ code: r[0], name: r[1], price: parseFloat(r[2]) || 0 })).filter(r => r.name);
    if (newPrices.length === 0) throw new Error("ไม่พบข้อมูลในชีตราคาประเมิน");
    LT_PRICES = newPrices;
    ltRenderPriceTable();
    results.push("ราคาประเมิน: สำเร็จ");
  } catch (err) {
    console.error("โหลดตารางราคาประเมินไม่สำเร็จ:", err);
    results.push("ราคาประเมิน: ใช้ข้อมูลสำรอง (โหลดไม่สำเร็จ)");
  }

  try {
    const res = await fetch(ltDepSheetUrl(), { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const rows = ltParseCsv(await res.text()).slice(1).filter(r => r[0]);
    const newDep = rows.map(r => ({ age: parseInt(r[0], 10), tuek: r[1], half: r[2], wood: r[3] })).filter(r => !isNaN(r.age));
    if (newDep.length === 0) throw new Error("ไม่พบข้อมูลในชีตค่าเสื่อมราคา");
    LT_DEP = newDep;
    ltRenderDepTable();
    results.push("ค่าเสื่อมราคา: สำเร็จ");
  } catch (err) {
    console.error("โหลดตารางค่าเสื่อมราคาไม่สำเร็จ:", err);
    results.push("ค่าเสื่อมราคา: ใช้ข้อมูลสำรอง (โหลดไม่สำเร็จ)");
  }

  if (statusEl) {
    const allOk = results.every(r => r.includes("สำเร็จ") && !r.includes("ไม่สำเร็จ"));
    statusEl.textContent = results.join(" · ") + " (" + new Date().toLocaleString("th-TH") + ")";
    statusEl.style.color = allOk ? "#166534" : "#B91C1C";
  }
}

function ltRenderPriceTable() {
  const tbody = document.querySelector("#priceTable tbody");
  if (!tbody) return;
  tbody.innerHTML = LT_PRICES.map(r =>
    `<tr><td class="code">${r.code}</td><td>${r.name}</td><td class="num">${r.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr>`
  ).join("");
  document.getElementById("priceCount").textContent = `แสดงทั้งหมด ${LT_PRICES.length} รายการ`;
  if (typeof filterPriceTable === "function") filterPriceTable();
}

function ltCapClass(text) {
  return (text.includes("93") || text.includes("85") || text.includes("76")) ? `<span class="dep-cap">${text}</span>` : text;
}

function ltRenderDepTable() {
  const tbody = document.querySelector(".dep-table tbody");
  if (!tbody) return;
  tbody.innerHTML = LT_DEP.map(r =>
    `<tr><td>${r.age}</td><td>${ltCapClass(r.tuek)}</td><td>${ltCapClass(r.half)}</td><td>${ltCapClass(r.wood)}</td></tr>`
  ).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  ltRenderPriceTable();  // แสดงข้อมูลสำรองก่อนทันที
  ltRenderDepTable();
  ltLoadFromSheet();     // แล้วค่อยพยายามโหลดข้อมูลล่าสุดจาก Google Sheet มาแทนที่
});
