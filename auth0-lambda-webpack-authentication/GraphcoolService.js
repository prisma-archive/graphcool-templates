import { fromEvent } from 'graphcool-lib';
import fetch from 'isomorphic-fetch';

export default class GraphcoolService {
	constructor(event) {
		// The event in this case is our request body data, which contains values required by graphcool-lib.
		this.graphcool = fromEvent(event);
		this.api = this.graphcool.api('simple/v1');
	}

	/**
   * Gets the user from Graphcool.
   * 
   * @param {string} userId - The Id of the auth0 user.
   * @returns - the full user object.
   * @memberof GraphcoolService
   */
	async getUser(userId) {
		const query = `
    query {
      User(auth0UserId: "${userId}") {
        id
      }
    }`;

		const response = await this.api.request(query);
		return response.User;
	}

	/**
   * Creates a new User in the Graphcool database using data from Auth0.
   * 
   * @param {any} auth0AccessToken - The accessToken provided to the user after login.
   * @returns - the new users ID.
   * @memberof GraphcoolService
   */
	async createUser(auth0AccessToken) {
		const auth0User = await this.fetchAuth0UserProfile(auth0AccessToken);

		// Assign other values (graphql specific, maybe) to the second parameter here, if you wish.
		const graphcoolUser = Object.assign({}, {}, auth0User);

		const createUserMutation = `
        mutation {
          createUser(
            auth0UserId:"${graphcoolUser.sub}"
            name: "${graphcoolUser.name}"
            familyName: "${graphcoolUser.family_name}"
            givenName: "${graphcoolUser.given_name}"
            picture: "${graphcoolUser.picture}"
            email: "${graphcoolUser.email}"
            emailVerified: ${graphcoolUser.email_verified}
          ) {
            id
          }
        }`;

		const response = await this.api.request(createUserMutation);
		return response.createUser.id;
	}

	/**
   * Will first check to see if the user exists. If it does, the user is returned.
   * If the user does not exist in the Graphcool database, it tries to create one using 
   * the accessToken provided to the user when they logged in.
   * 
   * @param {any} auth0AccessToken - The accessToken provided to the user after login.
   * @returns - Returns the user ID.
   * @memberof GraphcoolService
   */
	async upsertUser(auth0AccessToken) {
		const auth0User = await this.fetchAuth0UserProfile(auth0AccessToken);
		if (!auth0User) {
			return this.createUser(auth0AccessToken);
		}

		const user = await this.getUser(auth0User.sub);
		console.log({ user });
		if (user === null) {
			return this.createUser(auth0AccessToken);
		} else {
			return user.id;
		}
	}

	/**
   * Gets the profile from auth0 belonging to the user associated with the provided accessToken.
   * 
   * @param {any} auth0AccessToken - The accessToken provided to the user after logging in with Auth0.
   * @returns - The Auth0 user profile.
   * @memberof GraphcoolService
   */
	async fetchAuth0UserProfile(auth0AccessToken) {
		const profileUrl = `https://${process.env
			.AUTH0_DOMAIN}/userinfo?access_token=${auth0AccessToken}`;

		const response = await fetch(profileUrl);
		return response.json();
	}

	generateGraphcoolToken(graphcoolUserId) {
		return this.graphcool.generateAuthToken(graphcoolUserId, 'User');
	}
}
