var immutable = require('immutable');
var draf = exports;

// # Generic utility functions
//
// Should probably be replaced with better general module
//
function randomString() {
  return Math.random().toString(32).slice(2);
}
function nextTick(f) {
  setTimeout(f, 0);
}
function slice(a, start, end) {
  return Array.prototype.slice.call(a, start, end);
}
function warn() {
  console.log.apply(console, ['warn'].concat(slice(arguments)));
}

// # Internal methods
var pid = "PID" + randomString() + randomString() + randomString();
var state = new immutable.Map().set(pid, new immutable.Map());
var prevState = state;
var handlers = {};
var messageQueue = [];
var scheduled = false;
var reactions = {};
var transports = {};
transports[pid] = o => {
  var mbox = o.dst.slice(0, o.dst.lastIndexOf('@'));
  if(handlers[mbox]) {
    state = handlers[mbox].apply(o, [state].concat(o.data)) || state;
  } else {
    warn('missing handler for ', pid.length, o, mbox);
  }
}
transports['*'] = o => self.postMessage(o);
self.onmessage = o => {
  //console.log('onmessage', o)
  _dispatchAsync(o.data);
}
function _dispatchAsync(o) {
   messageQueue.push(o);
   _dispatchAll(); 
};
function _dispatchSync(o) {
  //console.log(pid.slice(0,7), o);
  o.dst = (o.dst || '').includes('@') ? o.dst : o.dst + '@' + pid;
  var f = transports[o.dst.slice(o.dst.lastIndexOf('@') + 1)];
  (f || transports['*'])(o);
}

function _dispatchAll() {
  if(scheduled) {
    return;
  }
  scheduled = true;
  nextTick(function() {
    scheduled = false;
    var messages = messageQueue;
    messageQueue = [];
    for(var i = 0; i < messages.length; ++i) {
      try {
      _dispatchSync(messages[i])
      } catch(e) {
        warn('error during dispatch:', e);
      }
    }

    if(!prevState.equals(state)) {
      //console.log('reaction needed');  
      for(var k in reactions) {
        try {
          reactions[k]();
      } catch(e) {
        warn('error during reaction:', e);
      }
      }
      prevState = state;
    } else {
      //console.log('reaction unneeded');  
    }
  });
}

// # API
draf.pid = pid;
draf._transports = transports;
draf.handle = (eventType, f) => { handlers[eventType] = f; }
draf.call = dst => _dispatchAsync({dst: dst, data: slice(arguments, 1)}); 
draf.dispatchAsync = _dispatchAsync;
draf.dispatchSync = (o) => { _dispatchSync(o); _dispatchAll(); };
draf.getIn = (ks, defaultValue) => state.getIn(ks, defaultValue);
draf.reaction = (name, f) => { reactions[name] = f; }

// # Built-in event handlers
draf.handle('weare.execute', (state, code, uri) => {
  require('weare').execute(code, uri);
});
draf.handle('draf.getIn', (state, ks, mbox) => {
  draf.dispatchAsync({dst: mbox, data: [draf.getIn(ks)]});
});
draf.handle('draf.setIn', (state, ks, value) => state.setIn(ks,value)); 

var subscriptions = new Set();
draf.handle('draf.subscribe', function(state, path, dst) {
  subscriptions.add([path, dst]);
});
draf.handle('draf.unsubscribe', function(state, path, dst) {
  subscriptions.delete([path, dst]);
});
draf.reaction('draf.subscriptions', function() {
  for(var v of subscriptions) {
    draf.dispatchAsync({dst: v[1], data:[draf.getIn(v[0])]});
  }
});

try {
  postMessage({dst: 'draf.workerReady', data: [pid]});
} catch(e) {
}

// # Old code
/*
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
*/
