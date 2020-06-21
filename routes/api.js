const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const settings = require('../settings');

// MongoDB
mongoose.connect(settings.mongodbUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function () {
    console.log(`√ Connected to ${settings.mongodbUrl}`)
});
var pasteSchema = mongoose.Schema({
    'poster': String,
    'lang': String,
    'filename': String,
    'code': String,
    'exp': Number,
    'createdTime': { type: Date, default: Date.now },
}, { versionKey: false });
var Paste = mongoose.model('paste', pasteSchema);

/* Routes */
// GET
router.get('/paste', function (req, res, next) {
    var pasteId = req.query['pasteId'];
    Paste.find({ _id: pasteId }, function (err, paste) {
        if (err) {
            res.send({ status: 500 });
            return console.error(err);
        };
        if (paste.length == 0) {
            res.send({ status: 404 });
            return console.error('404 Not Found');
        };
        var responseBody = { status: 200, datas: paste[0] };
        console.log(responseBody);
        res.send(responseBody);
    });
});

// POST
router.post('/paste', (req, res, next) => {
    var payload = req.body;
    var expMapping = { '1 hour': 1, '3 hours': 3, '24 hours': 24};
    if (!payload['exp'] in expMapping) {
        res.send({ status: 500, msg: 'Invalided Expiration' });
    } else {
        var paste = new Paste({
            poster: payload['poster'],
            lang: payload['lang'],
            filename: payload['filename'] ? payload['filename'] : '',
            code: payload['code'],
            exp: Number(expMapping[payload['exp']]),
        });
        paste.save(function (err, result) {
            if (err) {
                res.send({ status: 500 });
                return console.error(err);
            };
            console.log(result);
            res.send({ status: 200, datas: result });
        });
    };
});

module.exports = router;
