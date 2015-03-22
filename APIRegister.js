var express = require("express"),
	http = require("http"),
	mongo = require('mongodb'),
	monk = require('monk'),
	db = monk('localhost/users'),
	collection = db.get('userinfo'),
	sha1 = require('crypto-js/sha1'),
	app = express();

/*
Schema for collection userinfo
{	'username': String,
	'hash_password': String,
	'key': String,
	'group': Number
}
*/

app.get('/getkey', function(req, res) {
    var username = req.query.username;
    var password = req.query.password;
    
    if(username == undefined || password == undefined) {
    	res.writeHead(400, {"Content-Type": "text/plain"});
		res.write("need username and password");
		res.send();	
	} else {
		var hash_password = sha1(password).toString();		
		collection.find({username: username, hash_password: hash_password}, function(err, data) {			
			if(data != null && data.length > 0) {
				var key = data[0].key;
				res.writeHead(200, {"Content-Type": "application/json"});
				res.write(JSON.stringify({"key" : key}));
				res.send();
			} else {	
				res.writeHead(400, {"Content-Type": "text/plain"});
				res.write("wrong username or password");
				res.send();
			}
		});
		
	}
});


app.post('/register', function(req, res) {
	var username = req.query.username;
	var password = req.query.password;

	if(username == undefined || password == undefined) {
		res.send('need username and password');	
	} else {
		var hash_password = sha1(password).toString();
		collection.find({username: username}, function(err, data) {
			console.log(data);
			if(data.length > 0) {
				res.writeHead(400, {"Content-Type": "text/plain"});
				res.write('username exists')
				res.send();
			} else {		
				var group = username.length%2;
				var key = username + '_' + hash_password + group;
				var record = {username: username, hash_password: hash_password, key: key, group: group};
				collection.insert(record, function(err, doc) {
					if(err) throw err;
					else {
						res.writeHead(202, {"Content-Type": "text/plain"});
						res.write('new record inserted')
						res.send();		
					}
				});			
			}
		});
	}
});

app.listen(9092);
