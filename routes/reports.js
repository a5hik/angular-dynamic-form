var mongo = require('mongodb');

var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('ng-reports', server);

db.open(function (err, db) {
    if (!err) {
        console.log("Connected to poc database");
        db.collection('reports', {strict: true}, function (err, collection) {
            if (err) {
                console.log("The reports collection does not exist. Creating it with sample data...");
            }
            populateDB();
        });
    }
});

exports.findAll = function (req, res) {
    db.collection('reports', function (err, collection) {
        collection.find().toArray(function (err, items) {
            console.log('reports send from DB');
            res.send(items);
        });
    });
};

exports.findById = function (req, res) {
    var id = req.params.id;
    console.log('Retrieving report: ' + id);
    db.collection('reports', function (err, collection) {
        collection.findOne({'_id': id}, function (err, item) {
            res.send(item);
        });
    });
};

exports.add = function (req, res) {
    var report = req.body;
    console.log('Adding report: ' + JSON.stringify(report));
    db.collection('reports', function (err, collection) {
        collection.insert(report, {safe: true}, function (err, result) {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.update = function (req, res) {
    var id = req.params.id;
    var report = req.body;
    console.log('Updating report: ' + id);
    console.log(JSON.stringify(report));
    delete report._id;
    db.collection('reports', function (err, collection) {
        collection.update({'_id': id}, report, {safe: true}, function (err, result) {
            if (err) {
                console.log('Error updating report: ' + err);
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(report);
            }
        });
    });
};

exports.remove = function (req, res) {
    var id = req.params.id;
    console.log('Removing report: ' + id);
    db.collection('reports', function (err, collection) {
        collection.remove({'_id': id}, {safe: true}, function (err, result) {
            if (err) {
                res.send({'error': 'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) removed');
                res.send(req.body);
            }
        });
    });
};

var populateDB = function () {
    var fs = require('fs');
    var file = './data/reports/reports.json';

    fs.readFile(file, 'utf8', function (err, data) {
        var reports = JSON.parse(data);

        for (var i = 0; i < reports.length; i++) {
            var report = reports[i];
            populateReports(report.id);
        }
    });
};

var populateReports = function (reportID) {
    var fs = require('fs');
    fs.readFile('./data/reports/' + reportID + '.json', 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        var report = JSON.parse(data);
        report._id = reportID;
        db.collection('reports', function (err, collection) {
            if (err) {
                console.log("No errors on connecting reports collection");
                throw err;
            }
            collection.insert(report, {safe: true}, function (err, result) {
                if (err) {
                    console.log("No errors on connecting reports collection2");
                    throw err;
                }
            });
        });
    });
};