// # Dependencies

var URL = self.URL || self.webkitURL;
var Worker = self.Worker;
var da = require('direape');
var CodeMirror = require('codemirror/lib/codemirror');
require('codemirror/addon/runmode/runmode.js');
require('codemirror/addon/runmode/colorize.js');
require('codemirror/addon/fold/foldcode.js');
require('codemirror/addon/fold/brace-fold.js');
require('codemirror/addon/fold/markdown-fold.js');
require('codemirror/keymap/vim.js');
require('codemirror/mode/javascript/javascript.js');
require('codemirror/mode/markdown/markdown.js');
var jsonml2dom = require('./jodom.js').jsonml2dom;
var setTimeout = self.setTimeout;
var slice = (a, start, end) => Array.prototype.slice.call(a, start, end);
var workerPid;

// # Initialisation

if(!location.search) {
  location.search = '?Edit';
}
var state = {};

// # Routing
var route = location.search.slice(1).split('/');
route[0] = route[0] || 'About';

// # UI
(()=>{
document.getElementById('loading').remove();
(document.getElementById('topbar'+route[0])||{}).className = 'topbar-active';

var app = document.getElementById('app');
console.log(route[0])
switch(route[0]) {
  case 'Read':
    break;
  case 'Edit':
    console.log('here', app);
    app.innerHTML =
      '<div id=appedit-code class=main style=right:50%></div>' +
      '<div id=appedit-content class=main ' +
      'style="left:50%;outline:1px solid black"></div>';
    document.getElementById('app')
    setTimeout(createCodeMirror, 0);
    break;
  case 'App':
    break;
  case 'Share':
    break;
};
})();
// # Code editor
var codemirrorStyle = {
  position: 'absolute',
  top: 0, left: 0,
  width: '100%', height: '100%'
};


if(true|| !localStorage.getItem('appeditContent')) {
  localStorage.setItem('appeditContent', 
      "var da = require('direape');\n" +
      "da.dispatch(da.msg(da.parent, 'appedit:html',`\n" +
      "<center>\n" +
      "  <h1>Change me</h1>\n" +
      "  <p>Try to edit the code.</p>\n" +
      "  <p>Choose Edit above, and then<br>\n" +
      "     alter the code on the left side...</p>\n" +
      "  (vi keybindings is enabled,<br>\n" +
      "  so press <tt>i</tt> to insert)\n" +
      "</center>\n" +
      "`));" );
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
        extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
        lineWrapping: true,
        keyMap: 'vim',
        lineNumbers: true,
        value: localStorage.getItem('appeditContent')
      });
  state.codemirror.on('change', function(o) { state.onsourcechange(o); });
}

// # Webworker setup

function worker() {
  da.dispatch(da.msg.apply(null, [workerPid].concat(slice(arguments))));
}

function newWorker() {
  if(workerPid) {
    da.kill(workerPid);
    workerPid = undefined;
  }
  da.spawn().then(pid => {
    workerPid = pid;
    workerExec('require("direape").parent = "' + da.pid + '";');
    workerExec(localStorage.getItem("appeditContent"));
  });
}
newWorker();
function workerExec(str) {
  worker('reun:run', str, location.href);
}
// TODO ping/keepalive

/*
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
var silentTime;
setInterval(function pinger() {
silentTime = Date.now() - state.lastPing;
if(silentTime > 200000) {
console.log('worker not answering, restarting');
state.lastPing = Date.now();
newWorker();
}
workerExec('self.postMessage({type: "ping"})');
}, 1000);

function workerExec(o) {
state.worker.postMessage({dst: 'weare.execute', data: [o, location.href]});
//state.worker.postMessage({type: 'execute', code: o, url: location.href});
}
*/

// # onchange

state.onsourcechange = function(o) {
  var content = o.getValue();
  localStorage.setItem("appeditContent", content);
  workerExec(content);
};


da.handle('appedit:html', (state, html) => {
  document.getElementById('appedit-content').innerHTML = html;
});
