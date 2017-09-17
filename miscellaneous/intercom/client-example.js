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
      // Pass through two variables: user email and platform (web app, iOS, or Android)
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
