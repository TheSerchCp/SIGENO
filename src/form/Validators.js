export const Validators = {
  required: (value) => {
    return !value || value.toString().trim() === '' 
      ? { required: true } 
      : null;
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) 
      ? { email: true } 
      : null;
  },

  minLength: (length) => (value) => {
    return value && value.length < length 
      ? { minLength: { required: length, actual: value.length } } 
      : null;
  },

  maxLength: (length) => (value) => {
    return value && value.length > length 
      ? { maxLength: { required: length, actual: value.length } } 
      : null;
  },

  pattern: (regex) => (value) => {
    return !regex.test(value) 
      ? { pattern: true } 
      : null;
  },

  custom: (validationFn) => validationFn
};