var server = require('http').createServer(handleRequest)
    ,io = require('socket.io').listen(server)
    ,url = require("url")
    ,path = require("path") 
    ,fs = require("fs")
    ,_ = require('underscore')
    ,Message = require("./pub/Message")
    ;

var rawExts = [".htm", ".js", ".css", ".html"],
    rawsDirName = "pub",
    defaultFilename = "chat.html"
    socketsAry = [];

function handleRequest(request, response) {
    var pathname = url.parse(request.url).pathname,
        dirname = path.dirname(pathname),
        basename = path.basename(pathname),
        extname = path.extname(pathname);
    
    console.log("requested: '"+pathname+"'");
    
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

server.listen(process.env.PORT, process.env.IP);

io.sockets.on('connection', function (socket) {
    socketsAry.push(socket);

    socket.on('disconnect', function () {
        var index = socketsAry.indexOf(socket);
        if (index != -1)
	    socketsAry.splice(index, 1);
    });

    socket.on('chatMsg', function (data) {
        for(var i = 0; i < socketsAry.length; i++)
	    socketsAry[i].emit('chatMsg', Message("someone",data));
    });
});

console.log("listening on " + process.env.IP + ":" + process.env.PORT);
