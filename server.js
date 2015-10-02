/* Includes */
var connect = require('connect');
var serveStatic = require('serve-static');
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
/*
MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
  if(!err) {
    console.log("We are connected");
  }
});*/

// Connection
connect().use(serveStatic(__dirname)).listen(8081);