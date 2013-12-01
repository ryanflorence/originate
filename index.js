require('shelljs/global');
var fs = require('fs');
var color = require('cli-color');
var blue = color.blue;
var loom = require('../loom');

module.exports = function() {

  if (process.argv.length !== 4) {
    log('please provide a project type and destination, ie: "originate ember my-app"');
    process.exit();
  }

  var origin = process.argv[2];
  var dest = process.argv[3];
  var moduleName = 'loom-origin-'+origin;
  var createdNodeModulesDir = false;

  if (!fs.existsSync('node_modules')) {
    createdNodeModulesDir = true;
    log('making temporary node_modules directory');
    mkdir('node_modules');
  }

  log('installing '+moduleName);
  exec('npm install '+moduleName);

  var dir = 'node_modules/'+moduleName;

  if (!fs.existsSync(dir)) {
    log('could not install '+moduleName+', exiting');
    process.exit();
  }

  loom('--path node_modules/'+moduleName+'/loom '+origin+' '+dest, function() {
    log('removing node_modules/'+moduleName);
    rm('-rf', 'node_modules/'+moduleName);
    if (createdNodeModulesDir) {
      log('removing temporary node_modules directory');
      mkdir('-rf', 'node_modules');
    }
    log('new '+origin+' project is ready to go at: '+dest);
  });

};

function log(msg) {
  console.log(blue('originate:'), msg);
}

