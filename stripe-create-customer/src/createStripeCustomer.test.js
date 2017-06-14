describe('createStripeCustomer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('successfully created stripe customer', async () => {
    jest.doMock('stripe', () => (stripeKey) => ({
      customers: {
        create: email => ({id: 'testStripeId'}),
      }
    }));
    const {createStripeCustomer} = require("./createStripeCustomer");
    const testEmail = "borris@becker.com";
    const stripeCustomer = await createStripeCustomer(testEmail);
    expect(stripeCustomer.id).toEqual('testStripeId');
  });

  it('should throw an error when stripe customer creation fails', async () => {
    jest.doMock('stripe', () => (stripeKey) => ({
      customers: {
        create: email => {
          throw new Error(`error creating stripe customer ${email}`);
        }
      }
    }));
    const {createStripeCustomer} = require("./createStripeCustomer");
    const testEmail = "borris@becker.com";

    try {
      await createStripeCustomer(testEmail);
    } catch (err) {
      expect(err).toEqual(`error creating stripe customer ${testEmail}`);
    }
  });
});