
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/locations';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
db = databaseConnection;
});

app.post('/sendLocation', function(request, response) {
  if(request.body.login && request.body.lat && request.body.lng) {
    var login = request.body.login;
    var lat = parseFloat(request.body.lat);
    var lng = parseFloat(request.body.lng);
    var created_at = new Date();
    
    var toInsert = {
      "login": login,
      "lat": lat,
      "lng": lng,
      "created_at": created_at
    };
  }
  else {
    response.send({"error":"Whoops, something is wrong with your data!"});
  }

  db.collection('locations', function(error1, coll) {
    var id = coll.update({"login": login}, toInsert, {upsert : true}, function(error2, saved) {
      if(error1 || error2) {
	response.send(500);
      }
      else {
	db.collection('locations').find().toArray(function(err, results) {
	  if(!err) {
	    response.send(results);
	  }
	  else {
	    response.send(500);
	  }
	});
      }
    });
  });
});

app.get('/location.json', function(request, response) {
  db.collection('locations', function(er1, collection) {
    if(!er1) {
      if(request.query.login == undefined) {
	response.send({});
      }
      var results;
      collection.find({"login":request.query.login}).toArray(function(er2, results) {
	if(!er2) {
	  response.send(JSON.stringify(results));
	  return;
	}
	else {
	  response.send(500);
	}
      });
    }
    else {
      response.send(500);
    }
  });
});

app.get('/', function(request, response) {
  response.set('Content-Type', 'text/html');
  var indexPage = '';
  
  db.collection('locations', function(er, collection) {
    if(!er) {
      collection.find().sort({created_at: -1}).toArray(function(err, cursor) {
	if (!err) {
	  var style = "p {position: relative; width: 1000px; height: 30px; line-height: 30px; background-color: #9BD2D2;border: 2px solid #9FDAC7; -webkit-border-radius: 30px; -moz-border-radius: 30px; border-radius: 30px; }"; indexPage += "<!DOCTYPE HTML><html><head><title>Locations</title><style>"+style+"</style></head><body><h1>Locations:</h1>";
	  for (var count = 0; count < cursor.length; count++) {
	    indexPage += "<p>" + cursor[count].login + " checked in at " + cursor[count].lat + ", " + cursor[count].lng + " on " + 
			cursor[count].created_at + "</p>";
	  }
	  indexPage += "</body></html>";
	  response.send(indexPage);
	} else {
	  response.send('<!DOCTYPE HTML><html><head><title>Locations</title></head><body><h1>Whoops, something went terribly wrong!</h1></body></html>');
	}
      });
    }
    else {
      response.send(500);
    }
  });
});

app.listen(process.env.PORT || 3000);
