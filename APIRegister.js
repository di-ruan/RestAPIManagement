var express = require("express");
var http = require("http");
var mongoose = require('mongoose');
var sha1 = require('sha1');

var app = express();

mongoose.connect('mongodb://localhost/userinfo');

var schema = new mongoose.Schema({
	username: String,
	hash_password: String,
	key: String,
	group: Number
});

var model = mongoose.model('user', schema);

app.get('/getkey', function(req, res) {
    var username = req.query.username;
    var password = req.query.password;
    
    if(username == undefined || password == undefined) {
		res.send('need username and password');	
	} else {
		var hash_password = sha1(password);
		console.log(hashed_password);
		var found = false;
		var key = '';
		model.find({username: username, hash_password: hash_password}, function(data) {
			key = data.key;	
			found = true;
		});
		if(found) {
			res.send({key: key});
		} else {			
			res.send("wrong username or password");
		}
	}
});


app.post('/register', function(req, res) {
	var username = req.query.username;
	var password = req.query.password;
	if(username == undefined || password == undefined) {
		res.send('need username and password');	
	} else {
		var hash_password = sha1(password);
		var found = false;
		model.find({username: username}, function(data) {
			found = true;
		});
		if(found) {
			res.send("user already registered");
		} else {		
			var group = username.length%2;
			var key = username + '_' + hash_password + group;
			var record = new model({username: username, hash_password: hash_password, key: key});
			console.log(record);
			record.save();
		}
	}
});

app.listen(4242);
