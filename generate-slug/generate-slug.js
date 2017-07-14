'use strict';
module.exports = function (event) {
  let title = event.data.title
  const slug = title
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
