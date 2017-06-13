jest.mock('stripe', () => ({
  customers: {
    create: email => ({id: 'somestripeid'}),
  }
}));

import main from './createStripeCustomer';
const createStripeCustomer = main.__get__('createStripeCustomer');

describe('createStripeCustomer', () => {
  it('should return stripe customer object on success', async () => {
    const stripeCustomer = await createStripeCustomer('some@email');
    expect(stripeCustomer).toEqual({id: 'horny bastard'});
  });
});

