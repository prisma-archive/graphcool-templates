import fs from 'fs';
import jwt from 'jsonwebtoken';
import createResponse from './createResponse';

// Add your Auth0 PEM key here.
const SECRET = fs.readFileSync('cert.pem');

/**
 * This function takes your lambda function as an argument and returns a function that 
 * validates the request body before invoking the Lambda handler. Feel free to modify and re-use 
 * this for whatever validation purposes you may have. All of this logic could be moved to the 
 * Lambda directly, but the main business logic of our Lambda function looks a lot cleaner this way. :)
 */
export default function(lambda) {
	return function authenticate() {
		// Getting the event and callback from the lambda function.
		const args = Array.prototype.slice.call(arguments);
		const callback = args[2];
		const event = args[0];

		let body;
		try {
			body = JSON.parse(event.body);
		} catch (error) {
			callback(null, createResponse(400, 'Unable to parse body data.'));
			return;
		}

		if (!body || !body.data) {
			callback(null, createResponse(400, 'No body found.'));
			return;
		}

		// We need to validate the idToken for security purposes.
		const { data: { idToken } } = body;

		if (!idToken) {
			console.error('No idToken provided.');
			callback(null, createResponse(403, 'Unauthorized.', null));
			return;
		}

		const issuer = `https://${process.env.AUTH0_DOMAIN}/`;

		// Add other JWT options here, if you wish.
		const jwtOptions = {
			algorithms: [ 'RS256' ],
			audience: process.env.AUTH0_CLIENT_ID,
			issuer,
		};

		// Validate the idToken using the PEM key above.
		return jwt.verify(idToken, SECRET, jwtOptions, (err) => {
			if (err) {
				console.error(`Failed jwt verify: ${err}.`);
				callback(null, createResponse(403, 'Invalid Token provided.', null));
				return;
			}

			return lambda.apply(this, args);
		});
	};
}
