require('dotenv').config();
const { getSheetData } = require('./sheetsService');

async function testConnection() {
    try {
        const spreadsheetId = process.env.SPREADSHEET_ID;
        console.log(`Testing connection to Spreadsheet ID: ${spreadsheetId}`);

        if (!spreadsheetId) {
            console.error("Error: SPREADSHEET_ID is missing from .env");
            return;
        }

        const data = await getSheetData(spreadsheetId, 'Sheet1!A1:B2');
        console.log("Successfully connected! First few cells:", data);
    } catch (error) {
        console.error("Connection failed:", error.message);
        if (error.message.includes("403")) {
            console.error("Tip: Did you share the sheet with the client_email in credentials.json?");
        }
    }
}

testConnection();
