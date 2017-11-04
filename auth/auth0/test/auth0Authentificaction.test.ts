import 'jest'
jest.mock('jsonwebtoken')

import auth0Auth from '../src/auth0Authentication'
import * as jwt from 'jsonwebtoken'
import * as nock from 'nock'

const graphcool = {
  projectId: 'abc',
  rootToken: 'graphcoolRootToken'
}

const getEvent = (accessToken?): any => ({
  data: { accessToken },
  context: { graphcool }
})

describe('auth0Authentification', () => {
  beforeEach(() => {
    // set env params
    process.env.AUTH0_DOMAIN = 'myproject.eu.auth0.com'
    process.env.AUTH0_AUDIENCE = 'https://myproject.eu.auth0.com/api/v2/'

    // well-known mock
    nock('https://myproject.eu.auth0.com')
      .get('/.well-known/jwks.json')
      .reply(200)

    // graphcool mock
    nock(`https://api.graph.cool/simple/v1`)
      .post(`/${graphcool.projectId}`, body => {
        return (/getUser/.exec(body.query) && body.variables.auth0UserId === "already-user")
      })
      .reply(200, { data: { User: { id: "user-01" } } })

    nock(`https://api.graph.cool/simple/v1`)
      .post(`/${graphcool.projectId}`, body => {
        return (/getUser/.exec(body.query) && body.variables.auth0UserId !== "already-user")
      })
      .reply(200, { data: { User: null } })

    nock(`https://api.graph.cool/simple/v1`)
      .post(`/${graphcool.projectId}`, body => {
        return (/createUser/.exec(body.query))
      })
      .reply(200, { data: { createUser: { id: "user-02" } } })

    nock(`https://api.graph.cool/system`)
      .post('', body => {
        return /generateNodeToken/.exec(body.query)
      })
      .reply(200, (uri, body) => {
        const userId = /user-(\d\d)/.exec(body.query)[0]
        return {
          data: {
            generateNodeToken: {
              token: `graphcool-token-${userId}`
            }
          }
        }
      })

    // jsonwebtoken mock
    require('jsonwebtoken').__setDecodeMock({ sub: "fafa" })
  })

  it('should return an error if `AUTH0_DOMAIN` is not set', () => {
    delete process.env.AUTH0_DOMAIN
    return auth0Auth(null).then(data => {
      expect(data).toEqual({ error: 'Auth0 Authentification not configured correctly.' })
    })
  })

  it('should return an error if `AUTH0_AUDIENCE` is not set', () => {
    delete process.env.AUTH0_AUDIENCE
    return auth0Auth(null).then(data => {
      expect(data).toEqual({ error: 'Auth0 Authentification not configured correctly.' })
    })
  })

  it('should return an error if `accessToken` is not valid', () => {
    return auth0Auth(getEvent({ data: { accessToken: 'notAJWT' } }))
      .then(data => {
        expect(data).toEqual({ "error": "An unexpected error occured during authentication." })
      })
  })

  it('should create a user', () => {
    // getAuth0User mock
    nock('https://myproject.eu.auth0.com')
      .get(/\/userinfo\?access_token/)
      .reply(200, JSON.stringify({ sub: "new-user" }))

    return auth0Auth(getEvent())
      .then(data => {
        expect(data).toEqual({ data: { id: "user-02", token: "graphcool-token-user-02" } })
      })
  })

  it('should retrieve a user', () => {
    // getAuth0User mock
    nock('https://myproject.eu.auth0.com')
      .get(/\/userinfo\?access_token/)
      .reply(200, JSON.stringify({ sub: "already-user" }))

    return auth0Auth(getEvent())
      .then(data => {
        expect(data).toEqual({ data: { id: "user-01", token: "graphcool-token-user-01" } })
      })
  })
})
