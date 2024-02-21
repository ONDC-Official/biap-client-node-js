import express from 'express'
import crypto from 'crypto'
import _sodium from 'libsodium-wrappers'

const ENCRYPTION_PRIVATE_KEY = "MC4CAQAwBQYDK2VuBCIEIICW13rezlPr0gkrbjKOh8O95E9hFmqQA7iME3ZaMWt/";
const ONDC_PUBLIC_KEY ='MCowBQYDK2VuAyEAduMuZgmtpjdCuxv+Nc49K0cB6tL/Dj3HZetvVN7ZekM=';
const REQUEST_ID = "97941e7b-f5ab-404a-82ba-db16765d29d0"
const SIGNING_PRIVATE_KEY = 'Kh1omKyufnurW8KNyrHXlzNSAwRX1vHoQ9Jur+5dyPbuD1TzQUuueDupkVDXw1vyioA3J4p3JgtN0Hk2beNWdQ==';

const htmlFile = `
<html>
  <head>
    <meta
      name="ondc-site-verification"
      content="SIGNED_UNIQUE_REQ_ID"
    />
  </head>
  <body>
    ONDC Site Verification Page
  </body>
</html>
`;

const privateKey = crypto.createPrivateKey({
  key: Buffer.from(ENCRYPTION_PRIVATE_KEY, 'base64'), // Decode private key from base64
  format: 'der', // Specify the key format as DER
  type: 'pkcs8', // Specify the key type as PKCS#8
});

const publicKey = crypto.createPublicKey({
  key: Buffer.from(ONDC_PUBLIC_KEY, 'base64'), 
  format: 'der', 
  type: 'spki',
});

const sharedKey = crypto.diffieHellman({
  privateKey: privateKey,
  publicKey: publicKey,
});


const route = express.Router();

route.get('/', function (req,res) {
    res.status(200).json({
        message: "OK"
    })
})

route.post('/on_subscribe', function (req, res) {
  const { challenge } = req.body; 
  const answer = decryptAES256ECB(sharedKey, challenge); 
  const resp = { answer: answer };
  res.status(200).json(resp); 
});


route.get('/ondc-site-verification.html', async (req, res) => {
  const signedContent = await signMessage(REQUEST_ID, SIGNING_PRIVATE_KEY);
  const modifiedHTML = htmlFile.replace(/SIGNED_UNIQUE_REQ_ID/g, signedContent);
  res.send(modifiedHTML);
});


function decryptAES256ECB(key, encrypted) {
  const iv = Buffer.alloc(0); 
  const decipher = crypto.createDecipheriv('aes-256-ecb', key, iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function signMessage(signingString, privateKey) {
  await _sodium.ready;
  const sodium = _sodium;
  const signedMessage = sodium.crypto_sign_detached(
    signingString,
    sodium.from_base64(privateKey, _sodium.base64_variants.ORIGINAL)
  );
  const signature = sodium.to_base64(
    signedMessage,
    _sodium.base64_variants.ORIGINAL
  );
  return signature;
}

export default route
