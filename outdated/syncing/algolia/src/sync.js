const algoliasearch = require('algoliasearch')

const client = algoliasearch('ALGOLIA_APP_ID', 'ALGOLIA_API_KEY')
const index = client.initIndex('ALGOLIA_INDEX_NAME')

const modelName = 'SyncModel'

module.exports = event => {

  if (!process.env['ALGOLIA_APP_ID']) {
    console.log('Please provide a valid Algolia app id!')
    return { error: 'Module not configured correctly.' }
  }

  if (!process.env['ALGOLIA_API_KEY']) {
    console.log('Please provide a valid Algolia api key!')
    return { error: 'Module not configured correctly.' }
  }

  if (!process.env['ALGOLIA_INDEX_NAME']) {
    console.log('Please provide a valid Algolia index name!')
    return { error: 'Module not configured correctly.' }
  }

  const mutation = event.data[modelName].mutation
  const node = event.data[modelName].node
  const previousValues = event.data[modelName].previousValues

  switch (mutation) {
    case 'CREATED':
    return syncAddedNode(node)
    case 'UPDATED':
    return syncUpdatedNode(node)
    case 'DELETED':
    return syncDeletedNode(previousValues)
    default:
    console.log(`mutation was '${mutation}'. Unable to sync node.`)
    return Promise.resolve()
  }
}

function syncAddedNode(node) {
  console.log('Adding node')
  return index.addObject(node)
}

function syncUpdatedNode(node) {
  console.log('Updating node')
  return index.saveObject(node)
}

function syncDeletedNode(node) {
  console.log('Deleting node')
  return index.deleteObject(node.objectID)
}
