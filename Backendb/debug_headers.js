require('dotenv').config();
const { getSheetData, updateSheetCell } = require('./sheetsService');

async function debugHeaders() {
    try {
        const spreadsheetId = process.env.SPREADSHEET_ID;
        console.log(`Inspecting headers for Spreadsheet ID: ${spreadsheetId}`);

        if (!spreadsheetId) {
            console.error("Error: SPREADSHEET_ID is missing from .env");
            return;
        }

        // Get Spreadsheet Metadata manually since we didn't export auth perfectly everywhere or to avoid require loops
        // We will use a fresh auth client here
        const path = require('path');
        const { google } = require('googleapis');
        const KEYFILEPATH = path.join(__dirname, 'credentials.json');
        const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
        const auth = new google.auth.GoogleAuth({ keyFile: KEYFILEPATH, scopes: SCOPES });
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const meta = await sheets.spreadsheets.get({ spreadsheetId });
        console.log(`\n📄 Spreadsheet Title: "${meta.data.properties.title}"`);
        console.log("\n📑 Sheets (Tabs):");
        meta.data.sheets.forEach(s => {
            console.log(` - "${s.properties.title}" (ID: ${s.properties.sheetId})`);
        });

        const firstSheetName = meta.data.sheets[0].properties.title;
        console.log(`\n🔎 Inspecting headers of FIRST sheet: "${firstSheetName}"`);

        const rowsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${firstSheetName}!A1:Z1`
        });
        const rows = rowsResponse.data.values;

        if (rows && rows.length > 0) {
            const headers = rows[0];
            console.log("\n--- HEADERS ---");
            headers.forEach((h, i) => {
                console.log(`Index ${i} (Col ${String.fromCharCode(65 + i)}): "${h}"`);
            });

            const statusIndex = headers.findIndex(h => h && h.toLowerCase().trim() === 'status');
            if (statusIndex !== -1) {
                console.log(`\n✅ Found "Status" column at Index ${statusIndex} (Column ${String.fromCharCode(65 + statusIndex)})`);
            } else {
                console.log(`\n❌ "Status" column NOT found. Check for typos.`);
            }

        } else {
            console.log(`\n⚠️ No data found in "${firstSheetName}" row 1.`);
        }

    } catch (error) {
        console.error("Debug failed:", error.message);
    }
}

debugHeaders();
