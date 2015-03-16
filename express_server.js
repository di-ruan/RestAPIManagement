var express = require("express");
var http = require("http");
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

///////////////////////

//before middlewares
app.use(require("./middlewares/security_before"));

app.use(require("./middlewares/logging_before"));


//request to HM1 API
app.use(function(request, response, next) {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Hello world!\n");
  console.log("hello displayed");
  next();
});

//after middlewares
app.use(require("./middlewares/logging_after"));

app.use(require("./middlewares/security_after"));



http.createServer(app).listen(1337);
