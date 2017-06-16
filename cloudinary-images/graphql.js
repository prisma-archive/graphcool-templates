import gql from 'graphql-tag'

export const createUserAvatar = gql`
	mutation {
		createUserAvatar {
			id
		}
	}
`

export const assignFileToUserAvatar = gql`
	mutation($userAvatarId: ID!, $fileId: ID!) {
		assignFileToUserAvatar: setUserAvatarToFileRelation(userAvatarUserAvatarId: $userAvatarId, fileFileId: $fileId) {
			userAvatarUserAvatar {
				id
			}
			fileFile {
				id
			}
		}
	}
`

export const assignUserAvatarToUser = gql`
	mutation($userAvatarId: ID!, $userId: ID!) {
		assignUserAvatarToUser: setUserAvatarToUserRelation(userAvatarUserAvatarId: $userAvatarId, userUserId: $userId) {
			userAvatarUserAvatar {
				id
			}
			userUser {
				id
			}
		}
	}
`

export const updateUserAvatar = gql`
	mutation ($userAvatarId: ID!, $imageUrl: String!) {
		updateUserAvatar: updateUserAvatar(id: $userAvatarId, imageUrl: $imageUrl) {
			id
		}
	}
`

export const receiveCloudinaryUrl = gql`
	subscription($id: ID!) {
		UserAvatar(filter: {
			mutation_in: [UPDATED]
			node: {
				user: {
					id: $id
				},
				cloudinaryUrl_not: "null"
			}
			updatedFields_contains: "cloudinaryUrl"
		}) {
			node {
				cloudinaryUrl
			}
		}
	}
`
