import * as url from "node:url";
import * as path from "node:path";
import * as fs from "node:fs";
import { createServer } from "node:http";

import Message from "./pub/Message.js";

import sio from "socket.io";

const server = createServer(handleRequest);
const io = sio(server);

const listenIP = process.env["IP"];
const listenPort = +process.env["PORT"];

const rawExts = [".html", ".js", ".css", ".htm", ".json", ".ico"];
const rawsDirName = "pub";
const defaultFilename = "chat.html";
const userList = [];

function handleRequest(request, response) {
	const pathname = url.parse(request.url).pathname;
	const dirname = path.dirname(pathname);
	const basename = path.basename(pathname);
	const extname = path.extname(pathname);

	console.log("request from "+request.connection.remoteAddress+" for '"+pathname+"'");

	const shouldServeStatic =
		!pathname ||
		((dirname === "/" || dirname === "/themes" ) &&
			(basename === "" || rawExts.includes(extname)))

	if(shouldServeStatic) {
		   serveStaticFile(response, dirname, basename);
	}
	else {
		response.writeHead(400);
		response.end();
	}
}

const appRootDir = path.dirname(url.fileURLToPath(import.meta.url))

function serveStaticFile(response, dirName, fileName) {
	const fileToRead = path.resolve(appRootDir, path.join(rawsDirName, dirName, (fileName || defaultFilename)));

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
	if(userList.includes(name))
		return;
	userList.push(name);
}

function removeUser(name) {
	const idx = userList.indexOf(name);
	if(idx === -1)
		return;
	userList.splice(idx,1);
}

server.listen(listenPort, listenIP);

io.on('connection', function (socket) {
	socket.on('disconnect', function () {
		const { name } = socket;
		if(name === undefined)
			return;

		const time = new Date();
		removeUser(name);
		socket.broadcast.emit('leave', Message.left(name, time).toJSON());
	});

	socket.on('join', function (name) {
		const time = new Date();
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
		if(!text || !String(text).trim())
			return; // no message? no-op

		const { name } = socket;
		if(name === undefined)
			return; // ignore messages from connections with no username

		const time = new Date();
		const msg = Message.said(name, text, time).toJSON();

		socket.emit('chatMsg', msg);
		socket.broadcast.emit('chatMsg', msg);
	});
});

console.log("listening on " + listenIP + ":" + listenPort);
