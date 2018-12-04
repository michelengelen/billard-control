export const generateUniqueKey = () => (+new Date).toString(36);

const emailRegEx = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const validateEmail = email => !email || emailRegEx.test(String(email).toLowerCase());
