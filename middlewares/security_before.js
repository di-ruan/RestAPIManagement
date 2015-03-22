
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
  response.writeHead(200, { "Content-Type": "application/json"});

  if(request.body.request.method == "GET"){
    var key = request.body.request.headers['Key'];

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
    var collection = db.collection('testData');

    // Check if the key exists
    collection.findOne({'key':'q'},function(err, docs) {
        assert.equal(null, err);
    if(typeof docs !== 'undefined' && docs !== null){
        console.log('kye exists');
        if(docs.group == '1' || docs.group =='2'){
          key_match(request,response);
        }else{
          key_not_match(request,respnse);
        }
    }else{
        console.log('key doesn\'t exist');
    }
   });
  };


  }else 
  if (request.body.request.method == "PUT" || request.body.request.method == "DELETE" || request.body.request.method == "INSERT")
  {
    var key = request.body.request.headers['Key'];
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
<<<<<<< HEAD
    var collection = db.collection('testData');

=======
    var collection = db.collection('userinfo');
>>>>>>> a30bbf32577c23e43c94800cfffe2534d2724d14
    // Check if the key exists
    collection.findOne({'key':'q'},function(err, docs) {
        assert.equal(null, err);
    if(typeof docs !== 'undefined' && docs !== null){
        console.log('kye exists');
        if(docs.group === '1'){
          group_match(request,respnse);
        }else if(docs.group ==='2'){
          group_not_match(request,respnse);
        }else{
          key_not_match(request,respnse);
        }
    }else{
        console.log('key doesn\'t exist');
    }
   });
  };
  }
  else
    //TODO Error happened, what to do
    response.end(JSON.stringify(request.body));
});

http.createServer(app).listen(9707);


function key_match(request, response)
{
  console.log("Key match");
  request.body.response['status code'] = 201;
  response.end(JSON.stringify(request.body));
}

function key_not_match(request, response)
{
  console.log("Key not match");
  request.body.response['status code'] = 401;
  response.end(JSON.stringify(request.body));
}

function group_match(request, response)
{
  console.log("Group match");
  request.body.response['status code'] = 201;
  response.end(JSON.stringify(request.body));
}

function group_not_match(request, response)
{
  console.log("Group not match");
  request.body.response['status code'] = 405;
  response.end(JSON.stringify(request.body));
}


