const { expect } = require('chai');

const userApplicationFactory = require('./user');

describe('User Use Case', () => {
  const defaultFactoryParamsMock = {
    repository: {
      getUser: async () => {
        return;
      },
      addUser: async () => {
        return;
      },
    },
    model: {
      validate: () => {
        return {
          isSuccessful: true,
        };
      },
    },
  };

  const defaultParamsMock = {
    email: 'test',
    password: 'test',
    confirmPassword: 'test',
  };

  describe('New User', () => {
    it('should throw validation error', (done) => {
      const userServiceMock = userApplicationFactory(defaultFactoryParamsMock);
      userServiceMock.addUser(defaultParamsMock).then((result) => {
        const expectedResult = {
          message: 'User has been created',
          isSuccessful: true,
        };
        expect(result).to.deep.equal(expectedResult);
        done();
      });
    });
  });

  describe('User Data Validation', () => {
    it('should create a new user', (done) => {
      const validationResultMock = {
        isSuccessful: false,
        errors: ['test'],
      };

      const factoryParamsMock = {
        ...defaultFactoryParamsMock,
        model: {
          validate: () => {
            return validationResultMock;
          },
        },
      };

      const userServiceMock = userApplicationFactory(factoryParamsMock);

      const expectedErrorMessageValue = 'New User data has validation errors.';

      userServiceMock
        .addUser(defaultParamsMock)
        .then(() => {})
        .catch((error) => {
          expect(error.message).to.be.equal(expectedErrorMessageValue);
          expect(error.data).to.deep.equal(validationResultMock.errors);
          done();
        });
    });
  });

  describe('User exists', () => {
    it('should throw error when user exists and it is active', (done) => {
      const repositoryMock = {
        getUser: async () => {
          return { isActive: true };
        },
      };

      const factoryParamMock = {
        ...defaultFactoryParamsMock,
        repository: repositoryMock,
      };

      const userServiceMock = userApplicationFactory(factoryParamMock);

      const expectedErrorMessage = 'User already exists.';
      const expectedErrorData = ['User exists and it is still active'];

      userServiceMock
        .addUser(defaultParamsMock)
        .then(() => {})
        .catch((error) => {
          expect(error.message).to.be.equal(expectedErrorMessage);
          expect(error.data).to.deep.equal(expectedErrorData);
          done();
        });
    });
    it('should throw error when user exists and it is banned', (done) => {
      const banReasonMock = 'test';
      const repositoryMock = {
        getUser: async () => {
          return { isBanned: true, banReason: banReasonMock };
        },
      };

      const factoryParamMock = {
        ...defaultFactoryParamsMock,
        repository: repositoryMock,
      };

      const userServiceMock = userApplicationFactory(factoryParamMock);

      const expectedErrorMessage =
        'User has been banned due to violation of terms of service.';
      const expectedErrorData = [banReasonMock];

      userServiceMock
        .addUser(defaultParamsMock)
        .then(() => {})
        .catch((error) => {
          expect(error.message).to.be.equal(expectedErrorMessage);
          expect(error.data).to.deep.equal(expectedErrorData);
          done();
        });
    });

    it('should re-active user if it is not active', (done) => {
      const repositoryMock = {
        getUser: async () => {
          return { isActive: false, isBanned: false };
        },
        activateUser: async () => {
          return;
        },
      };

      const factoryParamMock = {
        ...defaultFactoryParamsMock,
        repository: repositoryMock,
      };

      const userServiceMock = userApplicationFactory(factoryParamMock);

      userServiceMock.addUser(defaultParamsMock).then((result) => {
        const expectedResult = {
          message: 'Disabled User has been re-activated.',
          isSuccessful: true,
        };
        expect(result).to.deep.equal(expectedResult);
        done();
      });
    });
  });
});
