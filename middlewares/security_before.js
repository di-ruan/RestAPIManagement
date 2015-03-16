var express = require("express");
var app = express();
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');



//security
module.exports = function security_before(request, response, next) {
	// Connection URL 
	var url = 'mongodb://localhost:27017/mydb';
	// Use connect method to connect to the Server 
	MongoClient.connect(url, function(err, db) {
  	assert.equal(null, err);
  	console.log("Connected correctly to server");
 
  	db.close();
	});
  next();
}