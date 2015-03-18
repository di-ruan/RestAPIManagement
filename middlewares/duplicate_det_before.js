var redis = require("redis");
var client = redis.createClient();

var express = require("express");
var http = require("http");
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

app.post("*", function(request, response){
  response.writeHead(200, { "Content-Type": "application/json"});
  
  //TODO If status code is inormal, cut the shit and return 
  if (request.body.request.method == "POST" || request.body.request.method == "DELETE")
  {
    var nonce = request.body.request.headers['Nonce'];
    client.get("nonce:" + nonce, function(err, reply) {
      if (reply == "" || reply == undefined || reply == null)
        nonce_not_match(request, response);
      else
        nonce_match(request, response);
    });
  }
  else
    response.end(JSON.stringify(request.body));
});

http.createServer(app).listen(9705);

function nonce_match(request, response)
{
  console.log("nonce match");
  var nonce = request.body.request.headers['Nonce'];
  request.body.response['status code'] = 409;
  expire_nonce("nonce:" + nonce);
  response.end(JSON.stringify(request.body));
}

function nonce_not_match(request, response)
{
  console.log("nonce not match");
  set_nonce("nonce:", nonce);
  expire_nonce("nonce:" + nonce);
  response.end(JSON.stringify(request.body));
}

function set_nonce(nonce)
{
  client.set(nonce, "1", redis.print);
}

function expire_nonce(nonce)
{
  client.expire(nonce, 60, redis.print);
}