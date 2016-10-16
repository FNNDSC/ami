const packageJSON = require('../package.json')

// copyright

// config.threeVersion
// config.cdn
// config.gaKey
// config.license

exports.amiVersion = function(){
    return packageJSON.version;
}

exports.amiCDN = function(){
    return 'https://cdn.rawgit.com/fnndsc/ami/master/dist/ami.js';
}

exports.threeVersion = function(){
    return packageJSON.threeVersion;
}

exports.gaKey = function(){
    return 'UA-39303022-3';
}

exports.devRoot = function(){
    return 'dev';
}

exports.distRoot = function(){
    return 'dist';
}

exports.buildRoot = function(){
    return 'build';
}