var server = require('http').createServer(handleRequest)
    ,io = require('socket.io')(server)
    ,url = require("url")
    ,path = require("path") 
    ,fs = require("fs")
    ,_ = require('underscore')
    ,Message = require("./pub/Message")
    ;

var rawExts = [".htm", ".js", ".css", ".html"],
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
        (dirname === "/" &&
            (basename === "" || _.contains(rawExts, extname)))) {
           serveStaticFile(response, basename);
    }
}

function serveStaticFile(response, fileName) {
    var fileToRead = path.resolve(__dirname, rawsDirName, (fileName || defaultFilename));

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
        removeUser(name);
        socket.broadcast.emit('leave', Message.left(name, time).toJSON());
    });

    socket.on('join', function (name) {
        var time = new Date();
        socket.name = name;
        addUser(name);
        socket.broadcast.emit('join', Message.joined(name,time).toJSON());
        socket.emit('userList', Message.userList(userList));
    });

    socket.on('chatMsg', function (text) {
        if(!text) return; // no message? no-op
        var time = new Date(),
            name = socket.name,
            msg = Message.said(name, text, time).toJSON();
        socket.emit('chatMsg', msg);
        socket.broadcast.emit('chatMsg', msg);
    });
});

console.log("listening on " + process.env.IP + ":" + process.env.PORT);
