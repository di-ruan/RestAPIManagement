var express = require("express");
var http = require("http");
var bodyParser = require('body-parser');
var app = express();

// app.use(bodyParser.json());

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// should get this from previous step:
var obj = JSON.parse('{"key": 5678}');
var key = obj.key.toString();
console.log('Get Key:'+ obj.key);
  
// Connection URL 
var url = 'mongodb://localhost:27017/mydb';

// Use connect method to connect to the Server 
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
    console.log("Connected correctly to db server");
    findDocuments(db, function() {

      db.close();
  });
});

var findDocuments = function(db, callback) {
  // Get the documents collection 
  var collection = db.collection('testData');
  // Check if the key exists
  collection.findOne({'key':key},function(err, docs) {
    if(typeof docs !== 'undefined' && docs !== null){
      assert.equal(null, err);
      assert.equal(key,docs.key);
      if(docs.group === '1'){
        var responseHeaders = {'statusCode': 201};
      }else if(docs.group ==='2'){
        var responseHeaders = {'statusCode': 202};
      }
      console.log(JSON.stringify(responseHeaders));
      callback(docs);
      return JSON.stringify(responseHeaders);
    }else{
      var responseHeaders = {'statusCode': 203};
      console.log(JSON.stringify(responseHeaders));
      return JSON.stringify(responseHeaders);
    }
  });  
}
http.createServer(app).listen(9707);
