// # Dependencies

var da = require('direape');
var slice = (a, start, end) => Array.prototype.slice.call(a, start, end);

// # UI
//
var route = location.search.slice(1).split('/');
route[0] = route[0] || 'About';

document.getElementById('topbar'+route[0]).className = 'topbar-active';

({
  About: (o=>o), 
  Read: read, 
  Edit: edit, 
  App: app, 
  Share: share
})[route[0]]();

  document.getElementById('loading').remove();

// # Read
//
function js2markdown(src) {
  return ('\n'+src).replace(/\n/g, '\n    ').replace(/\n *[/][/] ?/g, '\n');
}
function markdown2html(markdown) {
  return (new (require('showdown@1.6.0')).Converter()).makeHtml(markdown);
}
function read() {
  var code = localStorage.getItem('appeditContent');
  document.getElementById('app').innerHTML = markdown2html(js2markdown(code));
}

// # App
//
function app() {
da.handle('appedit:html', (state, html) => {
  document.getElementById('app').innerHTML = 
     '<div id=appedit-content class=main></div>';
  document.getElementById('appedit-content').innerHTML = html;
});
}

// # Share
//
function share() {
  document.getElementById('app').innerHTML = markdown2html(`

# Share 

     options to share on github

      ...not implemented yet...
      
    `.replace(/\n */g, '\n'));
}

// # Editor
//
function edit() {
var CodeMirror = require('codemirror/lib/codemirror');
require('codemirror/addon/runmode/runmode.js');
require('codemirror/addon/runmode/colorize.js');
require('codemirror/addon/fold/foldcode.js');
require('codemirror/addon/fold/brace-fold.js');
require('codemirror/addon/fold/markdown-fold.js');
require('codemirror/keymap/vim.js');
require('codemirror/mode/javascript/javascript.js');
require('codemirror/mode/markdown/markdown.js');

    document.getElementById('app').innerHTML =
      '<div id=appedit-code class=main style=right:50%></div>' +
      '<div id=appedit-content class=main ' +
      'style="left:50%;outline:1px solid black"></div>';

var codemirrorStyle = {
  position: 'absolute',
  top: 0, left: 0,
  width: '100%', height: '100%'
};

if(!localStorage.getItem('appeditContent')) {
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

var codemirror;
function createCodeMirror() {
  codemirror = CodeMirror(
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
  codemirror.on('change', function(o) { 
  var content = o.getValue();
  localStorage.setItem("appeditContent", content);
  workerExec(content);
  });
}

da.handle('appedit:html', (state, html) => {
  document.getElementById('appedit-content').innerHTML = html;
});
    setTimeout(createCodeMirror, 0);
}

// # Webworker setup

var workerPid;
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
