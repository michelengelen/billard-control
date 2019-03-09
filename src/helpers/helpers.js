import cloneDeep from 'lodash.clonedeep';

export const generateUniqueKey = () => (+new Date()).toString(36);

const emailRegEx = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const validateEmail = email => !email || emailRegEx.test(String(email).toLowerCase());

export const sortByProperty = (arr, prop) => {
  return arr.sort((a, b) => {
    const propA = typeof a[prop] === 'string' ? a[prop].toUpperCase() : a[prop];
    const propB = typeof b[prop] === 'string' ? b[prop].toUpperCase() : b[prop];

    if (propA < propB) {
      return -1;
    }
    if (propA > propB) {
      return 1;
    }
    return 0;
  });
};

export const getPriceString = price => {
  let priceString = '0,00 €';
  console.log('##### price: ', price);
  if (price && !isNaN(price)) {
    priceString =
      Number.prototype.toLocaleString.call(price, 'de', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + ' €';
  }
  return priceString;
};

export const getDateString = (date, short) => {
  let d;
  if (typeof date === 'object' && date.seconds) {
    d = new Date(date.seconds * 1000);
  } else {
    d = new Date(date);
  }
  const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const day = `${days[d.getDay()]}, `;
  return `${short ? '' : day}${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
};

export const refineProductForPurchase = (product, isGuest) => {
  const p = cloneDeep(product);
  p.price = isGuest ? p.priceExt : p.priceInt;
  delete p.priceInt;
  delete p.priceExt;
  p.amount = 1;
  p.public = true;
  return p;
};

const mapObjectKeys = (obj, callback) => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object') {
      mapObjectKeys(obj[key], callback);
    } else {
      callback(key, obj[key]);
    }
  });
};

export const refineMemberData = data => ({
  memberId: data.id,
  membernumber: data.membernumber,
  purchases: data.purchases,
});
