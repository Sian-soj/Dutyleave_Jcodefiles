const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors'); // Added CORS
const cryptoLib = require('./src/crypto');
const docLib = require('./src/document');

const app = express();
const PORT = 3001; // Changed to 3001

app.use(cors()); // Enable CORS
app.use(bodyParser.json());

// 1. Generate Keys Endpoint (Admin)
app.get('/generate-keys', (req, res) => {
    try {
        cryptoLib.generateKeys();
        res.json({ message: "Keys generated successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Sign Document Endpoint
app.post('/sign', async (req, res) => {
    try {
        const data = req.body;
        if (!data) return res.status(400).json({ error: "No data provided" });

        console.log("Signing data:", data);

        // Sign
        const signature = cryptoLib.signData(data);

        // Generate PDF
        // Generate PDF
        const fileName = `Document_${Date.now()}.pdf`;
        const outputPath = path.join(__dirname, fileName);

        await docLib.createSignedPDF(data, signature, outputPath);

        res.json({
            message: "Document signed successfully.",
            signature: signature,
            pdfPath: outputPath,
            verificationPayload: {
                data: data,
                sig: signature
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to download the generated PDF
app.get('/download', (req, res) => {
    const filePath = req.query.file;
    res.download(filePath);
});

// 3. Verify Document Endpoint
app.post('/verify', (req, res) => {
    try {
        const { data, sig } = req.body;
        if (!data || !sig) return res.status(400).json({ error: "Missing data or sig" });

        const isValid = cryptoLib.verifySignature(data, sig);

        if (isValid) {
            res.json({ status: "VALID", message: "Document is authentic." });
        } else {
            res.json({ status: "INVALID", message: "Signature verification failed." });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
