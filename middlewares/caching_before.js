var express = require("express");
var http = require("http");
var bodyParser = require('body-parser');
var redis = require('redis');
var app = express();

app.use(bodyParser.json());

client = redis.createClient();
client.on("error", function(err) {
    console.log("Error " + err);
});

app.post("*", function(request, response) {
    var url = request.body.privateUrl;
    var method = request.body.request.method;
    if (method == 'GET') {
        client.get(url, function(err, replies) {
            if (!replies) {                
                response.writeHead(200, { "Content-Type": "application/json"});
                // Don't quite understand why modify the code to be 201
                // Also not sure if this is the right status code to be changed                
                console.log(method + ': key not found!');
            } else {
                // The same goes here. Is this the data to be modified?
                response.writeHead(200, { "Content-Type": "application/json"});
                request.body.response.statusCode = 200;
                
                request.body.skip = true;

                request.body.response.result.data = JSON.parse(replies);
                console.log(method + ': key found!');
            }
            response.end(JSON.stringify(request.body));
        });
    } else if (method == 'PUT' || method == 'DELETE') {
        client.del(url, function(err, replies) {
            // The same goes here
            response.writeHead(200, { "Content-Type": "application/json"});
            response.end(JSON.stringify(request.body));
            console.log(method + ': ' + replies + ' entry deleted!');
        });
    } else {
        response.writeHead(200, { "Content-Type": "application/json"});
        response.end(JSON.stringify(request.body));
    }
});

http.createServer(app).listen(9709);