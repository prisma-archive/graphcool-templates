'use strict';
module.exports = function (event) {
  let name = event.data.name
  const slug = name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")     // Replace all spaces with -
    .replace(/&/g, '-and-')   // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-")   // Replace multiple - with single -

  const response = Object.assign({}, event.data, {slug})

  return {
    data: response
  }
}
