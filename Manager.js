var express = require("express"),
	http = require("http"),
	bodyParser = require('body-parser'),
	mongo = require('mongodb'),
	monk = require('monk'),
	request = require('request'),
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

			var calls = build_call_functions(map, middlewareObj, res);			
			//before_middleware(map.beforeMiddleware, middlewareObj);
    	}
	);
});

function build_call_functions(map, middlewareObj, res){
	var before_functions = [],
		after_functions = [],		
		currentIndex = 0;

	map.beforeMiddleware.forEach(function(middleware){
		before_functions.push(function(middlewareObject){
			request({
				method: 'POST',
				uri: middleware.url,
				json: middlewareObject
			}, http_before_callback
			);

			console.log(middleware);
		});

	});

	map.afterMiddleware.forEach(function(middleware){
		after_functions.push(function(middlewareObject){
			request({
				method: 'POST',
				uri: middleware.url,
				json: middlewareObject
			}, http_after_callback
			);

			console.log(middleware);
		});
	});

	function http_before_callback(error, response, body){
		if(error){
			console.log(error);
			return;
		}

		currentIndex++;		
		console.log("before ", response.statusCode, currentIndex);

		if(response.statusCode == 200){
			if(before_functions[currentIndex]){
				before_functions[currentIndex](body);
			}else{
				currentIndex = 0;
				call_private(map, res, body);
			}
		}else{
			if(after_functions.length){
				after_functions[0](body);
			}else{
				console.log("Done. Before");
			}
		}
	}

	function call_private(map, res, body){
		console.log("private");
		if(after_functions.length){
			after_functions[0](body);
		}else{
			res.end("Done. Call private");
		}
	}

	function http_after_callback(error, response, body){
		if(error){
			console.log(error);
			return;
		}

		currentIndex++;		
		console.log("After", response.statusCode, currentIndex);

		if(response.statusCode == 200){
			if(after_functions[currentIndex]){
				after_functions[currentIndex](body);
			}else{				
				res.end("Done. After");
			}
		}else{
			res.end("No 200. Don't know!");
		}
	}	


	if(before_functions.length){
		before_functions[0](middlewareObj);
	}else{
		call_private(middlewareObj);
	}
}


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