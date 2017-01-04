function RequireError(module) { this.module = module; }
var baseUrl;

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
  while(-1 !== url.indexOf('/../')) {
    url = url.replace(/[/][^/]*[/][.][.][/]/, '/');
  }
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

function execute(src, base) {
  if(base) {
    baseUrl = base;
  }
  var module = {exports: {}};
  try {
    //console.log('execute', baseUrl);
    (new Function('module', 'exports', src))(module, module.exports);//jshint ignore:line
  } catch(e) {
    if(!(e instanceof RequireError)) {
      console.log(src);
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

execute('require("./draf.js");', './');
