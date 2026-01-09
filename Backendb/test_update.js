require('dotenv').config();
const { updateSheetCell } = require('./sheetsService');

async function testUpdate() {
    try {
        const spreadsheetId = process.env.SPREADSHEET_ID;
        console.log(`Testing UPDATE on Spreadsheet ID: ${spreadsheetId}`);

        if (!spreadsheetId) {
            console.error("Error: SPREADSHEET_ID is missing from .env");
            return;
        }

        // Try to update Cell E2 (first student's status)
        console.log("Attempting to write 'TEST_APPROVED' to Sheet1!E2...");
        await updateSheetCell(spreadsheetId, 'Sheet1!E2', 'TEST_APPROVED');

        console.log("✅ Success! Cell updated.");
        console.log("Please check your Google Sheet to see if E2 says 'TEST_APPROVED'.");
    } catch (error) {
        console.error("❌ Update failed:", error.message);
        if (error.message.includes("403")) {
            console.error("👉 CAUSE: Permission Denied.");
            console.error("👉 FIX: Go to your Google Sheet > Share > Change the Service Account to 'Editor'.");
        }
    }
}

testUpdate();
