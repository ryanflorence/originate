require('shelljs/global');
var fs = require('fs');
var color = require('cli-color');
var loom = require('../loom');
var blue = color.blue;
var red = color.red;
var prompt = require('cli-prompt');

module.exports = function() {

  if (process.argv[2]) {
    if (process.argv[2].match(/(--help|-h)/)) {
      logHelp();
      process.exit();
    }

    if (process.argv[2].match(/(--version|-v)/)) {
      console.log('v'+require('./package').version);
      process.exit();
    }
  }

  if (process.argv.length !== 4) {
    logHelp();
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
    log(red('could not install '+moduleName+' from npm, exiting\n'));
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
  console.log('\n'+blue('originate:'), msg);
}


function logHelp() {
  console.log('\n  Usage:');
  console.log('\n    originate [origin] [project-path]');
  console.log('\n  Example:');
  console.log('\n    originate ember my-new-app');
  console.log('\n  Creating Origins:');
  console.log('\n    Publish projects to npm as "originate-<name>" to create\n    new origins; others can then use them immediately.');
  console.log('\n');
}
