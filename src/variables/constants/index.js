import { firebase } from './config';
import { firebaseLocal } from './localConfig';

console.log('ENV variable: ', process.env);

let CONFIG = firebaseLocal;
if (firebaseLocal && process.env.REACT_APP_ENV === 'local') {
  CONFIG = firebaseLocal;
} else {
  CONFIG = firebase;
}

export { CONFIG };

export * from './icons';
export * from './variables';
