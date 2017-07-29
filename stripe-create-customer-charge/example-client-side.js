// React
import React from 'react'
import StripeCheckout from 'react-stripe-checkout'
// GraphQL
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

class Stripe extends React.Component {

	constructor(props) {
		super(props)
		this.state = { success: false }
		this.onToken = this.onToken.bind(this)
	}

	componentDidUpdate() {
		// Get user id
		const userId = this.props.user.id
		// Load subscription for the first time
		if (!this.purchaseSubscription) {
			this.purchaseSubscription = this.props.subscription({
				document: gql`
					subscription($userId: ID!) {
						User(filter: {
							mutation_in: [UPDATED]
							updatedFields_contains: "isPaid"
							node: {
								id: $userId
								isPaid: true
							}
						}) {
							node {
								id
							}
						}
					}
				`,
				variables: { userId },
				updateQuery: (previousState, {}) => {
					console.log('App upgraded')
					// Important: Mark as a success so that the Failure ops don’t get called after 14 seconds (see onToken)
					this.setState({ success: true })
					// Important: cancel subscription.
					this.purchaseSubscription()
					// Success! Perform whatever success ops you need, here.
					// ...
				},
				onError: (err) => console.error(err)
			})
		}
	}

	onToken(token) {
		const stripeToken = token.id
		// Get user id
		const userId = this.props.user.id
		// Status is purchasing...
		this.props.createStripe({ variables: { userId, stripeToken } })
			.then(() => {
				setTimeout(() => {
					if (!this.state.success) {
						// Failure. Perform whatever success ops you need, here.
						// ...
					}
				}, 14000)
			})
			.catch((e) => { console.error(e) })
	}

	render() {
		return (
			<div>
				<StripeCheckout
					name="My Demo App"
					description="It’s super duper awesome."
					image="__IMAGE__"
					ComponentClass="div"
					panelLabel="Upgrade"
					amount={999}
					currency="USD"
					stripeKey="__STRIPE_PUBLIC_KEY__"
					email={this.props.user.email}
					shippingAddress={false}
					billingAddress={true}
					zipCode={true}
					bitcoin
					allowRememberMe
					token={this.onToken}
					reconfigureOnUpdate={false}
					triggerEvent="onClick"
				>
					<div>Upgrade (US $9.99)</div>
				</StripeCheckout>
			</div>
		)
	}
}

const createStripe = gql`
	mutation($userId: ID!, $stripeToken: String!) {
		updateUser(id: $userId, stripeToken: $stripeToken) {
			id
		}
	}
`

export default graphql(createStripe, { name: 'createStripe' })(Stripe)
