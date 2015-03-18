var redis = require("redis");
var client = redis.createClient();
var sha1 = require('crypto-js/sha1');

var express = require("express");
var http = require("http");
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

app.post("*", function(request, response){
  response.writeHead(200, { "Content-Type": "application/json"});
	
	//TODO If status code is inormal, cut the shit and return 
  if (request.body.request.method == "GET")
	{
		var url = request.body.publicUrl;
		var tag = request.body.request.headers['If-None-Match'];
	
		if (tag == "" || tag == undefined || tag == null){
  		get_not_match(request, response);
  		return;
		}
  	
		client.get("etag:" + url, function(err, reply) {
			if (reply != tag)
    		get_not_match(request, response);
    	else
    		get_match(request, response);
		});
	}
  else
	if (request.body.request.method == "PUT" || request.body.request.method == "DELETE")
	{
		var url = request.body.publicUrl;
		var tag = request.body.request.headers['If-Match'];
		
		if (tag == "" || tag == undefined || tag == null){
  		put_not_match(request, response);
  		return;
		}

		client.get("etag:" + url, function(err, reply) {
			if (reply != tag)
    		put_not_match(request, response);
    	else
    		put_match(request, response);
		});
	}
	else
		//TODO Error happened, what to do
		response.end(JSON.stringify(request.body));
});

http.createServer(app).listen(9704);

function get_match(request, response)
{
	console.log("GET match");
	request.body.response.headers.ETag = request.body.request.headers['If-None-Match'];
	response.end(JSON.stringify(request.body));
}

function get_not_match(request, response)
{
	console.log("GET not match");
	var url = request.body.publicUrl;
	var tag = "" + sha1(url + new Date().toISOString() + randomInt(0, 16384))
	set_etag("etag:" + url, tag);
	expire_etag("etag:" + url);
	request.body.response.headers.ETag = tag;
	response.end(JSON.stringify(request.body));
}

function put_match(request, response)
{
	console.log("PUT match");
	var url = request.body.publicUrl;
	var tag = "" + sha1(url + new Date().toISOString() + randomInt(0, 16384))
	set_etag("etag:" + url, tag);
	expire_etag("etag:" + url);
	request.body.response.ETag = tag;
	response.end(JSON.stringify(request.body));
}

function put_not_match(request, response)
{
	console.log("PUT not match");
	response.end(JSON.stringify(request.body));
}

function delete_etag(url)
{
	client.del(url, redis.print);
}

function set_etag(url, tag)
{
	client.set(url, tag, redis.print);
}

function expire_etag(url)
{
	client.expire(url, 60, redis.print);
}

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

