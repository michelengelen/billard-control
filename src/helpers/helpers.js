export const generateUniqueKey = () => (+new Date).toString(36);

const emailRegEx = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const validateEmail = email => !email || emailRegEx.test(String(email).toLowerCase());

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
  })
};
