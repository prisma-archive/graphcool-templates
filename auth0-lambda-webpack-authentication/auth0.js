'use strict';
import authenticate from './authenticate';
import createResponse from './createResponse';
import GraphcoolService from './GraphcoolService';
import 'babel-polyfill';

module.exports.authenticate = authenticate(async (event, context, callback) => {
	const body = JSON.parse(event.body);
	if (!body.data) {
		callback(null, createResponse(400, 'No data found.'));
	}

	const accessToken = body.data.accessToken;

	const graphcoolService = new GraphcoolService(body);

	try {
		const graphcoolUserId = await graphcoolService.upsertUser(accessToken);
		const token = await graphcoolService.generateGraphcoolToken(graphcoolUserId);
		const response = createResponse(200, 'OK', { token });
		callback(null, response);
	} catch (error) {
		console.log(error);
		callback(null, createResponse(400, 'Error fetching user info.'));
	}
});
