var express = require('express')
var app = express()
var sharp = require('sharp');
var fs = require('fs');
var request = require('request');

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res, next) {
    //res.send('hello world')
    var options = {
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }

    var item ='Test2.jpg';
    if(!fs.existsSync(__dirname + '/images/' + item.replace(/\.[^.]+$/, '.jpeg'))){
        download('https://pbs.twimg.com/media/EYw8qSLWoAEf7YK?format=jpg&name=small',  __dirname + '/tmp/' + item,() => {
            console.log('downloaded file')
            sharp( __dirname + '/tmp/' + item)
            .resize(100,100)
            .removeAlpha()
            .jpeg({ 
                quality: 75,
                progressive: true
            })
            .toFile(__dirname + '/images/' + item.replace(/\.[^.]+$/, '.jpeg'), (err, info) => {
                console.log('optimized file') 
                if(err){
                    console.error('[ERROR]', err);
                }
                else {
                    var fileName = __dirname + "/images/" + item.replace(/\.[^.]+$/, '.jpeg');
                    res.sendFile(fileName, options, function (err) {
                        if (err) {
                            next(err)
                        } else {
                            console.log('Sent:', fileName)
                            fs.unlink(__dirname + '/tmp/' + item,() => {})
                        }
                    })
                }
            });

        })
    }
    else {
        console.log('cached file');
        var fileName = __dirname + "/images/" + item.replace(/\.[^.]+$/, '.jpeg');
        res.sendFile(fileName, options, function (err) {
            if (err) {
                next(err)
            } else {
                console.log('Sent:', fileName);
            }
        })
    }
})

app.use(express.static('images'))

app.listen(1337, () => console.log(`Example app listening at http://localhost:${1337}`))