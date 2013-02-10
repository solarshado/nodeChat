var http = require('http')
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
           showRawFile(response, basename);
    }
}

function showRawFile(response, fileName) {
    var fileToRead = "./pub/" + (fileName || defaultFilename);
    fs.readFile(fileToRead, function(error, content) {
        if (error) {
            response.writeHead(500);
            response.end();
        }
        else {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(content, 'utf-8');
        }
    });
}

http.createServer(handleRequest).listen(process.env.PORT);
console.log("listening on " + process.env.IP + ":" + process.env.PORT);
