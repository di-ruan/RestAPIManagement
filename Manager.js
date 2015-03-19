var express = require("express"),
	http = require("http"),
	bodyParser = require('body-parser'),
	mongo = require('mongodb'),
	monk = require('monk'),
	db = monk('localhost:27017/apimapping'),
	helpers = require('./Helpers'),
	app = express();


app.use(bodyParser.json());

app.all("*", function(req, res, next){	
	var wholeUrl = req.get('host') + req.originalUrl;
	var collection = db.get('mapCollection');

    collection.find({
	    publicUrl: {
				$regex: new RegExp("^" + req.get('host') + ".*", "i")
	    	}
	    }, 
	    {

    	},
    	function(e, docs){
    		var longestPrefix = 0,
    			map = null;

			docs.forEach(function(doc){
				var publicUrl = doc.publicUrl;

				if(publicUrl.length > longestPrefix){
					if(wholeUrl.indexOf(publicUrl) == 0){
						longestPrefix = publicUrl.length;
						map = doc;
					}
				}
			});

			if(!map){
				helpers.send_failed(req, res, 404, ["Url not found"]);
				return;
			}

			var middlewareObj = {
				requestHeaders: req.headers,
				responseHeaders: {
					statusCode: 201
				},
				publicUrl: map.publicUrl,
				privateUrl: map.privateUrl
			};

			var result = before_middleware(map.beforeMiddleware, middlewareObj);
    	}
	);
});

function before_middleware(beforeMiddleware, midObj){
	return call_middleware(beforeMiddleware, midObj);
}

function after_middleware(afterMiddleware, midObj){
	return call_middleware(afterMiddleware, midObj);
}

function call_middleware(middleware, midObj){
	middleware.forEach(function(call){
		console.log(call.url);
	});
}


http.createServer(app).listen(9091);