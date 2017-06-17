// React
import React from 'react'
// GraphQL
import { graphql } from 'react-apollo'
import { createUserAvatar, assignFileToUserAvatar, assignUserAvatarToUser, updateUserAvatar, receiveCloudinaryUrl } from './graphql'
// Photo
import Dropzone from 'react-dropzone'

class Photo extends React.Component {

  constructor(props) {
    super(props)
    this.state = { imageUrl: '' }
    this.onDrop = this.onDrop.bind(this)
  }

  componentDidUpdate() {
    const { id } = this.props.user
    if (!this.cloudinarySubscription) {
      this.cloudinarySubscription = this.props.subscription({
        document: receiveCloudinaryUrl,
        variables: { id },
        // eslint-disable-next-line
        updateQuery: (previousState, response) => {
          this.setState({
            imageUrl: response.subscriptionData.data.UserAvatar.node.cloudinaryUrl
          })
          this.cloudinarySubscription()
        },
        onError: (err) => console.error(err)
      })
    }
  }

  onDrop(files) {
    // prepare form data, use data key!
    let data = new FormData()
    data.append('data', files[0])
    // use the file endpoint
    fetch('https://api.graph.cool/file/v1/___PROJECT_ID___', {
      method: 'POST',
      body: data
    })
    .then(response => (response.json()))
    .then(image => {
      this.setState({ imageUrl: image.url })
      this.props.createUserAvatar()
      .then(({ data }) => {
        const userAvatarId = data.createUserAvatar.id
        this.props.assignFileToUserAvatar({
          variables: {
            userAvatarId,
            fileId: image.id
          }
        })
        .then(() => {
          this.props.assignUserAvatarToUser({ variables: { userAvatarId, userId: this.props.user.id } })
          .then(() => {
            this.props.updateUserAvatar({ variables: { userAvatarId, imageUrl: image.url } })
            .then(() => {
              console.log('DONE');
            })
            .catch((e) => { console.log('updateUserAvatar'); console.error(e) })
          })
          .catch((e) => { console.log('assignUserAvatarToUser'); console.error(e) })
        })
        .catch((e) => { console.log('assignFileToUserAvatar'); console.error(e) })
      })
      .catch((e) => { console.log('createUserAvatar'); console.error(e) })
    })
    .catch((e) => { console.log('image post'); console.error(e) })
  }

  render() {
    console.log(this.state.imageUrl);
    return (
      <div>
        {!this.state.imageUrl?
          <div className='capps-input-row'>
            <Dropzone
              onDrop={this.onDrop}
              accept='image/*'
              multiple={false}
            >
              <div>
                drag and drop your profile photo here or click to choose one from your device.
              </div>
            </Dropzone>
          </div>
        :
          <img src={this.state.imageUrl} style={{ width: '200px', height: '200px' }} />}
          <div className='capps-height-20' />
      </div>
    )
  }
}

export default graphql(createUserAvatar, { name: 'createUserAvatar' })(
  graphql(assignFileToUserAvatar, { name: 'assignFileToUserAvatar' })(
    graphql(assignUserAvatarToUser, { name: 'assignUserAvatarToUser' })(
      graphql(updateUserAvatar, { name: 'updateUserAvatar' })(Photo)
    )
  )
)
