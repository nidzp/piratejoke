// Use global fetch when available, otherwise lazily import node-fetch.
const fetchFn = global.fetch
  ? global.fetch.bind(global)
  : (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
  fetchFn,
};
