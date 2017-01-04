var handlers = {};
function dispatch(o) { handlers[o.type](o); }
self.onmessage = msg => dispatch(msg.data);
self.setHandler = (name, fn) => handlers[name] = fn;
setHandler('eval', o => execute(o.code, './'));


var state = {};
var reactions = {};

var reactiveDB = {};
reactiveDB.get = function(k, defaultValue) {
  if(typeof k !== 'string') {
    throw 'root key needs to be string';
    // TODO handle array as recursive lookup (and numbers to access array) + typecheck
  }
  return (state[k] === undefined) ? defaultValue : state[k];
};
reactiveDB.set = function(k, v) {
  if(typeof k !== 'string') {
    throw 'root key needs to be string';
    // TODO handle array as recursive lookup (and numbers to access array) + typecheck
  }
  state[k] = v;
  for(var key in reactions) {
    if(reactions[key]) {
      reactions[key](reactiveDB);
    }
  }
};
reactiveDB.reaction = function(k, f) {
  reactions[k] = f;
  f(reactiveDB);
};
reactiveDB.reaction("html", function(db) {
  postMessage({type: "html", data: db.get('html')});
});

module.exports = reactiveDB;
