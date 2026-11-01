// Vercel Serverless Function Entrypoint
// Bridges Vercel serverless requests into the Express application instance
const { app } = require('../server/dist/server.js');

module.exports = app;

