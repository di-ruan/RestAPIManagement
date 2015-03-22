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
				request: {
					headers: req.headers,
					method: req.method
				},
				response: {
					headers: {},
					result: {},
					statusCode: 200
				},
				skip: false,
				publicUrl: "http://" + wholeUrl,
				privateUrl: "http://" + map.privateUrl + wholeUrl.substring(map.publicUrl.length, wholeUrl.length)			
			};					

			build_call_functions(map, middlewareObj, req, res);
    	}
	);
});

function build_call_functions(map, middlewareObj, req, res){
	var before_functions = [],
		after_functions = [],		
		currentIndex = 0;

	map.beforeMiddleware.forEach(function(middleware){
		before_functions.push(function(middlewareObject){
			console.log('calling "' + middleware.url + '"');
			request({
				method: 'POST',
				uri: middleware.url,
				json: middlewareObject
			}, http_before_callback
			);
		});

	});


	map.afterMiddleware.forEach(function(middleware){
		after_functions.push(function(middlewareObject){
			console.log('calling "' + middleware.url + '"');
			request({
				method: 'POST',
				uri: middleware.url,
				json: middlewareObject
			}, http_after_callback
			);
		});
	});

	function http_before_callback(error, response, body){
		if(error){
			console.log('error-before', error);			
		}

		currentIndex++;		

		if(response.statusCode == 200){
			if(body.skip == false){
				if(before_functions[currentIndex]){
					before_functions[currentIndex](body);
				}else{
					currentIndex = 0;
					call_private(map, res, body);
				}
			}else{
				/* Return to false to be able to execute after middleware */
				body.skip = false;
				if(after_functions.length){
					after_functions[0](body);
				}else{
					res.writeHead(response.statusCode, body.response.headers);
					var data = body.response.result.data || "";

					if(data && typeof data != "string"){
						data = JSON.stringify(data);
					}

					res.end(data);
				}
			}
		}else{
			res.writeHead(500, {});
			res.end("");
		}
	}

	function call_private(map, res, body){		
		delete body.request.headers.host;

		var middlewareObj = body,
			privateUrl = middlewareObj.privateUrl,
			headers = middlewareObj.request.headers,
			method = middlewareObj.request.method,
			reqObj = {
				method: method,
				uri: middlewareObj.privateUrl,
				headers: middlewareObj.request.headers				
			};			

		switch(method.toUpperCase()){
			case 'POST':
			case 'PUT':
				reqObj.json = req.body;
				break;
			case 'GET':
			case 'DELETE':
			default:
				break;
		}

		console.log('calling "' +  middlewareObj.privateUrl + '"');
		request(reqObj, function(error, response, body){
				if(error){
					console.log('error-private', error);
				}

				middlewareObj.response.headers = response.headers;
				middlewareObj.response.statusCode = response.statusCode;
				middlewareObj.response.result = {data: body};

				if(after_functions.length){
					after_functions[0](middlewareObj);
				}else{
					delete response.headers['content-length'];
					res.writeHead(response.statusCode, response.headers);

					if(typeof body != "string"){
						body = JSON.stringify(body);
					}

					res.end(body);
				}				
			}
			);
	}

	function http_after_callback(error, response, body){
		if(error){
			console.log('error-after', error);			
		}

		currentIndex++;		

		if(response.statusCode == 200){
			if(body.skip == false){
				if(after_functions[currentIndex]){
					after_functions[currentIndex](body);
				}else{
					/* Hack */
					delete body.response.headers['content-length'];

					res.writeHead(body.response.statusCode, body.response.headers);

					var data = body.response.result.data || "";

					if(data && typeof data != "string"){
						data = JSON.stringify(data);
					}

					res.end(data);
				}
			}else{
				res.writeHead(500, {});

				if(typeof body != 'string'){
					body = JSON.stringify(body);
				}

				console.log('failure: ' + body);
				res.end("failure");
			}
		}else{
			res.writeHead(500, {});
			res.end("");
		}
	}	


	if(before_functions.length){
		before_functions[0](middlewareObj);
	}else{
		call_private(middlewareObj);
	}
}

http.createServer(app).listen(9091);