// Root serverless function fallback
const { app } = require('../server/dist/server.js');

module.exports = app;
module.exports.default = app;
module.exports.app = app;
