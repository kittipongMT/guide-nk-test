/**
 * ตัวอย่างส่วนที่เพิ่มใน Web App (doGet) ของ LOT 13
 * — นำไปผสมกับสคริปต์เดิมที่ส่ง companyRemaining / clinicRemaining / updatedAt อยู่แล้ว
 *
 * ชีต: Analysis คอลัมน์ A–L แถว 1 = หัวตาราง, แถว 2 ถึงแถวก่อนสุดท้าย = รายคลินิก,
 *       แถวสุดท้าย = สรุปยอดรวม (สคริปต์จะข้ามแถวสุดท้ายอัตโนมัติ)
 *
 * ตั้งค่า SPREADSHEET_ID ให้ตรงกับไฟล์ NK_VUE_TUBE_LOT_13_2025 Med Lab
 */
function buildClinicBreakdown_() {
  var SPREADSHEET_ID = 'ใส่_ID_สเปรดชีต_ที่นี่';
  var SHEET_NAME = 'Analysis';

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) return [];

  var lastRow = sh.getLastRow();
  if (lastRow < 3) return [];

  // A2:L(แถวก่อนสรุป) — แถวสุดท้ายถือว่าเป็นยอดรวม
  var endDataRow = lastRow - 1;
  var numRows = endDataRow - 1 + 1;
  if (numRows < 1) return [];

  var range = sh.getRange(2, 1, endDataRow, 12);
  var vals = range.getValues();
  var out = [];

  for (var i = 0; i < vals.length; i++) {
    var row = vals[i];
    var clinicName = row[1];
    if (clinicName === null || clinicName === undefined) continue;
    var nameStr = String(clinicName).trim();
    if (nameStr === '') continue;

    out.push({
      order: row[0],
      clinicName: nameStr,
      previousMonthEnd: row[2],
      withdraw: row[3],
      collection: row[4],
      transfer: row[5],
      tubeReturn: row[6],
      relocate: row[7],
      recall: row[8],
      broken: row[9],
      lost: row[10],
      remaining: row[11]
    });
  }
  return out;
}

/**
 * ตัวอย่างโครงสร้าง JSON ที่เว็บคาดหวัง (รวมฟิลด์เดิมของคุณด้วย)
 *
 * return ContentService
 *   .createTextOutput(JSON.stringify({
 *     lotLabel: '...',
 *     companyRemaining: ...,
 *     clinicRemaining: ...,
 *     updatedAt: '...',
 *     clinicBreakdown: buildClinicBreakdown_()
 *   }))
 *   .setMimeType(ContentService.MimeType.JSON);
 */
