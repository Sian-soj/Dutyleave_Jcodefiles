require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getSheetData } = require('./sheetsService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
    res.send('Google Sheets API Backend is running!');
});

// Endpoint to get data from a specific sheet
// Example usage: /api/data?range=Sheet1!A1:E10
app.get('/api/data', async (req, res) => {
    try {
        const spreadsheetId = process.env.SPREADSHEET_ID;
        const range = req.query.range || 'Sheet1'; // Default to 'Sheet1' if no range provided

        if (!spreadsheetId) {
            return res.status(500).json({ error: 'SPREADSHEET_ID not configured in .env' });
        }

        const data = await getSheetData(spreadsheetId, range);
        res.json({ data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve data', details: error.message });
    }
});

// Endpoint to update a cell
app.post('/api/update', async (req, res) => {
    try {
        const { range, value } = req.body;
        const spreadsheetId = process.env.SPREADSHEET_ID;

        if (!range || !value) {
            return res.status(400).json({ error: 'Missing range or value' });
        }

        const { updateSheetCell } = require('./sheetsService');
        await updateSheetCell(spreadsheetId, range, value);

        res.json({ message: 'Sheet updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update sheet', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
