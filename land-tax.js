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
const FALLBACK_UNIT_SIZE = 500; // ตร.ซม. ต่อ 1 หน่วยภาษีป้าย
// ==========================================================================
// ตารางราคาประเมินสิ่งปลูกสร้าง และตารางค่าเสื่อมราคา ดึงจาก Google Sheet
// ==========================================================================

const LT_DEP_SHEET_ID = "1nwRhZAoW5Pachp3L8HOAl6ttCdRsP8k-MG1nsgtsXU0";   // ไฟล์ตารางค่าเสื่อมราคา
const LT_PRICE_SHEET_ID = "189qmWeGH2nacYbrL9ZZNzErrqhuNIZrOfC7YUPtz-sQ"; // ไฟล์ตารางราคาประเมินสิ่งปลูกสร้าง

const LT_PRICE_TAB = "prices";
const LT_DEP_TAB = "depreciation";

function ltPriceSheetUrl() {
  return `https://docs.google.com/spreadsheets/d/${LT_PRICE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${LT_PRICE_TAB}`;
}
function ltDepSheetUrl() {
  return `https://docs.google.com/spreadsheets/d/${LT_DEP_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${LT_DEP_TAB}`;
}
