'use strict';
module.exports = function (event) {
  let title = event.data.title
  const slug = title
  	.toLowerCase()
  	.trim()
  	.replace(/\s+/g, "-")
  	.replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
  const response = Object.assign({}, event.data, {slug})

  return {
    data: response
  }
}
