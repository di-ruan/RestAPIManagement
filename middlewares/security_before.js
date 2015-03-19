var express = require("express");
var http = require("http");
var bodyParser = require('body-parser');
var app = express();
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL 
var url = 'mongodb://localhost:27017/mydb';


app.use(bodyParser.json());


app.post("*", function(request, response){
  response.writeHead(200, { "Content-Type": "application/json"});
  if(request.body.request.method == "GET"){
    var key = request.body.request.headers['Key'];

   if (key == "" || key == undefined || key == null){
      key_not_match(request, response);
      return;
    }

    var result = checkKey(key);
    if(result == 1 || result == 0)
      key_match(request,respnse);
    else
      key_not_match(request,respnse);

  }else 
  if (request.body.request.method == "PUT" || request.body.request.method == "DELETE" || request.body.request.method == "INSERT")
  {
    var key = request.body.request.headers['Key'];
    if (key == "" || key == undefined || key == null){
      key_not_match(request, response);
      return;
    }
    var result = checkKey(key);
    if(result == 1)
      group_match(request,respnse);
    else if (result == 0)
      group_not_match(request,respnse);
    else
      key_not_match(request,respnse);

  }
  else
    //TODO Error happened, what to do
    response.end(JSON.stringify(request.body));
} 

http.createServer(app).listen(9707);

function checkKey(key){
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
          return 1;
        }else if(docs.group ==='2'){
          return 0;
        }
        callback(docs);
      }else
        return -1;
      }
    });  
  }
}

function key_match(request, response)
{
  console.log("GET match");
  request.body.response['status code'] = 201;
  response.end(JSON.stringify(request.body));
}

function key_not_match(request, response)
{
  console.log("GET not match");
  request.body.response['status code'] = 401;
  response.end(JSON.stringify(request.body));
}

function group_match(request, response)
{
  console.log("PUT match");
  request.body.response['status code'] = 201;
  response.end(JSON.stringify(request.body));
}

function group_not_match(request, response)
{
  console.log("PUT not match");
  request.body.response['status code'] = 405;
  response.end(JSON.stringify(request.body));
}


