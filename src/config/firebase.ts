import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';

// Native Firebase initializes automatically using google-services.json on Android
// and GoogleService-Info.plist on iOS.

export const firebaseAuth = auth();
export const db = firestore();
export const storageInstance = storage();
export const realtimeDb = database();

// For consistency with existing code
export const authInstance = firebaseAuth;
export const storageRef = storageInstance;

export {
  authInstance as auth,
  storageInstance as storage,
};

export default {
  auth: firebaseAuth,
  db,
  storage: storageInstance,
  realtimeDb,
};
