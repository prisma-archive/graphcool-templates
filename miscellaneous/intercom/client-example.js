// This example uses both a web app and a Cordova-based native app (iOS or Android)

/* global cordova */
/* global intercom */
/* eslint-disable camelcase */

// React
import React from 'react'
// GraphQL
import { graphql } from 'react-apollo'

class App extends React.Component {

	componentWillMount() {
		if (this.props) {
			const { user } = this.props
			this.props.loadIntercom({ variables: { email: user.email, platform: process.env.REACT_APP_ENV } })
				.then(({ data }) => {
					const { hash } = data.loadIntercom
					// iOS or Android
					if (process.env.REACT_APP_TYPE === 'cordova') {
						// Make sure no other session is currently registered
						intercom.reset()
						intercom.setUserHash(hash)
						intercom.registerIdentifiedUser({
							userId: user.id
						})
						intercom.updateUser({
							created_at: new Date(user.createdAt),
							email: user.email,
							name: user.firstName + ' ' + user.lastName,
							custom_attributes: {
								'First name': user.firstName,
								'Last name': user.lastName,
								'Paid': user.isPaid,
								'Trial': user.isTrial,
								// Pass through hidden variables
								'App version': process.env.REACT_APP_VERSION,
								'App env': process.env.REACT_APP_ENV,
								'App type': process.env.REACT_APP_TYPE
							}
						})
					}
					// Web app
					else {
						// Make sure no other session is currently registered
						window.Intercom('shutdown')
						window.Intercom('boot', {
							// Replace with your Intecom app id
							app_id: __INTERCOM_APP_ID__,
							user_hash: hash,
							user_id: user.id,
							created_at: new Date(user.createdAt),
							email: user.email,
							name: user.firstName + ' ' + user.lastName,
							'First name': user.firstName,
							'Last name': user.lastName,
							'Paid': user.isPaid,
							'Trial': user.isTrial,
							// Pass through hidden variables
							'App version': process.env.REACT_APP_VERSION,
							'App env': process.env.REACT_APP_ENV,
							'App type': process.env.REACT_APP_TYPE,
							// Custom launcher
							custom_launcher_selector: '#intercom-support',
							hide_default_launcher: true
						})
					}
				})
			if (process.env.REACT_APP_ENV === 'ios') {
				intercom.registerForPush()
			}
		}
	}

	selectComponent = () => {
		const { nav } = this.props.state
		const { page, data } = nav[nav.length-1]
		if (process.env.NODE_ENV === 'development') {
			console.group('%c Page data', 'font-weight:700; color:#0000FF')
			console.log(page, data)
			console.groupEnd()
			console.group('%c Props', 'font-weight:700; color:#AA0000')
			console.log(this.props)
			console.groupEnd()
		}
		switch (page) {
		case 'Home': return <Home {...data} {...this.props} />
		case 'Overview': return <Overview {...data} {...this.props} />
		case 'LifePath': return <LifePath {...data} {...this.props} />
		case 'PrimaryEnergies': return <PrimaryEnergies {...data} {...this.props} />
		case 'UniversalLaws': return <UniversalLaws {...data} {...this.props} />
		case 'LifeCycle': return <LifeCycle {...data} {...this.props} />
		case 'Contact': return <Contact {...data} {...this.props} />
		case 'OurRelationship': return <OurRelationship {...data} {...this.props} />
		case 'Relationships': return <Relationships {...data} {...this.props} />
		case 'RelEnergies': return <RelEnergies {...data} {...this.props} />
		case 'RelLaws': return <RelLaws {...data} {...this.props} />
		case 'About': return <About {...data} {...this.props} />
		case 'System': return <System {...data} {...this.props} />
		case 'Medium': return <Medium {...data} {...this.props} />
		case 'List': return <List {...data} {...this.props} />
		case 'Epub': return <Epub {...data} {...this.props} />
		case 'Settings': return <Settings {...data} {...this.props} />
		case 'Welcome': return <Welcome {...data} {...this.props} />
		default: return null
		}
	}

	render() {
		return (
			<div>
				Hello world.
			</div>
		)
	}
}


// Load Intercom uses custom `loadIntercom` schema extension
const loadIntercom = gql`
	mutation($email: String!, $platform: String!) {
		loadIntercom(email: $email, platform: $platform) {
			hash
		}
	}
`

export default graphql(loadIntercom, { name: 'loadIntercom' })(App)
