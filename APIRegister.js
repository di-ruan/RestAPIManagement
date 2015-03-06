var express = require("express");
var http = require("http");
var mongoose = require('mongoose');

var app = express();

mongoose.connect('mongodb://localhost/userinfo');

var schema = new mongoose.Schema({
	username: String,
	password: String,
	key: String
});

var model = mongoose.model('user', schema);

app.get('/getkey', function(req, res) {
	var username = req.query.username;
	var password = req.query.password;
	if(username == undefined || password == undefined) {
		res.send('need username and password');	
	} else {
		var key;
		var found = false;
		model.find({username: username, password: password}, function(data) {
			key = data.key;	
			found = true;
		});
		if(!found) {
			key = username + '_' + password;
			var record = new model({username: username, password: password, key: record	});
			console.log(record);
			record.save();
		}
		res.send(key);
	}
});

app.listen(4242);