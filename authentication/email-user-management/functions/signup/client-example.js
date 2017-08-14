// This is just an example and by no means the only or a better way to handle the authentication process. It has not been fully tested in its current form. Use at your own risk.

import React from 'react'
import { graphql, compose } from 'react-apollo'
import validator from 'validator'

class Signup extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			authProcess: 'login',
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			passwordConfirm: '',
			confirm: { email: '', token: '' }
		}
		this.loginUser = this.loginUser.bind(this)
		this.signupUser = this.signupUser.bind(this)
		this.resetAuthProcess = this.resetAuthProcess.bind(this)
		this.handleInput = this.handleInput.bind(this)
	}

	componentWillMount() {
		// Set state with url email and token, if any: https://mywebsite.com/reset?token=TOKEN&email=EMAIL
		let query = Object.assign({}, ...window.location.search.slice(1).split('&').map(item => {
			const property = item.split('=')[0]
			return { [property]: item.split('=')[1] }
		}))
		if (query.email && query.token) {
			// setState to 'confirming' to hide signup or signin input fields.
			this.setState({ authProcess: 'confirming', confirm: { email: query.email, token: query.token } })
		}
	}

	componentWillReceiveProps(nextProps) {
		const { token } = this.state.confirm
		if (!nextProps.loading && token) {
			console.log('Confirming email...')
			// Initiate schema extension...
			this.props.confirmEmail({ variables: { confirmToken: token } })
			.then(() => {
				// Update authProcess to reveal message to user and prompt user to sign in (see render)
				this.setState({ authProcess: 'confirmed' })
			})
			.catch(err => {
				// Prompt user to re-register.
				console.log('Email not confirmed. Please re-register.')
				console.error(err)
				this.setState({ authProcess: 'login' })
			})
		}
	}

	loginUser() {
		const { setPage } = this.props.redux.nav
		const { email, password } = this.state
		this.props.signinUser({ variables: { email, password } })
			.then(({ data }) => {
				const { token, confirmed } = data.authenticateEmailUser
				if (!confirmed) {
					// Notify user
					console.log('Your email has not yet been confirmed. Would you like us to resend a confirmation to your email address?')
					// On yes, run schema extension:
					this.props.resendConfirmation({ variables: { email } })
						.then(id => {
							// Notify user
							console.log('Please check your email address and click the confirmation link to confirm your account.')
							this.resetAuthProcess()
						})
					return false
				}
				// Otherwise, if account is already confirmed, store authentication token
				window.localStorage.setItem('MyApp:login', token)
				// Add code here to go to main app. May require Apollo refetch or window.location.reload()
			})
			.catch(err => {
				console.log(err)
				console.log('Login failed. Assume new customer, so move onto registration.');
				this.setState({ authProcess: 'registration' })
			})
	}

	signupUser() {
		const { email, password, firstName, lastName } = this.state
		this.props.createUser({ variables: { email, password, firstName, lastName } })
			.then(() => {
				// Successfully created user. Now wait for user to click on confirmation link in email. Set authProcess to 'confirm' to reveal instructions to user (see render).
				this.setState({ authProcess: 'confirm' })
			})
			.catch(err => console.log(err))
	}

	resetAuthProcess() {
		this.setState({
			authProcess: 'login',
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			passwordConfirm: ''
		})
	}

	handleInput(name, value) {
		this.setState({ [name]: value })
	}

	render() {
		const { authProcess, firstName, lastName, email, password, passwordConfirm } = this.state
		let buttonText
		let buttonFunc
		switch (authProcess) {
			case 'login':
				buttonText = 'Sign up or sign in for free'
				buttonFunc = () => this.loginUser()
				break
			case 'registration':
				buttonText = 'Sign up'
				buttonFunc = () => this.signupUser()
			case 'confirm':
				buttonText = 'Continue'
				buttonFunc = () => this.resetAuthProcess()
			case 'confirmed':
				buttonText = 'Sign in'
				buttonFunc = () => this.loginUser()
			default:
				buttonText = 'Sign up or sign in for free'
				buttonFunc = () => this.loginUser()
		}
		return (
			<div>
				{authProcess === 'login' && <div>Please sign up or sign in.</div>}
				{authProcess === 'confirmed' && <div>Account confirmed! Please log in.</div>}
				{(authProcess === 'login' || authProcess === 'registration' || authProcess === 'confirmed') &&
					<div>
						<input
							name='email'
							onChange={(name, value) => this.handleInput(name, value)}
							placeholder='Please enter your email'
							type='email'
							value={email}
						/>
						<input
							name='password'
							onChange={(name, value) => this.handleInput(name, value)}
							placeholder='Please enter a password'
							type='password'
							value={password}
						/>
					</div>}
				{authProcess === 'registration' &&
					<div>
						<div>Already registered? <span onTouchTap={() => {
								window.history.pushState('', '', '/reset')
								// Call password reset component here
							}}>Click here</span> to reset your password. Otherwise, please complete your signup below.
						</div>
						<input
							name='passwordConfirm'
							onChange={(name, value) => this.handleInput(name, value)}
							placeholder='Please confirm your password'
							type='password'
							value={passwordConfirm}
						/>
						{password !== passwordConfirm && <div style={{ color: '#FF0000' }}>Password does not match</div>}
						{password === passwordConfirm && <div style={{ color: '#008000' }}>Password confirmed</div>}
						<div>
							<input
								name='firstName'
								onChange={(name, value) => this.handleInput(name, value)}
								placeholder='Please enter your first name'
								type='text'
								value={firstName}
							/>
							<input
								name='lastName'
								onChange={(name, value) => this.handleInput(name, value)}
								placeholder='Please enter your last name'
								type='text'
								value={lastName}
							/>
						</div>
					</div>}
				{authProcess === 'confirm' &&
					<div>
						<div>Please check your email for an email confirmation link for this email: <strong>{email}</strong>. You’ll need to confirm your email before you can use this app.</div>
						<div>If you entered an incorrect email address or don’t have access to it, please re-register using a different email address.</div>
					</div>}
				{(authProcess === 'login' || authProcess === 'registration' || authProcess === 'confirm' || authProcess === 'confirmed') && <div onTouchTap={buttonFunc}>{buttonText}</div>}
			</div>
		)
	}
}

// Create user uses custom `signupEmailUser` schema extension. See `1-signup`.
export const createUser = gql`
	mutation ($email: String!, $password: String!, $firstName: String!, $lastName: String!, $birthDay: Int!, $birthMonth: Int!, $birthYear: Int!) {
		signupEmailUser(email: $email, password: $password) {
			id
		}
	}
`

// Email confirmation uses custom `confirmEmail` schema extension. See `3-confirm`.
export const confirmEmail = gql`
	mutation($confirmToken: String!) {
		confirmEmail(confirmToken: $confirmToken) {
			id
		}
	}
`

// Signin user uses custom `authenticateEmailUser` schema extension. See Graphcool functions example on `authenticate`.
export const signinUser = gql`
	mutation($email: String!, $password: String!) {
		authenticateEmailUser(email: $email, password: $password) {
			id
			token
			confirmed
		}
	}
`

// Resend confirmation email uses custom `resendConfirmation` schema extension. See `4-resend`.
export const resendConfirmation = gql`
	mutation($email: String!) {
		resendConfirmation(email: $email) {
			id
		}
	}
`

export default compose(
	graphql(createUser, { name: 'createUser' }),
	graphql(signinUser, { name: 'signinUser' }),
	graphql(confirmEmail, { name: 'confirmEmail' }),
	graphql(resendConfirmation, { name: 'resendConfirmation' })
)(InitUser)
