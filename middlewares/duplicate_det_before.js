var redis = require("redis");
var client = redis.createClient();
var express = require("express");
var http = require("http");
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

app.post("*", function(request, response){
  if (!valid_json(request.body))
  {
    response.writeHead(400, { "Content-Type": "text/plain"});
    response.end("bad json format");
    return;
  }
  response.writeHead(200, { "Content-Type": "application/json"});
  if (("" + request.body.response.statusCode)[0] != "2")
  {
    response.end(JSON.stringify(request.body));
    return;
  }
  if (request.body.request.headers.nonce == null)
  {
    request.body.response.statusCode = 412;
    response.end(JSON.stringify(request.body));
    return;
  }
  if (request.body.request.method == "POST")
  {
    var nonce = request.body.request.headers['nonce'];
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
  var nonce = request.body.request.headers['nonce'];
  request.body.response['statusCode'] = 409;
  expire_nonce("nonce:" + nonce);
  response.end(JSON.stringify(request.body));
}

function nonce_not_match(request, response)
{
  console.log("nonce not match");
  var nonce = request.body.request.headers['nonce'];
  console.log("asd" , nonce);
  set_nonce(nonce);
  expire_nonce("nonce:" + nonce);
  response.end(JSON.stringify(request.body));
}

function set_nonce(nonce)
{
  client.set("nonce:" + nonce, "1", redis.print);
}

function expire_nonce(nonce)
{
  client.expire(nonce, 60, redis.print);
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