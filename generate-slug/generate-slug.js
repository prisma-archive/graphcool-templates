'use strict';
module.exports = function (event, cb) {
  let name = event.data.name
  const slug = name.toLowerCase().replace(' ', '-')
  const response = Object.assign({}, event.data, {slug})

  return {
    data: response
  }
}
