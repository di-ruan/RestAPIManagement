var express = require("express");
var http = require("http");
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

app.post("*", function(request, response){
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(request.body));
});

http.createServer(app).listen(9708);