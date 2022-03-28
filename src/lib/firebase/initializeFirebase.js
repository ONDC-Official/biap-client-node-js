import admin from 'firebase-admin';

/**
 * initialize firebase 
 */
const initializeFirebase = () => {
    admin.initializeApp({
        credential: admin.credential.cert(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)
    });
}

export default initializeFirebase;