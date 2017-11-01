// React
import React from 'react'
import validator from 'validator'
// GraphQL
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

class NewPassword extends React.Component {

  constructor(props) {
    super(props)
    this.state = { email: '', resetToken: '', password: '', passwordAgain: '', status: '' }
  }

  componentWillMount() {
    // Set state with url email and token, if any: https://mywebsite.com/reset?token=TOKEN&email=EMAIL
    let query = Object.assign({}, ...window.location.search.slice(1).split('&').map(item => {
      const property = item.split('=')[0]
      return { [property]: item.split('=')[1] }
    }))
    if (query.email && query.token) {
      this.setState({ email: query.email, resetToken: query.token })
    }
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }


  triggerResetPassword = () => {
    const { email } = this.state
    this.props.triggerPasswordReset({ variables: { email } })
    .then(id => {
      console.log(`Check your email address for a password reset link for user with id ${id}`)
      this.setState({ status: 'success' })
    })
    .catch(err => {
      console.error(err)
    })
  }

  resetPassword = () => {
    const { resetToken, password, passwordAgain } = this.state
    if (password === passwordAgain && password.length > 0) {
      this.props.resetPassword({ variables: { resetToken, password } })
      .then(id => {
        console.log(`Password restored for user with id ${id}`)
        this.setState({ status: 'success' })
      })
      .catch(err => {
        const errorMessage = err.toString().split(':')
        this.setState({ status: errorMessage[errorMessage.length-1] })
      })
    }
  }

  render() {
    const { email, resetToken, password, passwordAgain, status } = this.state
    // Subsequent password reset, called once user clicks on link in email, where user enters new password.
    // Url is like this: https://mywebsite.com/reset?token=TOKEN&email=EMAIL
    if (resetToken) {
      return (
        <div>
          {status === '' &&
          <div>
            Reset password for {email}
            <input
              autoFocus={true}
              placeholder='Password'
              name='password'
              onChange={this.onChange}
              type='password'
              value={password}
            />
            <input
              placeholder='Password (verify)'
              name='passwordAgain'
              onChange={this.onChange}
              type='password'
              value={passwordAgain}
            />
            <input
              onClick={() => this.resetPassword()}
              text='Reset password'
              type='button'
            />
          </div>}
          {status === 'success'
            ? <div>Password successfully reset.</div>
            : <div>{status}</div>}
        </div>
      )
    }
    // Initial password reset where user enters email.
    // Url is like this: https://mywebsite.com/reset
    return (
      <div>
        {status === '' &&
        <div>
          <input
            autoFocus={true}
            placeholder='Email'
            name='email'
            onChange={this.onChange}
            type='email'
            value={email}
          />
          <input
            onClick={validator.isEmail(email) ? () => this.triggerResetPassword() : null}
            text='Send link'
            type='button'
          />
        </div>}
        {status === 'success'
          ? <div>Please check your email address for a password reset link.</div>
          : <div>{status}</div>}
      </div>
    )
  }
}


const triggerResetMutation = gql`
  mutation($email: String!) {
    triggerPasswordReset(email: $email) {
      id
    }
  }
`

const resetPasswordMutation = gql`
  mutation($resetToken: String!, $password: String!) {
    resetPassword(resetToken: $resetToken, password: $password) {
      id
    }
  }
`

export default graphql(triggerResetMutation, { name: 'triggerPasswordReset' })(
  graphql(resetPasswordMutation, { name: 'resetPassword' })(NewPassword)
)
