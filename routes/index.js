var express = require('express');
var router = express.Router();

var mongodb = require('mongodb');

var mLab = process.env.HOST;
var MongoClient = require('mongodb').MongoClient;
require('dotenv').config({ silent: true });
var shortid = require('shortid');
var validUrl = require('valid-url');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/new/:url(*)', function (req, res, next) {
  MongoClient.connect( 'mongodb://ChristianPerkins408:Blacklist35@ds147920.mlab.com:47920/url-shortener', function (err, db) {
    if (err) {
      console.log("Unable to connect to server", err);
    } else {
      console.log("Connected to server")

      var collection = db.collection('links');
      var params = req.params.url;
      console.log(req.params);

      var local = req.get('host') + "/";

      var newLink = function (db, callback) {
        collection.findOne({ "url": params }, { short: 1, _id: 0 }, function (err, doc) {
          if (doc != null) {
            res.json({ original_url: params, short_url: local + doc.short });
          } else {
            if (validUrl.isUri(params)) {
              // if URL is valid, do this
              var shortCode = shortid.generate();
              var newUrl = { url: params, short: shortCode };
              collection.insert([newUrl]);
              res.json({ original_url: params, short_url: local + shortCode });
            } else {
            // if URL is invalid, do this
              res.json({ error: "Wrong url format, make sure you have a valid protocol and real site." });
            };
          };
        });
      };

      newLink(db, function () {
        db.close();
      });

    };
  });

});

router.get('/:short', function (req, res, next) {

  MongoClient.connect('mongodb://ChristianPerkins408:Blacklist35@ds147920.mlab.com:47920/url-shortener', function (err, db) {
    if (err) {
      console.log("Unable to connect to server", err);
    } else {
      console.log("Connected to server")

      var collection = db.collection('links');
      var params = req.params.short;

      var findLink = function (db, callback) {
        collection.findOne({ "short": params }, { url: 1, _id: 0 }, function (err, doc) {
          if (doc != null) {
            res.redirect(doc.url);
          } else {
            res.json({ error: "No corresponding shortlink found in the database." });
          };
        });
      };

      findLink(db, function () {
        db.close();
      });

    };
  });
});

module.exports = router;
