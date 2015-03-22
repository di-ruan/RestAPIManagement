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
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(request.body));
});

http.createServer(app).listen(9706);

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
