var express = require("express"),
	http = require("http"),
	bodyParser = require('body-parser'),
	mongo = require('mongodb'),
	monk = require('monk'),
	db = monk('localhost:27017/apimapping'),
	app = express(),
	helpers = require('./Helpers');


app.use(bodyParser.json());


app.put('/mapping', function (req, res, next) {  	
  	var body = req.body,
  		success = true,
  		messages = [],
  		code = 200;

  	if(!body.publicUrl){
  		code = 400;
  		success = false;
  		messages.push('"publicUrl" attribute is required');
  	}


  	if(success){
  		var noProtUrl = strip_protocol(body.publicUrl),
  			noSuffixUrl = strip_suffix(noProtUrl);

  		var collection = db.get('mapCollection');
	    collection.find({
	    	publicUrl: noProtUrl
	    },{},function(e, docs){	    	
	    	var doc = {};

	    	if(docs.length){
	    		doc = docs[0];
	    	}

	    	for(index in body){
	    		doc[index] = body[index];
	    	}

	    	doc.publicUrl = noProtUrl;

	    	if(!doc.privateUrl){
	    		messages.push('"privateUrl" attribute is required for creation');
	    		code = 400;
	    		success = false;
	    	}

	    	if(typeof doc.beforeMiddleware != "object"){
	    		messages.push('"beforeMiddleware" attribute is required');
	    		code = 400;
	    		success = false;
	    	}

	    	if(typeof doc.afterMiddleware != "object"){
	    		messages.push('"afterMiddleware" attribute is required');
	    		code = 400;
	    		success = false;
	    	}

	    	if(success){
	    		collection.update({
	    			publicUrl: doc.publicUrl
	    		},
	    		doc,
	    		{
	    			upsert: true
	    		},
	    		function(err, updated){
	    			if(err){
	    				send_failed(req, res, 500, ["An error occurred"]);	    				
	    			}else{
	    				send_response(res);
	    			}
	    		}
	    		);
	    	}else{
	    		send_failed(req, res, code, messages);	    		
	    	}
	    });	    
  	}else{
  		send_failed(req, res, code, messages);
  	}
});

app.delete('/mapping', function (req, res, next) {
	var publicUrl = req.headers.publicurl || req.headers.publicUrl,
		noProtUrl = strip_protocol(publicUrl);

	var collection = db.get('mapCollection');

    collection.find({
    	publicUrl: noProtUrl
    	},{},function(e, docs){
    		var success = true,
    			code = 200,
    			messages = [];

    		if(!docs.length){
    			success = false;
    			code = 404;
    			messages.push("Resource does not exist");
    		}

    		if(success){
    			collection.remove({
    				publicUrl: noProtUrl
    			}, {},
    			function(err, numberOfRemovedDocs){
    				if(numberOfRemovedDocs){
    					send_response(res, 200)
    				}else{
    					messages.push("Resource does not exist");
    					send_failed(req, res, 404, messages);
    				}
    			});
    		}else{
    			send_failed(req, res, 404, messages);
    		}
	});
});


app.get('/mapping', function (req, res, next) {
	var publicUrl = req.headers.publicurl || req.headers.publicUrl,		
		query = {};

	if(publicUrl){
		query.publicUrl = strip_protocol(publicUrl);
	}

	var collection = db.get('mapCollection');

	collection.find(query,{},function(e, docs){
		var code = 200,
			success = true;
    		if(publicUrl && !docs.length){
    			send_failed(req, res, 404, ["Not found"]);
    			return;
    		}

    		docs.forEach(function(doc){
    			delete doc._id;
    		});

    		send_response(res, 200, {
    			success: true,
    			results: docs
    		});
    	}
    );
});

function strip_protocol(url){
	return helpers.strip_protocol(url);
}

function strip_suffix(url){
	return helpers.strip_suffix(url);
}

function send_failed(req, res, code, messages){
	helpers.send_failed(req, res, code, messages);
}

function send_response(res, code, responseObj){
	helpers.send_response(res, code, responseObj);
}


http.createServer(app).listen(9090);
