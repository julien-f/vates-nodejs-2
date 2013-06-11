#!/usr/bin/nodejs

var http = require('https'); // Variable de type HTTP.
var xmlrpc = require('xmlrpc');
var _ = require('underscore')

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
			//console.error(error);
			process.exit(1);
		}

		if ('Success' !== value.Status)
		{
			//console.error(value);
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

var hosts = {};

//
Xapi.open('andromeda.vates.fr', 'root', 'dev2013stage', function (xapi) {

		xapi.call_('host.get_all_records', function (hosts) {
			_.each(hosts, function (host, key) {
				if (hosts[key])
				{
					_.each(hosts[key], function (value, name){
						if (host[name] !== value)
						{
							console.log('changement : ' + value + ' en : ' + hosts[name]);
							hosts[key] = host[name];
						}
					});
				}
				else
				{
					hosts[key] = host;
				}
			});
		});

});