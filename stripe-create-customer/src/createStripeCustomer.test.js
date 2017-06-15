jest.mock('isomorphic-fetch', () => global.fetch);

describe('createStripeCustomer', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return a valid stripe customer after creating a stripe customer', async () => {
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

    it('should return a valid graphcool customer after successful update', async () => {
        fetch.mockSuccess({id: 'graphCoolId', stripeCustomerId: 'stripeId'});
        const {updateGraphCoolCustomer} = require("./createStripeCustomer");

        const graphCoolCustomer = await updateGraphCoolCustomer('graphCoolId', 'stripeId');
        expect(graphCoolCustomer).toMatchObject({id: 'graphCoolId', stripeCustomerId: 'stripeId'});
        expect(graphCoolCustomer).toMatchObject({id: 'graphCoolId', stripeCustomerId: 'stripeId'});
    });

    it('should throw an error when updateGraphCoolCustomer fails', async () => {
        fetch.mockFailure('something went wrong when updating graph cool customer');
        const {updateGraphCoolCustomer} = require("./createStripeCustomer");

        try {
            await updateGraphCoolCustomer('graphCoolId', 'stripeId');
        } catch (err) {
            expect(err).toEqual(`something went wrong when updating graph cool customer`);
        }
    });

    it('should return a valid graphcool customer with a valid stripe id', async () => {
        // arrange
        jest.doMock('stripe', () => (stripeKey) => ({
            customers: {
                create: email => ({id: 'stripeId'}),
            }
        }));
        fetch.mockSuccess({id: 'graphCoolId', stripeCustomerId: 'stripeId'});
        const main = require("./createStripeCustomer").default;
        const event = {
            data: {
                Customer: {
                    node: {
                        id: 'graphCoolCustomerId',
                        email: 'some@email.com',
                        stripeCustomerId: 'stripeId'
                    }
                }
            }
        };

        // act
        const result = await main(event);

        // assert
        expect(result).toEqual({
            data: {
                Customer: {
                    node: {
                        id: 'graphCoolCustomerId',
                        email: 'some@email.com',
                        stripeCustomerId: 'stripeId'
                    }
                }
            }
        });
    });

    it('should throw an error on failure', async () => {
        jest.doMock('stripe', () => (stripeKey) => ({
            customers: {
                create: email => ({id: 'stripeId'}),
            }
        }));
        fetch.mockFailure('something went wrong when updating graph cool customer');
        const main = require("./createStripeCustomer").default;
        const event = {
            data: {
                Customer: {
                    node: {
                        id: 'graphCoolCustomerId',
                        email: 'some@email.com',
                        stripeCustomerId: 'stripeId'
                    }
                }
            }
        };

        try {
            const result = await main(event);
        } catch (err) {
            expect(err).toEqual(`something went wrong when updating graph cool customer`);
        }
    });
});