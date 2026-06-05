import slugify from 'slugify';

function makeSlug(value) {
  return slugify(value, {
    lower: true,
    strict: true,
    trim: true
  });
}

export { makeSlug };
