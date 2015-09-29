/* Includes */
var connect = require('connect');
var serveStatic = require('serve-static');
var PouchDB = require('pouchdb');

// Connection
connect().use(serveStatic(__dirname)).listen(8081);