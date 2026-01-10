const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');

module.exports = {
    /**
     * Generates a PDF with embedded data and verification QR code.
     * returns: Promise resolving to the path of the generated PDF.
     */
    createSignedPDF: async (data, signature, outputPath) => {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const stream = fs.createWriteStream(outputPath);
                doc.pipe(stream);

                // 1. Generate QR Code Data URL
                const payload = {
                    data: data,
                    sig: signature
                };
                const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload));

                // 2. Build PDF Content
                doc.fontSize(25).text('OFFICIAL DUTY LEAVE APPROVAL', 50, 50);

                doc.fontSize(14).moveDown();
                for (const [key, value] of Object.entries(data)) {
                    const keyTitle = key.charAt(0).toUpperCase() + key.slice(1);
                    // Case-insensitive check for 'Approved' to ensure green color works for 'APPROVED', 'approved', etc.
                    if (key.toLowerCase() === 'status' && String(value).trim().toLowerCase() === 'approved') {
                        doc.fillColor('#008000').text(`${keyTitle}: ${value}`).fillColor('black');
                    } else {
                        doc.text(`${keyTitle}: ${value}`);
                    }
                    doc.moveDown(0.5);
                }

                doc.moveDown(2);
                doc.image(qrDataUrl, { fit: [150, 150] });

                doc.fontSize(10).text('Scan to verify authenticity.', { continued: false });

                doc.end();

                stream.on('finish', () => resolve(outputPath));
                stream.on('error', (err) => reject(err));

            } catch (error) {
                reject(error);
            }
        });
    }
};
