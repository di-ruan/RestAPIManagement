module.exports = {
	strip_protocol: function(url){
		return url.replace(/^https?:\/\//, "");  			
	},
	strip_suffix: function(url){
		return url.replace(/(\/.*)+/, "");
	},
	send_failed: function(req, res, code, messages){
		var responseObj = {
  			success: false,
  			messages: messages
  		};

		this.send_response(res, code, responseObj);
	},
 	send_response: function(res, code, responseObj){
		responseObj = responseObj || {success: true};
		code = code || 200;

		res.writeHead(code, { "Content-Type": "Application/json" });
		res.end(JSON.stringify(responseObj));
	}
}

