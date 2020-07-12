module.exports = (message, errors) => {
  const error = new Error();
  error.message = message;
  error.data = errors;
  return error;
};
