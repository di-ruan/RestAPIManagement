var express = require("express");
var http = require("http");
var mongoose = require('mongoose');

var app = express();

mongoose.connect('mongodb://localhost/ecomm_database');

app.get('/getkey', function(req, res) {
	res.send('registration is done');
});

app.listen(4242);