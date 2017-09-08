const slugify = require('slugify')

module.exports = function (event) {
  const name = event.data.name
  const suffix = Math.random().toString(36).substring(8)
  
  const slugifiedName = slugify(name, {
    lower: true
  })
  
  const slug = `${slugifiedName}-${suffix}`
  
  event.data.slug = slug

  return {
    data: event.data
  }
}
