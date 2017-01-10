(function() {
  "use strict";

  function urlGet(url) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
          if(typeof xhr.responseText === 'string') {
            resolve(xhr.responseText);
          } else {
            reject(xhr);
          }
        }
      }
      xhr.send();
    });
  }

  function RequireError(module, url) { 
    this.module = module; 
    this.url = url;
  }
  RequireError.prototype.toString = function() {
    return 'RequireError:' + this.module +
      ' url:' + this.url;
  }

  function moduleUrl(path, module) {
    if(module === 'weare') {
      return 'weare';
    }
    path = (module.startsWith('.')
        ? path.replace(/[/][^/]*$/, '/')  
        : 'https://unpkg.com/');
    path = path + module;
    while(path.indexOf('/./') !== -1) {
      path = path.replace('/./', '/');
    }
    var prevPath;
    do {
      prevPath = path;
      path = path.replace(/[/][^/]*[/][.][.][/]/g, '/');
    } while(path !== prevPath);
    return path;
  }

  var modules = {weare:{execute:execute}};
  function _execute(src, path) {
    var require = function require(module) {
      var url = moduleUrl(path, module);
      //console.log('require', module, url);
      if(!modules[url]) {
        throw new RequireError(module, url);
      } 
      return modules[url];
    };
    var wrappedSrc = '(function(module,exports,require){' +
      src + '})//# sourceURL=' + path;
    var module = {
      id: path.replace('https://unpkg.com/', ''),
      uri: path,
      exports: {}};
    var f = eval(wrappedSrc);
    try {
      f(module, module.exports, require);
    } catch (e) {
      if(e.constructor !== RequireError) {
        throw e;
      }
      return urlGet(e.url)
        .then(function(moduleSrc) {
          return _execute(moduleSrc, e.url);
        })
      .then(function(module) {
        //console.log('loaded', e.url);
        modules[e.url] = module.exports;
      })
      .then(function() {
        return _execute(src, path);
      });
    }
    return Promise.resolve(module);
  }

  var executeQueue = _execute('require("./draf.js");', './draf.js');
  function execute(src, path) {
    var result = executeQueue.then(function() {
      return _execute(src, path);
    });
    executeQueue = result;
  }

  if(typeof module === 'object') {
    exports.execute = execute;
  } else {
    self.execute = execute;
  }
})();
