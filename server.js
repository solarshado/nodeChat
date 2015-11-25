var server = require('http').createServer(handleRequest)
	,io = require('socket.io')(server)
	,url = require("url")
	,path = require("path") 
	,fs = require("fs")
	,_ = require('underscore')
	,Message = require("./pub/Message")
	;

var rawExts = [".html", ".js", ".css", ".htm", ".json", ".ico"],
	rawsDirName = "pub",
	defaultFilename = "chat.html",
	userList = [];

function handleRequest(request, response) {
	var pathname = url.parse(request.url).pathname,
		dirname = path.dirname(pathname),
		basename = path.basename(pathname),
		extname = path.extname(pathname);

	console.log("request from "+request.connection.remoteAddress+" for '"+pathname+"'");

	if(!pathname ||
		((dirname === "/" || dirname === "/themes" ) &&
			(basename === "" || _.contains(rawExts, extname)))) {
		   serveStaticFile(response, dirname, basename);
	}
	else {
		response.writeHead(400);
		response.end();
	}
}

function serveStaticFile(response, dirName, fileName) {
	var fileToRead = path.resolve(__dirname, path.join(rawsDirName, dirName, (fileName || defaultFilename)));

//	console.log("trying to serve: "+fileToRead);

	fs.readFile(fileToRead, function(error, content) {
		if (error) {
			response.writeHead(500);
			response.end();
		}
		else {
			response.writeHead(200, {'Content-Type': getContentType(fileToRead)});
			response.end(content, 'utf-8');
		}
	});
}

function getContentType(filename) {
	if(/\.html?$/.test(filename))
		return "text/html";
	else if(/\.js$/.test(filename))
		return "text/javascript";
	else if(/\.css$/.test(filename))
		return "text/css";
	else if(/\.json$/.test(filename))
		return "application/json";
	else if(/\.ico$/.test(filename))
		return "image/x-icon";
	else
		return "text/plain";
}

function addUser(name) {
	var idx = userList.indexOf(name);
	if(idx !== -1) return;
	userList.push(name);
}

function removeUser(name) {
	var idx = userList.indexOf(name);
	if(idx === -1) return;
	userList.splice(idx,1);
}

server.listen(process.env.PORT, process.env.IP);

io.on('connection', function (socket) {
	socket.on('disconnect', function () {
		var time = new Date(),
			name = socket.name;
		if(name === undefined) return;
		removeUser(name);
		socket.broadcast.emit('leave', Message.left(name, time).toJSON());
	});

	socket.on('join', function (name) {
		var time = new Date();
		if(userList.indexOf(name) === -1) {
			socket.name = name;
			addUser(name);
			io.emit('join', Message.joined(name,time).toJSON());
			socket.emit('userList', Message.userList(userList));
		}
		else { // username already exists
			socket.emit('rejectUsername', "Username already in use.");
		}
	});

	socket.on('chatMsg', function (text) {
		if(!text || !String(text).trim()) return; // no message? no-op
		var time = new Date(),
			name = socket.name,
			msg = Message.said(name, text, time).toJSON();
		if(name === undefined) return; // ignore messages from connections with no username
		socket.emit('chatMsg', msg);
		socket.broadcast.emit('chatMsg', msg);
	});
});

console.log("listening on " + process.env.IP + ":" + process.env.PORT);
