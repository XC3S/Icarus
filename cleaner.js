//requiring path and fs modules
const path = require('path');
const fs = require('fs');
//joining path of directory 
const directoryPath = path.join(__dirname, 'images');


const CacheDuration = 86400000;

fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        console.log(file); 

        var x = path.join(directoryPath,file)

        fs.stat(x, (err, stats) => {
            if (err) {
                return console.log('Unable to get file stat: ' + err);
            } 
            console.log('stats: ',stats);

            var now = Date.now();
            var fileDate = stats.birthtimeMs;

            var ageMs = now - fileDate;

            console.log('age MS: ',ageMs);

            if(ageMs >= CacheDuration) {
                fs.unlink(x,() => {})
            }
            

        });
    });
});