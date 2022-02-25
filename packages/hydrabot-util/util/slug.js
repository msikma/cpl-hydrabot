// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const standardSlugify = require('standard-slugify')

const defaultOptions = {
  keepCase: true
}

/** Slugify function that uses underscores as separators. */
const slugifyUnderscore = (str, opts) => {
  const slug = slugify(str, opts)
  return slug.replace(/-/g, '_')
}

/** Standard slugify function that returns URL-safe strings. */
const slugify = (str, opts = {}) => {
  return standardSlugify(str, {...defaultOptions, ...opts})
}

module.exports = {
  slugifyUnderscore,
  slugify
}
