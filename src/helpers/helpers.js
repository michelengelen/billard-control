export const generateUniqueKey = () => (+new Date()).toString(36);

const emailRegEx = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const validateEmail = email =>
  !email || emailRegEx.test(String(email).toLowerCase());

export const sortByProperty = (arr, prop) => {
  return arr.sort((a, b) => {
    const propA = a[prop].toUpperCase(); // ignore upper and lowercase
    const propB = b[prop].toUpperCase(); // ignore upper and lowercase

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
  if (price && !isNaN(price)) {
    priceString =
      price.toLocaleString('de', {
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
  const days = [
    'Sonntag',
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
  ];
  const day = `${days[d.getDay()]}, `;
  return `${short ? '' : day}${d.getDate()}. ${d.getMonth() +
    1}. ${d.getFullYear()}`;
};

/**
 *
 * @param {object}     data
 * @param {boolean}    data.active
 * @param {number}     data.membernumber
 * @param {timestamp}  data.entryDate
 * @param {string}     data.firstname
 * @param {string}     data.lastname
 * @param {string}     data.tarifId
 * @param {object}     data.bank
 * @param {string}     data.bank.iban
 * @param {string}     data.bank.holder
 * @param {string}     data.bank.name
 * @param {object}     data.adress
 * @param {string}     data.adress.street
 * @param {string}     data.adress.number
 * @param {string}     data.adress.plz
 * @param {string}     data.adress.city
 */
export const validateMemberData = data => {
  const errors = [];
  mapObjectKeys(data, (key, value) => {
    debugger;
    if (value) return;
    errors.push(key);
  });
  return errors;
};

const mapObjectKeys = (obj, callback) => {
  Object.keys(obj).map(key => {
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
