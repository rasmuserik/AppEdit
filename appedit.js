// # AppEdit JS▶
//
// You can try it live at https://appedit.solsort.com/.
//
// This is a code editor, where the edited code is executed live in a web worker. 
// It is intended for teaching, and quickly making small HTML5/App prototypes.
//
// - The webworker restarts automatically when the written code is unresponsive
// - JsonML i rendered
// 
// # Literate source code

// Below is the actual source code for the application.

// ## App state / initialisation
  
if(location.search === '') {
  location.search = '?Code';
}
var state = self.appeditState;
if(!state) {
  state = self.appeditState = {};
  setTimeout(createCodeMirror, 0);
}

// ## Util
  
// ### Dependencies
  
var URL = self.URL || self.webkitURL;
var Worker = self.Worker;
  
// ### Convert jsonml to dom
  
function jsonml2dom(o) { 
  if(typeof o === 'string') {
    return document.createTextNode(o);
  } else if(typeof o === 'undefined') {
    return document.createTextNode('undefined');
  } else if(Array.isArray(o)) {
    var node = document.createElement(o[0]);
    var tagtype = o[0];
    var params = o[1];
    var firstChild;
    if(typeof params === 'object' && params.constructor === Object) {
      for(var k in params) {
        if(k === 'style') {
          Object.assign(node.style, params[k]);
        } else {
          node[k] = params[k];
        }
      }
      firstChild = 2;
    } else {
      params = {};
      firstChild = 1;
    }
    for(var i = firstChild; i < o.length; ++i) {
      node.appendChild(jsonml2dom(o[i]));
    }
    return node;
  } else {
    console.log('err', o, typeof o);
    throw 'unexpected type of parameter to jsonml2dom - ' + o;
  }
}
  
// ## UI

var menuHeight = '30px';
var menuBackground = '#345';
function makeMenuItem(str) {

}
var rootElem = jsonml2dom(
    ['div', {id: 'appedit', style:{
    }},
      ['div', { id: 'topbar', style: {
          display: 'inline-block',
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: menuHeight,
          textAlign: 'center',
          font: '18px sans-serif',
          lineHeight: '20px',
          background: menuBackground,
          color: '#fff'
        }},
        'AppEdit',
        /*['div', {style: {
          display: 'inline-block',
          height: menuHeight,
          fontSize: '13px',
          lineHeight: '15px',
          fontWeight: 'bold',
          verticalAlign: 'top'
        }},
        'AppEdit.', ['br'], 'solsort.com'],*/
        ' \xa0 '
      ].concat(
        ['Info', 'Code', 'App', 'Share']
        .map(s => 
          ["a", {href: '?'+s, style: {
            display: 'inline-block',
            textDecoration: 'none',
            background: location.search.startsWith('?'+s)
              ? '#123'
              : menuBackground,
            padding: '5px 5px 4px 5px',
            color: 'white',
            fontSize: '14px',
          }}, s]
        )
      ),
      ['div', {id: 'appedit-main', style: {
        display: 'inline-block',
        position: 'absolute',
        top: menuHeight, left: 0, right: 0 , bottom: 0
      }}, 
        ['div', {id: 'appedit-code', style: {
          display: 'inline-block',
          position: 'absolute',
          overflow: 'auto',
          top: 0, left: 0, bottom: 0,
          width: location.search.startsWith('?Code') ? '50%' : 0
        }}], 
        ['div', {id: 'appedit-content', style: {
          display: 'inline-block',
          position: 'absolute',
          overflow: 'auto',
          top: 0, right: 0, bottom: 0,
          width: location.search.startsWith('?Code') ? '50%' : '100%'
        }}]]]);

document.body.appendChild(rootElem);
var codemirrorStyle = {
  position: 'absolute',
  top: 0, left: 0,
  width: '100%', height: '100%'
};

// ## Code editor
  

function createCodeMirror() {
  state.codemirror = self.CodeMirror(
      function(cmElement) {
        cmElement.id = "codemirror";
        Object.assign(cmElement.style, codemirrorStyle);
        document.getElementById('appedit-code').appendChild(cmElement);
      },
      {
    mode: 'javascript',
    lineWrapping: true,
    lineNumbers: true,
    value: localStorage.getItem('appeditContent') ||
      "db = require('reactive-db');\n\n"  +
      "function html(code) {\n" +
      "    db.set('html', code);\n" +
      "}\n\n" +
      "html(['div', {style: {textAlign: 'center'}},\n" +
      "  ['h1', 'Change me'],\n" +
      "  ['p', 'Try to edit the text,', \n" +
      "    ['br'], ' in the code on the left side...']]);\n"
  });
  state.codemirror.on('change', function(o) { state.onsourcechange(o); });
}

