const cryptoLib = require('./src/crypto');
const docLib = require('./src/document');
const path = require('path');
const fs = require('fs');

async function runTest() {
    console.log(">>> 1. Generating Keys...");
    cryptoLib.generateKeys();

    const data = {
        applicant: "Sian Soj",
        department: "Engineering",
        leave_type: "Conference",
        date: "2026-01-15",
        status: "APPROVED"
    };

    console.log("\n>>> 2. Signing Document...");
    const signature = cryptoLib.signData(data);
    console.log("Signature generated.");

    const pdfPath = path.join(__dirname, 'TestDocument.pdf');
    await docLib.createSignedPDF(data, signature, pdfPath);
    console.log(`PDF created at: ${pdfPath}`);

    console.log("\n>>> 3. Verifying Document...");
    const isValid = cryptoLib.verifySignature(data, signature);

    if (isValid) {
        console.log("\n[SUCCESS] Document is AUTHENTIC.");
    } else {
        console.log("\n[FAILURE] Signature verification FAILED.");
    }

    // Tamper Test
    console.log("\n>>> 4. Tamper Test...");
    const tamperedData = { ...data, status: "REJECTED" };
    const isTamperValid = cryptoLib.verifySignature(tamperedData, signature);

    if (!isTamperValid) {
        console.log("[SUCCESS] Tampering detected.");
    } else {
        console.log("[FAILURE] Tampering NOT detected!");
    }
}

runTest().catch(console.error);
