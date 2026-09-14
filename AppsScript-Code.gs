/**
 * MyCalAgent — Movement preview
 * Feedback collector: receives a POST from the preview site and appends a row
 * to the Movement Feedback spreadsheet.
 *
 * ─── HOW TO DEPLOY (about 3 minutes) ──────────────────────────────────────────
 *
 *  1. Open your sheet, then:  Extensions → Apps Script
 *  2. Delete whatever is in Code.gs and paste this whole file in. Save (⌘/Ctrl+S).
 *  3. Deploy → New deployment
 *  4. Click the gear next to "Select type" → Web app
 *  5. Description:        Movement feedback
 *     Execute as:         Me
 *     Who has access:     Anyone          ← MUST be "Anyone", not
 *                                            "Anyone with Google account".
 *                                            Your friends are not signed in.
 *  6. Deploy → Authorize access → choose your account → Advanced →
 *     "Go to <project> (unsafe)" → Allow.
 *     (That warning is Google telling you the script is unverified. It's your
 *      own script, and it only touches this one spreadsheet.)
 *  7. Copy the Web app URL. It ends in  /exec
 *  8. Paste it into ENDPOINT at the top of index.html, re-upload, done.
 *
 *  TEST IT: paste the /exec URL straight into a browser tab. You should see
 *  {"ok":true,...} and a "Feedback" tab should appear in the sheet with headers.
 *
 *  IF YOU EDIT THIS SCRIPT LATER: Deploy → Manage deployments → pencil icon →
 *  Version: New version → Deploy. Without that the URL keeps serving old code —
 *  this is the single most common reason "my changes did nothing".
 * ─────────────────────────────────────────────────────────────────────────────
 */

var SHEET_ID   = '1RGuDEYaueX0uAEyJyLWjbol5XZLNya21NHEclhb9Tz0';
var SHEET_NAME = 'Feedback';
var HEADERS    = ['Timestamp', 'Name', 'Made sense', 'Would use',
                  'Best part', 'Notes', 'Page', 'Device'];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, error: 'empty request' });
    }
    var d = JSON.parse(e.postData.contents);
    sheet_().appendRow([
      new Date(),
      str_(d.name),
      str_(d.madeSense),
      str_(d.wouldUse),
      str_(d.bestPart),
      str_(d.notes),
      str_(d.page),
      str_(d.device)
    ]);
    return json_({ ok: true });
  } catch (err) {
    // Never throw: a thrown error returns an HTML error page the browser can't
    // read, and the page would report a failure it can't explain.
    return json_({ ok: false, error: String(err) });
  }
}

/** Visiting the /exec URL in a browser runs this — the quickest way to confirm
 *  the deployment is live and the sheet is writable. */
function doGet() {
  try {
    var sh = sheet_();
    return json_({
      ok: true,
      message: 'Movement feedback endpoint is live.',
      rows: Math.max(0, sh.getLastRow() - 1)
    });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function sheet_() {
  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 160);   // timestamp
    sh.setColumnWidth(6, 420);   // notes — the column you'll actually read
  }
  return sh;
}

/** Coerce to a trimmed string and cap it, so one pasted essay can't break a row.
 *  A leading =, +, - or @ is prefixed with an apostrophe: without that, Sheets
 *  would interpret the text as a formula. */
function str_(v) {
  if (v === null || v === undefined) return '';
  var s = String(v).slice(0, 4000).trim();
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
