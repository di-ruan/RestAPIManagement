var express = require("express");
var http = require("http");
var AWS = require('aws-sdk'),
  awsCredentialsPath = './sqs-config.json',
  sqsQueueUrl = 'https://sqs.us-west-2.amazonaws.com/359642914898/do-rest-logging',
  sqsQueueArn = 'arn:aws:sqs:us-west-2:359642914898:do-rest-logging',
  sqs;
AWS.config.loadFromPath(awsCredentialsPath);
sqs = new AWS.SQS();

var app = express();


// a middleware mounted on /user/:id; will be executed for any type of HTTP request to /user/:id
app.use('/user/:id', function (req, res, next) {
  console.log('Request Type:', req.method);
  next();
});

// a route and its handler function (middleware system) which handles GET requests to /user/:id
app.get('/user/:id', function (req, res, next) {
  res.send('USER');
});

//logging middleware
function loggingMiddleware(request, response, next) {
	var params = {
    MessageBody: "Bang",
    QueueUrl: sqsQueueUrl,
    DelaySeconds: 0
  };
  sqs.sendMessage(params, function(err, result){
    console.log("Message Sent");
  });
  next();
}

//use logging middleware
app.use(loggingMiddleware);

app.use(function(request, response) {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Hello world!\n");
  console.log("hello displayed");
});


http.createServer(app).listen(1337);