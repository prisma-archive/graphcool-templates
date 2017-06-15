/**
 * Global mock for isomorphic-fetch
 */

const fetch = jest.fn();

const response = (status, statusText, ok, body) => {
  return {
    url: '',
    status,
    statusText,
    ok,
    json: () => body,
  }
};

fetch.mockSuccess = (body, opts = {ok: true, status: 200, statusText: ''}) =>
  fetch.mockImplementationOnce(() =>
    Promise.resolve(response(opts.status, opts.statusText, opts.ok, body)));

fetch.mockFailure = (error) => fetch.mockImplementationOnce(() => Promise.reject(error));

export default fetch;
