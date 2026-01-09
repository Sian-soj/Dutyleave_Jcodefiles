const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEYS_DIR = path.join(__dirname, '../keys');

// Ensure keys directory exists
if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
}

module.exports = {
    /**
     * Generates RSA Key Pair and saves to disk.
     */
    generateKeys: () => {
        console.log("Generating RSA Key Pair...");
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        fs.writeFileSync(path.join(KEYS_DIR, 'private_key.pem'), privateKey);
        fs.writeFileSync(path.join(KEYS_DIR, 'public_key.pem'), publicKey);
        console.log("Keys saved to", KEYS_DIR);
        return { privateKey, publicKey };
    },

    /**
     * Signs a data object using the Private Key (SHA-256).
     */
    signData: (data) => {
        const privateKeyPath = path.join(KEYS_DIR, 'private_key.pem');
        if (!fs.existsSync(privateKeyPath)) {
            throw new Error("Private key not found. Generate keys first.");
        }
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

        // Canonicalize data (sort keys)
        const dataStr = JSON.stringify(data, Object.keys(data).sort());

        const sign = crypto.createSign('SHA256');
        sign.update(dataStr);
        sign.end();

        const signature = sign.sign(privateKey, 'base64');
        return signature;
    },

    /**
     * Verifies the signature of a data object using the Public Key.
     */
    verifySignature: (data, signature) => {
        const publicKeyPath = path.join(KEYS_DIR, 'public_key.pem');
        if (!fs.existsSync(publicKeyPath)) {
            throw new Error("Public key not found.");
        }
        const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

        const dataStr = JSON.stringify(data, Object.keys(data).sort());

        const verify = crypto.createVerify('SHA256');
        verify.update(dataStr);
        verify.end();

        return verify.verify(publicKey, signature, 'base64');
    }
};
