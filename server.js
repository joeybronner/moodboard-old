/* Includes */
var connect = require('connect');
var serveStatic = require('serve-static');
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/moodboard_database';

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);

	var cursor = db.collection('users').find();
	cursor.each(function(err, doc) {
	    if (doc != null) {
	        console.dir(doc);
	    }
	});
  }
});
/* Connection */
connect().use(serveStatic(__dirname)).listen(8081);