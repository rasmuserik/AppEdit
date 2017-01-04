// # Dependencies
  
var URL = self.URL || self.webkitURL;
var Worker = self.Worker;
var CodeMirror = require('codemirror/lib/codemirror');
require('codemirror/addon/runmode/runmode.js');
require('codemirror/addon/runmode/colorize.js');
require('codemirror/mode/javascript/javascript.js');
require('codemirror/mode/markdown/markdown.js');
var jsonml2dom = require('./jodom.js').jsonml2dom;
var setTimeout = self.setTimeout;

// # Initialisation

if(!location.search) {
  location.search = '?Edit';
}
var state = {};
setTimeout(createCodeMirror, 0);

// # UI

var menuHeight = '36px';
var menuBackground = '#345';
function makeMenuItem(str) {

}
var rootElem = jsonml2dom(
    ['div', {id: 'appedit', style:{
    }},

// ## Top menu

      ['div', { id: 'topbar', style: {
          display: 'inline-block',
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: menuHeight,
          textAlign: 'left',
          font: '22px sans-serif',
          lineHeight: '20px',
          background: menuBackground,
          color: '#fff'
        }},
        ['img', {src: 'icon.png', width: 36, height: 36, style: {
          float: 'left'
        }}]
      ].concat(
        ['About', 'Read', 'Edit', 'App', 'Share']
        .map(s => 
          ["a", {href: '?'+s, style: {
            display: 'inline-block',
            textDecoration: 'none',
            background: location.search.startsWith('?'+s) ? 
              '#123' : menuBackground,
            padding: '8px 10px 8px 10px',
            color: 'white',
            fontSize: '16px',
          }}, s]
        )
      ),

// ## main wrapper

      ['div', {id: 'appedit-main', style: {
        display: 'inline-block',
        position: 'absolute',
        top: menuHeight, left: 0, right: 0 , bottom: 0
      }}, 

      // ## `Read` the literate code
      
      location.search.startsWith('?Read') ?
        ['div', 
         ['p', 'This is the documentation and source code for the current app. Click on "Edit" or "App" above to run it.'],
        ['div', 'TODO: documentation / literate source code of current app']]:

      // ## `Edit` the app
     
      location.search.startsWith('?Edit') ?
       ['div',
        ['div', {id: 'appedit-code', style: {
          display: 'inline-block',
          position: 'absolute',
          overflow: 'auto',
          top: 0, left: 0, bottom: 0,
          width: '50%'
        }}], 
        ['div', {id: 'appedit-content', style: {
          display: 'inline-block',
          position: 'absolute',
          outline: '1px solid black',
          overflow: 'auto',
          top: 0, right: 0, bottom: 0,
          width: '50%'
        }}]]:

// ## Run the `App`

      location.search.startsWith('?App') ?
        ['div', {id: 'appedit-content'}]:

      // ## `Share` the app + settings
       
      location.search.startsWith('?Share') ?
        ['div', 
         ['p', 'TODO: sharing-links/buttons, and general settings']]:

      // ## `About` the app editor (default)
       
       ['div', 
       'More info to come here...',
       ['ul',
       ['li', 'About: this is / made with a tool for live editing small apps'],
       ['li', 'Introduction: Code App Share(+settings)'],
       ['li', 'Pricing: currently only free trial, later on plans that allows you to publish the apps outside of this site'],
       ['li', 'Key bindings during editing'],
       ['li', 'Introduction to programming + links']
       ]]]]);

document.body.appendChild(rootElem);
var codemirrorStyle = {
  position: 'absolute',
  top: 0, left: 0,
  width: '100%', height: '100%'
};


// # Code editor
  

if(!localStorage.getItem('appeditContent')) {
  localStorage.setItem('appeditContent',
      "db = require('./draf.js');\n\n"  +
      "function html(code) {\n" +
      "    db.set('html', code);\n" +
      "}\n\n" +
      "html(['div', {style: {textAlign: 'center'}},\n" +
      "  ['h1', 'Change me'],\n" +
      "  ['p', 'Try to edit the code.'], \n" +
      "    ['p', 'Choose Edit above, and then',\n" +
      "    ['br'], ' alter the code on the left side...']]);\n"
      );
}
function createCodeMirror() {
  state.codemirror = CodeMirror(
      function(cmElement) {
        cmElement.id = "codemirror";
        Object.assign(cmElement.style, codemirrorStyle);
        document.getElementById('appedit-code').appendChild(cmElement);
      },
      {
    mode: 'javascript',
    lineWrapping: true,
    lineNumbers: true,
    value: localStorage.getItem('appeditContent')
  });
  state.codemirror.on('change', function(o) { state.onsourcechange(o); });
}

// # Webworker setup

// ## Initialisation functions.

function newWorker() {
  if(state.worker) {
    state.worker.terminate();
  }
  state.worker = new Worker('./weare.js');
  state.worker.onmessage = handleWorkerMessage;
  // TODO this should actually be queued until the worker is ready (all dependencies are loaded instead of just waiting 500ms
  setTimeout(o => workerExec(localStorage.getItem('appeditContent')), 500);
}

// Give codemirror time to initialise, before creating the worker.

newWorker();


// ## Handle messages from worker to main thread

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

// # onchange

state.onsourcechange = function(o) {
  var content = o.getValue();
  localStorage.setItem("appeditContent", content);
  workerExec(content);
};


