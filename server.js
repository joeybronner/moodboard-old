/* Includes */
var connect = require('connect');
var serveStatic = require('serve-static');

// Connection
connect().use(serveStatic(__dirname)).listen(8081);