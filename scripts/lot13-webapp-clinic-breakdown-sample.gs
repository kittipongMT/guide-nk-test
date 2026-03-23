/**
 * ตัวอย่างส่วนที่เพิ่มใน Web App (doGet) ของ LOT 13
 * — นำไปผสมกับสคริปต์เดิมที่ส่ง companyRemaining / clinicRemaining / updatedAt อยู่แล้ว
 *
 * ชีต:
 * - Analysis คอลัมน์ A–L แถว 1 = หัวตาราง, แถว 2 ถึงแถวก่อนสุดท้าย = รายคลินิก
 * - nk-vue-tube-lot-13 ใช้หาเลขหลอดคงเหลือรายคลินิก:
 *   คอลัมน์ A = เลขหลอด, B = Clinic, F = Return Date
 *   ถ้า F ว่าง => ถือว่ายังคงเหลือ (ยังไม่ถูกใช้งาน/ยังไม่ Collection)
 *
 * ตั้งค่า SPREADSHEET_ID ให้ตรงกับไฟล์ NK_VUE_TUBE_LOT_13_2025 Med Lab
 */
function buildClinicBreakdown_() {
  var SPREADSHEET_ID = 'ใส่_ID_สเปรดชีต_ที่นี่';
  var SHEET_NAME = 'Analysis';
  var TUBE_SHEET_NAME = 'nk-vue-tube-lot-13';

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) return [];
  var tubeMap = buildRemainingTubeMap_(ss, TUBE_SHEET_NAME);

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
      remaining: row[11],
      // ฝั่งเว็บจะอ่านฟิลด์นี้แล้วแสดงเมื่อคลิกชื่อคลินิก
      remainingTubeNos: tubeMap[nameStr] || []
    });
  }
  return out;
}

/**
 * สร้าง map ของเลขหลอดคงเหลือ แยกตามชื่อคลินิก
 * key = clinicName, value = [tubeNo1, tubeNo2, ...]
 */
function buildRemainingTubeMap_(ss, tubeSheetName) {
  var sh = ss.getSheetByName(tubeSheetName);
  if (!sh) return {};

  var lastRow = sh.getLastRow();
  if (lastRow < 2) return {};

  // อ่าน A2:F(lastRow) — A=tube no, B=clinic, F=return date
  var vals = sh.getRange(2, 1, lastRow - 1, 6).getValues();
  var out = {};

  for (var i = 0; i < vals.length; i++) {
    var row = vals[i];
    var tubeNo = String(row[0] || '').trim();   // col A
    var clinicName = String(row[1] || '').trim(); // col B
    var returnDate = row[5]; // col F

    if (!tubeNo || !clinicName) continue;

    // F ว่าง = ยังเหลืออยู่ที่คลินิก
    var isRemaining = returnDate === '' || returnDate === null || returnDate === undefined;
    if (!isRemaining) continue;

    if (!out[clinicName]) out[clinicName] = [];
    out[clinicName].push(tubeNo);
  }

  // เรียงเลขหลอดแบบธรรมชาติ (13-2 < 13-10)
  Object.keys(out).forEach(function(clinic) {
    out[clinic].sort(function(a, b) {
      return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
    });
  });

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
