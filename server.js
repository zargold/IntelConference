
  //Set Express as my Http App Server
  var express = require("express");
  var app = express();
  var port = (process.env.PORT || 3000);
  //set the app to render from /Public
  
  app.use(express.static(__dirname + '/Public'))
  .listen(port, function(){
        console.log("listening on Port: "+port);
      });



  //Respond to Get request to the '/' route
  app.get("/", function(req, res){
    res.render("index.html");

  })
