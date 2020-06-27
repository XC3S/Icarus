var express = require('express')
var app = express()
var sharp = require('sharp');
var fs = require('fs');

var http = require('http');
var https = require('https');
var crypto = require('crypto')

// respond with "hello world" when a GET request is made to the homepage
app.get('/:x/:y/:url', function (req, res, next) {
    var optimization = {
        x: parseInt(req.params.x),
        y: parseInt(req.params.y),
        url: decodeURI(req.params.url)
    }

    var icarus = new Icarus(optimization,req, res, next);
})

class Icarus {
    constructor(optimization,req, res, next){
        this.optimization = optimization;
        this.req = req;
        this.res = res;
        this.next = next;

        this.filename = crypto.createHash('sha256').update(JSON.stringify(optimization)).digest('hex');
        this.fullfilename = this.filename + '.jpeg';
        this.tempfilename = this.filename + '.jpg'; // @TODO: dynamic file ending

        this.options = {
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        }

        this.process()
    }

    process(){
        if(!fs.existsSync(__dirname + '/images/' + this.fullfilename)){
            this.download(this.optimization.url,  __dirname + '/tmp/' +  this.tempfilename,() => {
                this.optimize(() => {
                    var filepath = __dirname + "/images/" + this.fullfilename;
                    this.res.sendFile(filepath, this.options, function (err) {
                        if (err) {
                            this.next(err)
                        } else {
                            console.log('Sent:', filepath)
                        }
                    })
                })
            })
        }
        else {
            this.sendCached()
        }
    }

    optimize(callback){
        sharp( __dirname + '/tmp/' + this.tempfilename)
        .resize(this.optimization.x,this.optimization.y)
        .removeAlpha()
        .jpeg({ 
            quality: 75,
            progressive: true
        })
        .toFile(__dirname + '/images/' + this.fullfilename, (err, info) => {
            console.log('optimized file') 
            if(err){
                console.error('[ERROR]', err);
            }
            else {
                fs.unlink(__dirname + '/tmp/' + this.tempfilename,() => {})
                callback()
            }
        });
    }

    sendCached(){
        var filepath = __dirname + "/images/" + this.fullfilename;
        this.res.sendFile(filepath, this.options, function (err) {
            if (err) {
                this.next(err)
            } else {
                console.log('Cache Hit :', filepath);
            }
        })
    }

    download(url, dest, callback){
        var file = fs.createWriteStream(dest);
        var protokoll = url.startsWith('https://') ? https : http;
    
        protokoll.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close(callback);
            });
        });
    }
}


app.use(express.static('images'))

app.listen(1337, () => console.log(`Example app listening at http://localhost:${1337}`))