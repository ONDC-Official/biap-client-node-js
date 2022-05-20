import _sodium from 'libsodium-wrappers';
import _ from 'lodash'
import HttpRequest from "./HttpRequest.js";

export const createSigningString = async (message, created, expires) => {
    if (!created) created = Math.floor(new Date().getTime() / 1000).toString();
    if (!expires) expires = (parseInt(created) + (1 * 60 * 60)).toString();

    await _sodium.ready;

    const sodium = _sodium;
    const digest = sodium.crypto_generichash(64, sodium.from_string(message));
    const digest_base64 = sodium.to_base64(digest, _sodium.base64_variants.ORIGINAL);
    
    const signing_string =
        `(created): ${created}
(expires): ${expires}
digest: BLAKE-512=${digest_base64}`
    
    return { signing_string, created, expires };
}

export const signMessage = async (signing_string, privateKey) => {
    await _sodium.ready;
    const sodium = _sodium;
    
    const signedMessage = sodium.crypto_sign_detached(
        signing_string, 
        sodium.from_base64(privateKey, _sodium.base64_variants.ORIGINAL)
    );
    return sodium.to_base64(signedMessage, _sodium.base64_variants.ORIGINAL);
}

export const createAuthorizationHeader = async (message) => {
    const { 
        signing_string, 
        expires, 
        created 
    } = await createSigningString(JSON.stringify(message));

    const signature = await signMessage(signing_string, process.env.BPP_PRIVATE_KEY || "");

    const subscriber_id = process.env.BAP_ID;
    const unique_key_id = process.env.BPP_UNIQUE_KEY_ID;
    const header = `Signature keyId="${subscriber_id}|${unique_key_id}|ed25519",algorithm="ed25519",created="${created}",expires="${expires}",headers="(created) (expires) digest",signature="${signature}"`
    
    return header;
}

// export const createKeyPair = async () => {
//     await _sodium.ready;
//     const sodium = _sodium;

//     let { publicKey, privateKey } = sodium.crypto_sign_keypair();
//     const publicKey_base64 = sodium.to_base64(publicKey, _sodium.base64_variants.ORIGINAL);
//     const privateKey_base64 = sodium.to_base64(privateKey, _sodium.base64_variants.ORIGINAL);

//     return { publicKey: publicKey_base64, privateKey: privateKey_base64 };
// }

// const getProviderPublicKey = async (providers,  keyId) => {
//     try {
//         const provider = _.find(providers, ['ukId', keyId])
//         return provider?.signing_public_key || false
//     } catch(e){
//         return false
//     }
// }

// export const lookupRegistry = async (subscriber_id, unique_key_id ) => {

//     console.log('lookupRegistry subscriber_id', subscriber_id)
//     try {    
//     const reqBody = {
//         "type":"BAP",
//         "domain": process.env.DOMAIN,
//         "subscriber_id": subscriber_id
//     }
 
//     const call = await new HttpRequest(`https://pilot-gateway-1.beckn.nsdl.co.in`, '/lookup', "POST", reqBody);
//     const response = await call.send()

//     if (!response.data) {
//         return false
//     }
 
//     const public_key = await getProviderPublicKey(response.data, unique_key_id)
   
//     if (!public_key) {
//         return false
//     }
//     return public_key
//     } catch(e){
       
//         return false
//     }
// }

// const remove_quotes = (a) => {
//     return a.replace(/^["'](.+(?=["']$))["']$/, '$1');
// }

// const split_auth_header = (auth_header) => {
//     const header = auth_header.replace('Signature ', '');
//     let re = /\s*([^=]+)=([^,]+)[,]?/g;
//     let m;
//     let parts = {}
//     while ((m = re.exec(header)) !== null) {
//         if (m) {
//             parts[m[1]] = remove_quotes(m[2]);
//         }
//     }
//     return parts;
//  }

// const verifyMessage = async (signedString, signingString, publicKey) => {
//     try {
//         await _sodium.ready;
//         const sodium = _sodium;
//         return sodium.crypto_sign_verify_detached(sodium.from_base64(signedString, _sodium.base64_variants.ORIGINAL), signingString, sodium.from_base64(publicKey, _sodium.base64_variants.ORIGINAL));
//     } catch (error) {
//         return false
//     }
//  }
 
// const verifyHeader = async (headerParts, body, public_key) => {
//     const { signing_string } = await createSigningString(JSON.stringify(body), headerParts['created'], headerParts['expires']);
//     console.log("recreated signing string:");
//     console.log(signing_string);
//     const verified = await verifyMessage(headerParts['signature'], signing_string, public_key);

//     console.log('verified', verified);
//     return verified;
//  }

// const isSignatureValid = async (header, body) => {
//     try{
//         const headerParts = split_auth_header(header);
//         const keyIdSplit = headerParts['keyId'].split('|')
//         const subscriber_id = keyIdSplit[0]
//         const keyId = keyIdSplit[1]
//         const public_key = await lookupRegistry(subscriber_id, keyId)

//         const isValid = await verifyHeader(headerParts, body, public_key)
//         return isValid
//     } catch(e){
//         console.log('Error', e)
//         return false
//     }
// }