// ## Code running within the webworker

// The code is included here as a template string (ES6-feature, widely supported in modern browsers. Thus we have to disable jshint (it will also not apply to the worker-code, as it is just a string). The code needs to be passed as an url to the WebWorker constructor.

/* jshint ignore:start */
var workerCodeUrl = URL.createObjectURL(new Blob([`

// The code below runs within the worker thread, and bootstraps the environment.

// ### Event handling

var events = {};
self.setHandler = function(e, f) { events[e] = f; }
self.onmessage = function(msg) {
  var o = msg.data;
  var handler = events.eventError;
  if(typeof o === "object" && events[o.type]) {
    handler = events[o.type];
  } 
  // TODO handle binary data
  handler(o);
}
setHandler('eventError', o => console.log('Unhandled event: ', o));

// ### Modules TODO: should be extracted as separate npm modules

// #### TODO Reactive database

// Currently just an API-shim, will be implemented later

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

// #### send HTML to main thread

reactiveDB.reaction("html", function(db) {
  postMessage({type: "html", data: db.get('html')});
});

// ### handle loading of external modules

function RequireError(module) {
  this.module = module;
}
var modules = {};
self.unpkg = self.require = function unpkg(module) {
  console.log('require', module);
  if(modules[module]) {
    return modules[module];
  }
  if(module === 'reactive-db') { // TODO: make reactive-db npm module, and remove this.
    return reactiveDB;
  }
  throw new RequireError(module);
}

// ### Eval

function execute(src) {
  var module = {exports: {}};
  try {
    (new Function("module", "exports", src))(module, module.exports);
  } catch(e) {
    if(e instanceof RequireError) {
      return fetch('https://unpkg.com/' + e.module)
        .then(o => o.text())
        .then(src => execute(src))
        .then(module => {
          modules[e.module] = module.exports;
          return execute(src);
        });
    } else {
      // TODO handle error and emit relevant event
      throw e
    }
  }
  return module;
}
setHandler('eval', o =>  execute(o.code, {exports: {}}));

// ### End of webworker code

`]));
/* jshint ignore:end */

// ## Webworker setup

// ### Initialisation functions.

function newWorker() {
  if(state.worker) {
    state.worker.terminate();
  }
  state.worker = new Worker(workerCodeUrl);
  state.worker.onmessage = handleWorkerMessage;
  workerExec(state.codemirror.getValue());
}

// Give codemirror time to initialise, before creating the worker.

setTimeout(newWorker, 100);


// ### Handle messages from worker to main thread

function handleWorkerMessage(msg) {
  var o = msg.data;
  switch(o.type) {
    case "ping":
      state.lastPing = Date.now();
      break;
    case "html":
      var html = o.data;
      if(!Array.isArray(o.data)) {
        html = ["div", "Error: html from worker is not JsonML",
          ["pre", JSON.stringify(o.data, null, 4)]];
      } 
      var baseElem = document.getElementById("workerHTML");
      if(!baseElem) {
        baseElem = jsonml2dom(
            ["div", {
            id: "workerHTML",
            style: { }
            }]);
        document.getElementById('appedit-content').appendChild(baseElem);
      }
      if(baseElem.children[0]) {
        baseElem.children[0].remove();
      }
      baseElem.appendChild(jsonml2dom(html));
      break;
    default:
      console.log('unhandled worker message', o);
  }
}

state.lastPing = Date.now();
setInterval(function pinger() {
  silentTime = Date.now() - state.lastPing;
  if(silentTime > 2000) {
    console.log('worker not answering, restarting');
    state.lastPing = Date.now();
    newWorker();
  }
  workerExec('self.postMessage({type: "ping"})');
}, 100);

function workerExec(o) {
  state.worker.postMessage({type: 'eval', code: o});
}

// ## onchange

state.onsourcechange = function(o) {
  var content = o.getValue();
  localStorage.setItem("appeditContent", content);
  workerExec(content);
};


// # Experiments
