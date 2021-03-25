const http = require('http');
const socketClusterServer = require('socketcluster-server');


let options = {
    // ...
  };
  
  let httpServer = http.createServer();
  let agServer = socketClusterServer.attach(httpServer, options);
  
  // port 8000
  httpServer.listen(8000);