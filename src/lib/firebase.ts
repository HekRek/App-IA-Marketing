import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, collection, setDoc, getDoc, getDocs, query, orderBy, addDoc, deleteDoc, updateDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  getDocFromServer
};
export type { User };
