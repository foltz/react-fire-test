var express = require('express');
var app = express();

app.use('/', express.static('src'));

module.exports = app;


var server = app.listen(4000, function () {
	var host = server.address().address || 'localhost';
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});