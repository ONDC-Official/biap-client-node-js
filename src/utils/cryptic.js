import _sodium from 'libsodium-wrappers';

/**
 * create signing string
 * @param {String} message 
 * @param {Number} created 
 * @param {Number} expires 
 * @returns 
 */
export const createSigningString = async (message, created, expires) => {
    if (!created) created = Math.floor(new Date().getTime() / 1000).toString();
    if (!expires) expires = (parseInt(created) + (1 * 60 * 60)).toString();

    await _sodium.ready;

    const sodium = _sodium;

    //generate the digest of the message using the BLAKE-512 hashing function.
    const digest = sodium.crypto_generichash(64, sodium.from_string(message));

    //generate a base64 encoded string of the digest
    const digest_base64 = sodium.to_base64(digest, _sodium.base64_variants.ORIGINAL);
    
    //concatenate the three values, i.e the `created`, `expires`, and `digest`
    const signing_string =
        `(created): ${created}
(expires): ${expires}
digest: BLAKE-512=${digest_base64}`
    
    return { signing_string, created, expires };
}

/**
 * sign message
 * @param {String} signing_string 
 * @param {String} privateKey 
 * @returns 
 */
export const signMessage = async (signing_string, privateKey) => {
    await _sodium.ready;
    const sodium = _sodium;
    
    //sign the signing_string using its registered signing private key via the Ed25519 Algorithm.
    const signedMessage = sodium.crypto_sign_detached(
        signing_string, 
        sodium.from_base64(privateKey, _sodium.base64_variants.ORIGINAL)
    );
    
    //generate a base64 encoded string of the signedMessage and return it.
    return sodium.to_base64(signedMessage, _sodium.base64_variants.ORIGINAL);
}

/**
 * create authorization header
 * @param {Object} message 
 * @returns 
 */
export const createAuthorizationHeader = async (message) => {
    
    //create the singing_string, created and expires value.
    const { 
        signing_string, 
        expires, 
        created 
    } = await createSigningString(JSON.stringify(message));

    //sign message
    const signature = await signMessage(signing_string, process.env.BPP_PRIVATE_KEY || "");

    const subscriber_id = process.env.BAP_ID;
    const unique_key_id = process.env.BPP_UNIQUE_KEY_ID;

    const header = `Signature keyId="${subscriber_id}|${unique_key_id}|ed25519",algorithm="ed25519",created="${created}",expires="${expires}",headers="(created) (expires) digest",signature="${signature}"`
    
    return header;
}

/**
 * create key pair
 * @returns publicKey and privateKey
 */
export const createKeyPair = async () => {
    await _sodium.ready;
    const sodium = _sodium;

    let { publicKey, privateKey } = sodium.crypto_sign_keypair();
    const publicKey_base64 = sodium.to_base64(publicKey, _sodium.base64_variants.ORIGINAL);
    const privateKey_base64 = sodium.to_base64(privateKey, _sodium.base64_variants.ORIGINAL);

    return { publicKey: publicKey_base64, privateKey: privateKey_base64 };
}
