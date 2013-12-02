require('shelljs/global');
var fs = require('fs');
var color = require('cli-color');
var loom = require('loom');
var blue = color.blue;
var red = color.red;

module.exports = function() {
  maybeLogHelpOrVersion();
  validateArgs();
  run();
};

function run() {
  var origin = process.argv[2];
  var dest = process.argv[3];
  var moduleName = 'originate-'+origin;
  if (origin.match('@')) {
    origin = origin.replace(/@.+/, '');
  }
  var createdNodeModulesDir = false;
  var loomPath = 'node_modules/'+moduleName+'/loom';
  var loomCommand = '--path '+loomPath+' '+origin+' '+dest;

  ensureNodeModules();
  installModule();
  validateInstall();
  loom(loomCommand, afterLoom);

  function afterLoom() {
    cleanup();
    log('new '+origin+' project is ready to go at: '+dest);
  }

  function ensureNodeModules() {
    if (!fs.existsSync('node_modules')) {
      createdNodeModulesDir = true;
      log('making temporary node_modules directory');
      mkdir('node_modules');
    }
  }

  function installModule() {
    log('installing '+moduleName);
    exec('npm install '+moduleName);
  }

  function validateInstall() {
    var dir = 'node_modules/'+moduleName;
    if (!fs.existsSync(dir)) {
      log(red('could not install '+moduleName+' from npm, exiting\n'));
      process.exit();
    }
  }

  function cleanup() {
    log('removing node_modules/'+moduleName);
    rm('-rf', 'node_modules/'+moduleName);
    if (createdNodeModulesDir) {
      log('removing temporary node_modules directory');
      mkdir('-rf', 'node_modules');
    }
  }
};

function log(msg) {
  console.log('\n'+blue('originate:'), msg);
}

function logHelp() {
  console.log('\n  Usage:');
  console.log('\n    originate <origin[@version]> <project-path>');
  console.log('\n  Example:');
  console.log('\n    originate ember my-app\n    originate ember@1.0.2 my-app');
  console.log('\n  Creating Origins:');
  console.log('\n    Publish projects to npm as "originate-<name>" to create\n    new origins; others can then use them immediately.');
  console.log('\n');
}

function maybeLogHelpOrVersion() {
  if (!process.argv[2]) {
    return;
  }
  if (process.argv[2].match(/(--help|-h)/)) {
    logHelp();
    process.exit();
  }
  if (process.argv[2].match(/(--version|-v)/)) {
    console.log('v'+require('./package').version);
    process.exit();
  }
}

function validateArgs() {
  if (process.argv.length !== 4) {
    logHelp();
    process.exit();
  }
}

