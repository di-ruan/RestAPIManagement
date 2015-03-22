//var sqs_driver = require("./sqs_driver");
var winston = require('winston');
var winston_sqs = require('./winston-sqs');

var express = require("express");
var http = require("http");
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

app.post("*", function(request, response){
  response.writeHead(200, { "Content-Type": "application/json" });
  winston.log('info', JSON.stringify(request.body));
  response.end(JSON.stringify(request.body));
});

http.createServer(app).listen(9701);