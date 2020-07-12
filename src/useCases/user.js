const buildCustomError = require('../utils/buildCustomError');

const userApplicationFactory = ({ repository, model }) => {
  const addUser = async ({ email, password, confirmPassword }) => {
    const { isSuccessful, errors } = model.validate({
      email,
      password,
      confirmPassword,
    });

    if (!isSuccessful) {
      const error = buildCustomError(
        'New User data has validation errors.',
        errors || []
      );
      throw error;
    }

    const existingUser = await repository.getUser(email);

    if (existingUser) {
      if (existingUser.isActive) {
        const error = buildCustomError('User already exists.', [
          'User exists and it is still active',
        ]);
        throw error;
      }

      if (existingUser.isBanned) {
        const error = buildCustomError(
          'User has been banned due to violation of terms of service.',
          [existingUser.banReason]
        );
        throw error;
      }

      await repository.activateUser(email);

      return {
        message: 'Disabled User has been re-activated.',
        isSuccessful: true,
      };
    }

    await repository.addUser({ email, password });

    return { message: 'User has been created', isSuccessful: true };
  };

  return Object.freeze({
    addUser,
  });
};

module.exports = userApplicationFactory;
