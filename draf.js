var immutable = require('immutable');

function randomString() {
  return Math.random().toString(32).slice(2);
}

var pid = "PID" + randomString() + randomString() + randomString();

var draf = exports;
exports.pid = pid;

var handlers = {};
function dispatch(o) { handlers[o.type](o); }
self.onmessage = msg => dispatch(msg.data);
self.setHandler = (name, fn) => handlers[name] = fn;
setHandler('execute', o => execute(o.code, o.url));

var state = {};
var reactions = {};

var draf = {};
draf.get = function(k, defaultValue) {
  if(typeof k !== 'string') {
    throw 'root key needs to be string';
    // TODO handle array as recursive lookup (and numbers to access array) + typecheck
  }
  return (state[k] === undefined) ? defaultValue : state[k];
};
draf.set = function(k, v) {
  if(typeof k !== 'string') {
    throw 'root key needs to be string';
    // TODO handle array as recursive lookup (and numbers to access array) + typecheck
  }
  state[k] = v;
  for(var key in reactions) {
    if(reactions[key]) {
      reactions[key](draf);
    }
  }
};
draf.reaction = function(k, f) {
  reactions[k] = f;
  f(draf);
};
if(!self.document) {
  draf.reaction("html", function(db) {
    postMessage({type: "html", data: db.get('html')});
  });
}

module.exports = draf;
