import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

/**
 * Access the secret key
 * @param {String} versionName 
 * @returns 
 */
async function accessSecretVersion(versionName) {
  const client = new SecretManagerServiceClient({
    projectId: process.env.FIREBASE_PROJECT_ID, 
    keyFilename: process.env.FIREBASE_JUSPAY_SERVICE_ACCOUNT
  });
    
  const [accessResponse] = await client.accessSecretVersion({
    name: versionName,
  });

  const responsePayload = accessResponse.payload.data.toString('utf8');
  return responsePayload
}

export { accessSecretVersion};