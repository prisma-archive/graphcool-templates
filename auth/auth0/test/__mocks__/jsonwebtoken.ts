import 'jest'

const jwt: any = jest.genMockFromModule('jsonwebtoken')

let decodeMock = {}

jwt.__setDecodeMock = (res: object) => decodeMock = res
jwt.verify = (token, secret, options, cb) => cb(null)
jwt.decode = () => decodeMock

module.exports = jwt
