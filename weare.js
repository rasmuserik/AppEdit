function RequireError(module) { this.module = module; }
var baseUrl = './';

function moduleUrl(module) {
  if(module[0] === '.') {
    url = baseUrl;
    if(url.startsWith('https://unpkg.com/')) {
      if(-1 === url.slice(18).indexOf('/')) {
        url += '/';
      }
    }
    url = url.replace(/[/][^/]*$/, '/');
    url += module;
    url = url.replace(/[/][.][/]/g, '/');
    return url;
  } else {
    return 'https://unpkg.com/' + module;
  }
}

var modules = {};

self.require = function require(module) {
  var result = modules[moduleUrl(module)];
  if(result) {
    return result;
  }
  throw new RequireError(module);
};

function execute(src) {
  var module = {exports: {}};
  try {
    (new Function('module', 'exports', src))(module, module.exports);//jshint ignore:line
  } catch(e) {
    if(!(e instanceof RequireError)) {
      throw e;
    }
    var prevBaseUrl = baseUrl;
    baseUrl = moduleUrl(e.module, baseUrl);
    console.log('require("' + e.module + '") -> ', baseUrl);
    return fetch(baseUrl)
      .then(o => o.text())
      .then(src => execute(src))
      .then(module => {
        modules[baseUrl] = module.exports;
        baseUrl = prevBaseUrl;
        return execute(src);
      });
  }
  return module;
}

execute('require("./draf.js");');
