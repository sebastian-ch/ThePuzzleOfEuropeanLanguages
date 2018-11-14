var mapshaper = require("mapshaper"),
    GJV = require('geojson-validation'),
    chalk = require('chalk'),
    fs = require("fs");


var allFiles = [];


//reads project-files folder and gets list of folders
fs.readdir('project-files/', (err, folders) => {

    if (err) throw err;

    viewFolders(folders);
})

function viewFolders(folders) {

    var folderLength = folders.length;
    var folderLengthminus = folderLength - 1;

    for (var x in folders) {
        //set path
        var path = 'project-files/' + folders[x];

        
        //if the path is actually a folder
        if (fs.statSync(path).isDirectory()) {

            //find the shp and convert it to geojson
            mapshaper.runCommands('-i ' + path + '/*.shp -proj wgs84 -simplify dp 60% -o precision=0.00001 geojsons/ format=geojson', (err, data) => {

                if (err) throw err;

                validateGeojson();

            });
        }
    }

}

function validateGeojson() {

    fs.readdir('geojsons/', (err, gjs) => {

        for (var y in gjs) {
            
            fs.readFile('geojsons/' + gjs[y], function (err, data) {

                if (GJV.valid(JSON.parse(data))) {
                     console.log(chalk.green("it's valid"));
                } else {
                     console.log(chalk.red("not valid"));
                }
            });

        }
    })


}

