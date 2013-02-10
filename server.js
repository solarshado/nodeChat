var server = require('http').createServer(handleRequest)
    ,io = require('socket.io').listen(server)
    ,url = require("url")
    ,path = require("path") 
    ,fs = require("fs")
    ,_ = require('underscore')
    ;

var rawExts = [".htm", ".js", ".css", ".html"],
    defaultFilename = "chat.html";

function handleRequest(request, response) {
    var pathname = url.parse(request.url).pathname,
        dirname = path.dirname(pathname),
        basename = path.basename(pathname),
        extname = path.extname(pathname);
    
    console.log("requested: '"+pathname+"'");
    
    if(!pathname ||
        (dirname === "/" &&
            ( basename === "" || _.contains(rawExts, extname)))) {
           serveStaticFile(response, basename);
    }
}

function serveStaticFile(response, fileName) {
    var fileToRead = "./pub/" + (fileName || defaultFilename);
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

server.listen(process.env.PORT);

console.log("listening on " + process.env.IP + ":" + process.env.PORT);
