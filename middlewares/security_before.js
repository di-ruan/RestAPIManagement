
var express = require("express");
var http = require("http");
var bodyParser = require('body-parser');
var app = express();

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL 
var url = 'mongodb://localhost:27017/users';

app.use(bodyParser.json());


app.post("*", function(request, response){
  if (!valid_json(request.body))
  {
    response.writeHead(400, { "Content-Type": "text/plain"});
    response.end("bad json format");
    return;
  }
  response.writeHead(200, { "Content-Type": "application/json"});
  
  if (request.body.response.statusCode[0] != 2)
  {
    response.end(JSON.stringify(request.body));
    return;
  }

  if(request.body.request.method == "GET"){
    var key = request.body.request.headers['key'];

   if (key == "" || key == undefined || key == null){
      key_not_match(request, response);
      return;
    }

    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
        console.log("Connected correctly to db server");
        findDocuments(db,function() {
          db.close();
      });
    });

    var findDocuments = function(db,callback) {

    // Get the documents collection 
    var collection = db.collection('userinfo');

    // Check if the key exists
    collection.findOne({'key':key},function(err, docs) {
      if(typeof docs !== 'undefined' && docs !== null){
        assert.equal(null, err);
        console.log('key exists');
        if(docs.group == '1' || docs.group =='2'){
          key_match(request,response);
        }else{
          key_not_match(request,respnse);
        }
      }else{
        console.log('key not exists');
        key_not_match(request,response);
      }

    });
    };
  }else 
  if (request.body.request.method == "PUT" || request.body.request.method == "DELETE" || request.body.request.method == "POST")
  {
    var key = request.body.request.headers['key'];
    if (key == "" || key == undefined || key == null){
      key_not_match(request, response);
      return;
    }

    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
        console.log("Connected correctly to db server");
        findDocuments(db,function() {
          db.close();
      });
    });

    var findDocuments = function(db,callback) {

    // Get the documents collection 
    var collection = db.collection('userinfo');
    
    // Check if the key exists
    collection.findOne({'key':key},function(err, docs) {
    if(typeof docs !== 'undefined' && docs !== null){
        assert.equal(null, err);
        console.log('key exists');
        if(docs.group == '1'){
          group_match(request,response);
        }else if(docs.group == '2'){
          group_not_match(request,response);
        }else{
          key_not_match(request,response);
        }
    }else{
      console.log('key not exists');
      key_not_match(request,response);
    }
   });

  };
  }
  else
    //TODO Error happened, what to do
    response.end(JSON.stringify(request.body));
  
});

http.createServer(app).listen(9717);


function key_match(request, response)
{
  console.log("key match");
  response.end(JSON.stringify(request.body));
}

function key_not_match(request, response)
{
  console.log("key not match");
  request.body.response['statusCode'] = "401";
  request.body.response['skip'] = true;
  response.end(JSON.stringify(request.body));
}

function group_match(request, response)
{
  console.log("Group match");
  response.end(JSON.stringify(request.body));
}

function group_not_match(request, response)
{
  console.log("Group not match");
  request.body.response['statusCode'] = "401";
  request.body.response['skip'] = true;
  response.end(JSON.stringify(request.body));
}

function valid_json(body)
{
  if (body == null || body.request == null || body.response == null || body.publicUrl == null || body.privateUrl == null)
    return false;
  var request = body.request;
  if (request.headers == null || request.method == null)
    return false;
  var response = body.response;
  if (response.headers == null || response.result == null || response.statusCode == null)
    return false;
  return true;
}
