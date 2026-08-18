// ==========================================================================
// ตารางราคาประเมินสิ่งปลูกสร้าง และตารางค่าเสื่อมราคา ดึงจาก Google Sheet
// เพื่อให้เจ้าหน้าที่แก้ไขได้เอง — วิธีตั้งค่าดูที่ "คู่มือแก้ไขอัตราภาษี"
// ==========================================================================

const LT_DEP_SHEET_ID = "1nwRhZAoW5Pachp3L8HOAl6ttCdRsP8k-MG1nsgtsXU0";   // ไฟล์ตารางค่าเสื่อมราคา
const LT_PRICE_SHEET_ID = "189qmWeGH2nacYbrL9ZZNzErrqhuNIZrOfC7YUPtz-sQ"; // ไฟล์ตารางราคาประเมินสิ่งปลูกสร้าง

// ชื่อแท็บ (tab) ในแต่ละไฟล์ — ถ้าคุณยังไม่ได้เปลี่ยนชื่อแท็บ ให้แก้ตรงนี้ให้ตรงกับชื่อแท็บจริง
const LT_PRICE_TAB = "prices";
const LT_DEP_TAB = "depreciation";

function ltPriceSheetUrl() {
  return `https://docs.google.com/spreadsheets/d/${LT_PRICE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${LT_PRICE_TAB}`;
}
function ltDepSheetUrl() {
  return `https://docs.google.com/spreadsheets/d/${LT_DEP_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${LT_DEP_TAB}`;
}