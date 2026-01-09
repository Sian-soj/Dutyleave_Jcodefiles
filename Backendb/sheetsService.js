const { google } = require('googleapis');
const path = require('path');

// Load credentials from a local file - make sure this file exists!
const KEYFILEPATH = path.join(__dirname, 'credentials.json');

// Scopes for Google Sheets API
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

async function getSheetData(spreadsheetId, range) {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
}

async function updateSheetCell(spreadsheetId, range, value) {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: [[value]],
      },
    });
  } catch (error) {
    console.error('Error updating Google Sheets:', error);
    throw error;
  }
}

module.exports = {
  getSheetData,
  updateSheetCell,
  auth // Exporting auth for debug script
};
