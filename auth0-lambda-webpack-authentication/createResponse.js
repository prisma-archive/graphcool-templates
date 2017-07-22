/** 
* This is a simple helper method for creating an API Gateway repsonse body.
*/
export default (statusCode, message, data) => ({ statusCode, body: JSON.stringify({ message, data }) })

