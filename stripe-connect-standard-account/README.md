# stripe-connect-standard-account

Connect a Standard Stripe Account to your Platform with Schema Extensions and Graphcool Functions ⚡️

> Note: Schema Extensions are currently only available in the Beta Program.

## Workflow

This example covers the following scenario: An already registered users wants to connect his standard account to your platform.

This is the workflow:
* First, we check if the user id provided as function argument matches the user id embedded in the authentication token of the `Authorization` header.
* We pass the provided Stripe authentication code (previously obtained in the frontend) to fetch the user details from the Stripe API
* We update the `User` node stored in the Graphcool project with the relevant user credentials obtained from Stripe

For more information refer to the [official Stripe documentation](https://stripe.com/docs/connect/standard-accounts).
