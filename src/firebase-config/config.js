import * as firebase from 'firebase';
import { FIREBASECONFIG } from 'variables/constants';
firebase.initializeApp(FIREBASECONFIG);

const dbRef = firebase.firestore();

export const membersRef = dbRef.collection('members');
export const productsRef = dbRef.collection('products');

export const authRef = firebase.auth();
