const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const privateKeyPath = path.join(__dirname, '..', 'keys', 'private.pem');
const publicKeyPath = path.join(__dirname, '..', 'keys', 'public.pem');

/**
 * Generate SHA-256 hash of certificate data string
 */
const generateHash = (dataString) => {
    return crypto.createHash('sha256').update(dataString).digest('hex');
};

/**
 * Sign a data string using the RSA private key
 */
const signData = (dataString) => {
    try {
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
        const signer = crypto.createSign('RSA-SHA256');
        signer.update(dataString);
        signer.end();
        return signer.sign(privateKey, 'base64');
    } catch (error) {
        console.error('Error signing data:', error);
        throw error;
    }
};

/**
 * Verify a signature against a data string using the RSA public key
 */
const verifySignature = (dataString, signature) => {
    try {
        const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(dataString);
        verifier.end();
        return verifier.verify(publicKey, signature, 'base64');
    } catch (error) {
        console.error('Error verifying signature:', error);
        return false;
    }
};

module.exports = {
    generateHash,
    signData,
    verifySignature
};
