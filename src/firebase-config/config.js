import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { FIREBASECONFIG } from 'variables/constants';

firebase.initializeApp(FIREBASECONFIG[process.env.NODE_ENV]);

const dbRef = firebase.firestore();
const settings = { timestampsInSnapshots: true };
dbRef.settings(settings);

export const tarifsRef = dbRef.collection('tarifs');
export const membersRef = dbRef.collection('members');
export const productsRef = dbRef.collection('products');
export const categoriesRef = dbRef.collection('categories');
export const purchasesRef = dbRef.collection('purchases');
export const clubDataRef = dbRef.collection('clubData').doc('data');

export const authRef = firebase.auth();
