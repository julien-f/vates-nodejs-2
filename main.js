#!/usr/bin/nodejs

var http = require('https'); // Variable de type HTTP.
var xmlrpc = require('xmlrpc');

///////////////////////////////////////

function xapi_call(host, method, params, callback)
{
	var options = {
		hostname: host,
		port: '443',
		rejectUnauthorized : false,
	};

	xmlrpc.createSecureClient(options).methodCall(method, params, function (error, value) {
		if (error)
		{
			console.error(error);
			process.exit(1);
		}

		if ('Success' !== value.Status)
		{
			console.error(value);
			process.exit(1);
		}

		callback(value.Value);
	});
}

///////////////////////////////////////

function Xapi(host, session)
{
	this.host = host;
	this.session = session;
}

Xapi.prototype.call_ = function(method, callback)
{
	var params = [];

	var n = arguments.length;
	if (n > 2)
	{
		params = Array.prototype.slice.call(arguments, 1, n - 1);
		callback = arguments[n - 1];
	}

	params.unshift(this.session);

	xapi_call(this.host, method, params, function(value) {
		callback(value);
	});
}

// Static method = class method.
Xapi.open = function(host, username, password, callback) {
	xapi_call(host, 'session.login_with_password', [username, password], function(value) {
		callback(new Xapi(host, value));
	});
};

///////////////////////////////////////

//
Xapi.open('andromeda.vates.fr', 'root', 'dev2013stage', function(xapi) {

	var wait_and_log_event = function() {
		//
		xapi.call_('event.next', function(event) {
			console.log(event);

			wait_and_log_event();
		});
	}

	//
	xapi.call_('event.register', ['*'], wait_and_log_event);
});
