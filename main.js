#!/usr/bin/nodejs


var http = require('https'); //Variable de type HTTP
var xmlrpc = require('xmlrpc');

///////////////////////////////////////

function xmlrpc_call(method, params, callback)
{
	var option = {
		hostname: 'andromeda.vates.fr',
		port: '443',
		rejectUnauthorized : false,
	};

	var req = xmlrpc.createSecureClient(option).methodCall(method, params, function(error, value) {
		callback(error, value);
	});
}

///////////////////////////////////////

function connect(login, pass)
{
	xmlrpc_call('session.login_with_password', [login, pass], function(error, value){
		if (!error)
		{
			listen(value.Value);
		}
		else
		{
			console.log('Can\'t connect to XenServer', error);
		}
	 });
}

function listen(value)
{
	xmlrpc_call('event.register', [value, ['*']], function() {
		xmlrpc_call('event.next', [value], function(error, resp){
			console.log(resp);
		});
	});
}

///////////////////////////////////////

var args = process.argv.slice(2);

if (!args.length)
{
	console.error('missing argument(s)');
	return;
}

// --connect <login> <password>
for (var i = 0, n = args.length; i < n; ++i)
{
	if (args[i] === '--connect') // If the argument is --add-host
	{
		console.log('command: ' +args[i]);
		connect(args[++i],args[++i]);
	}
	else // If one of all arguments doesn't exist.
	{
		console.log('Unknown command in argurment: ' + args[i]);
	}
}