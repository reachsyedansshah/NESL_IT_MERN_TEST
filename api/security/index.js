const cors = require('./cors');
const helmet = require('./helmet');
const rateLimiter = require('./rateLimiter');
const xss = require('./xss');

module.exports = {
  cors,
  helmet,
  rateLimiter,
  xss,
};
