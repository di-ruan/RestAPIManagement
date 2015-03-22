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
    response.writeHead(200, { "Content-Type": "application/json"});
    var timeout = 259200;       // timeout in seconds
    var url = request.body.privateUrl;
    var method = request.body.request.method;
    if (method == 'GET' && isValid(url)) {
        var data = JSON.stringify(request.body.response.result.data);
        client.set(url, data, function(err, replies) {
            console.log(method + ': new entry inserted!');
            client.expire(url, timeout, function(err, replies) {
                console.log('Key expires in 3 days!');
            });
        });

        response.end(JSON.stringify(request.body));
    } else {
        response.end(JSON.stringify(request.body));
    }
});

function isValid(url) {
    return /[a-zA-Z0-9]+\/[0-9]+$/.test(url);
}

http.createServer(app).listen(9710);