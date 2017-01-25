// <img src=https://AppEdit.solsort.com/icon.png width=96 height=96 align=right>
//
// [![website](https://img.shields.io/badge/website-AppEdit.solsort.com-blue.svg)](https://AppEdit.solsort.com/)
// [![github](https://img.shields.io/badge/github-solsort/AppEdit-blue.svg)](https://github.com/solsort/AppEdit)
// [![codeclimate](https://img.shields.io/codeclimate/github/solsort/AppEdit.svg)](https://codeclimate.com/github/solsort/AppEdit)
// [![travis](https://img.shields.io/travis/solsort/AppEdit.svg)](https://travis-ci.org/solsort/AppEdit)
//
// # AppEdit
//
// This is a code editor, where the edited code is executed live in a web worker. It is intended for teaching, and quickly making small HTML5/App prototypes.
//
//     TODO: animated gif example here.
//
// You can try it live at https://appedit.solsort.com/.
//
//
// # Roadmap / Backlog
//
// ## Milestone 1: make it usable as dev environment for myself
//
// - [x] Reun - module for `require()` from `unpkg.com` directly in the browser
// - [x] DireApe - basic API (only running locally, and nonoptimised) for DIstributed REactive App Environment
// - AppEdit
//     - [x] routing based on search-url
//     - [x] Webworker start
//     - [ ] webworker keep-live
//     - [x] About: Initial version of about-text, rendered as html
//     - [x] Read: convert literate source to markdown, and render
//     - [x] Edit: codemirror + live execution of code in webworker
//         - [x] CodeMirror working
//         - [x] live execution of code in webworker
//         - [x] VIM mode
//     - [x] App: run the app in full window
//     - [ ] Share: save to github, and description of how to deploy as web/npm/app
// - GitHub
//     - [x] github login service - mubackend security review / notes
//     - [x] read source from github
//     - [ ] write file to github
//
// ## Milestone 2:
//
// ## Backlog
//
// - solsort util library
// - social media links under share
// - Better error reporting/handling
// - Snippet sharing through ipfs (requires server)
// - editor in VR
// - simple reactive 3d-rendering library
// - export of `package.json`, based on current `module.meta.package` content.
// - security review of event handling, and add policy, - before events connected to cloud.
// - events to any process, - not just in current browser
// - sync/restore app-db to disk
// - only send changes
// - cross-thread event dispatch through transferables instead of json, for performance.
// - Share app on social media
// - Markdown support. Toggle between document, and literate code in editor.
// - Share: persistent url to current code (without login).
// - ClojureScript, C/C++, and OpenCL support.
// - Optionally only run edited code on 'play', choose where to run the code (`webworker`, `main thread`, `serviceworker`, `browser-addon`, ...)
// - LightScript support
// - only allow export on GPL/MIT-projects
// - JODOM - Jsonml Objects to DOM - render jsonml/appdb to DOM + dispatch events from dom
// - JODOM (Rudimentary unoptimised implementation)
//   - [x] Convert JsonML to DOM
//   - [ ] `style(name, obj)` css by class
//   - [ ] auto-append `px` to numeric values
//   - [ ] `"div.class"` syntax
//   - [ ] convert `on*` parameters to be emit events
//   - [ ] support custom elements, ie: './ui.js:toggle' -
//
// # Dependencies:
//
// - [REUN](https://reun.solsort.com) - require/module-loader through unpkg
// - [DireApe](https://direape.solsort.com) - Distributed Reactive App Environment - message passing + state + handle child processes
// - [µBackend](https://mubackend.solsort.com) - minimal backend, used for github login

module.meta = {
  title: 'AppEdit',
  version: '0.0.1',
  customIndexHtml: true
};


var da = require('direape@0.1');
var reun = require('reun');
var showdown = require('showdown@1.6.0')
var slice = (a, start, end) => Array.prototype.slice.call(a, start, end);

// # routing + load from github
//
var route = location.search.slice(1).split('/');
route[0] = route[0] || 'About';

function main() {
  (({
    Save: save,
    Read: read,
    Edit: edit,
    App: app,
    Share: share
  })[route[0]]||(o=>0))();
}

if(!self.document) {
} else if(location.hash.startsWith('#muBackendLoginToken=')) {
  loggedIn();
} else if(route[1] === 'js' && route[2] === 'gh') {
  loadFromGithub();
} else {
  (document.getElementById('topbar'+route[0])||{}).className = 'topbar-active';
  main();
  document.getElementById('loading').remove();
}

function loadFromGithub() {
  ajax(`https://api.github.com/repos/${route[3]}/${route[4]}/contents/main.js`)
    .then(o => {
      localStorage.setItem('github', JSON.stringify(o));
      localStorage.setItem('appeditContent', atob(o.content));
      location.search = location.search.replace(/\/.*/, '');
    });
}

// # Read
//
function read() {
  var code = localStorage.getItem('appeditContent');
  document.getElementById('app').innerHTML = markdown2html(js2markdown(code));
}

// # Edit
//
var codemirror;
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

  if(window.innerWidth <= 1000) {
    document.getElementById('app').innerHTML =
      '<div id=appedit-code class=main style=top:45%></div>' +
      '<div id=appedit-content class=main ' +
      'style="bottom:55%;outline:1px solid #ddd"></div>';
  } else {
    document.getElementById('app').innerHTML =
      '<div id=appedit-code class=main style=right:50%></div>' +
      '<div id=appedit-content class=main ' +
      'style="left:50%;outline:1px solid #ddd"></div>';
  }

  var codemirrorStyle = {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%'
  };

  if(!localStorage.getItem('appeditContent')) {
    localStorage.setItem('appeditContent',
        "//\ # Sample app \n//\n" +
        "// This is a bit of documentation, try 'Read' above. " +
        "Code can be written as semi-literate code, see more here " +
        "<https://en.wikipedia.org/wiki/Literate_programming>\n\n" +
        "module.meta = {\n" +
        "  id: 'sample-app',\n" +
        "  name: 'Sample Application',\n" +
        "  version: '0.0.1'\n" +
        "};\n" +
        "var da = require('direape@0.1');\n" +
        "da.run(da.parent, 'appedit:html',`\n" +
        "<center>\n" +
        "  <h1>Change me</h1>\n" +
        "  <p>Try to edit the code.</p>\n" +
        "  <p>Choose Edit above, and then<br>\n" +
        "     alter the code on the left side...</p>\n" +
        "  (vi keybindings is enabled,<br>\n" +
        "  so press <tt>i</tt> to insert)\n" +
        "</center>\n" +
        "${Object.keys(require('lodash')).join('<br>')}\n" +
        "`);" );
  }

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
    codemirror.addKeyMap({
      'Ctrl-S': save
    });
    codemirror.on('changes', function(o) {
      var content = o.getValue();
      runSaveCode(content);
    });
  }

  da.handle('appedit:html', (html) => {
    document.getElementById('appedit-content').innerHTML = html;
  });
  setTimeout(createCodeMirror, 0);
  window.onresize = edit;
}

// # App
//
function app() {
  document.getElementById('app').innerHTML = 'Starting app...';
  da.handle('appedit:html', (html) => {
    document.getElementById('app').innerHTML =
      '<div id=appedit-content class=main></div>';
    document.getElementById('appedit-content').innerHTML = html;
  });
}

// # Share
//
// ## Share page/document
function share() {
  document.getElementById('app').innerHTML = markdown2html(`

# Share

      _not implemented yet, will contain the following:_

      If modified, notice need to login to github to save/share.  Notice: will write/publish current version to github (if modified). Also show current name.

      Share app buttons: fb, twitter, linkedin, ...

      Share documentation buttons: fb, twitter, linkedin, ...

      Share source code editing buttons: fb, twitter, linkedin, ...

# Settings

      Vim-mode disable/enable.

# Distribution

      show/upload icon for project

      TODO: guide to \`module.meta\` / preparing for release

      - select application name (needed for saving) - also how to rename project
      - select license

## Deploy to Web

      TODO: guide to set up project with github pages.

      guide to CNAME

## Deploy to Android, iOS, and Windows Phone

      TODO: guide to set up project for Cordova / PhoneGap Build

## Deploy to Facebook

      TODO: guide to release as app on facebook

## Deploy to Chrome

      TODO: guide to release as a Chrome app

      `.replace(/\n */g, '\n'));
}

// ## Generate files for export

function makeFiles(source, meta) {
  var files = [];
  files.push({
    name: meta.id + '.js',
    content: source
  });
  if(!meta.customIndexHtml) {
    files.push({
      name: 'index.html',
      content: makeIndexHtml(source, meta)
    });
  }
  files.push({
    name: 'README.md',
    content: makeReadmeMd(source, meta)
  });
  if(meta.npm) {
    files.push({
      name: 'package.json',
      content: JSON.stringify(Object.assign({
        name: meta.id,
        version: meta.version,
        description: (meta.title || '') + (meta.description || '')
      }, meta.npm), null, 4)
    });
  }
  return files;
}

// It is useful to have the sha-1 of the files, when uploading to github, as we can use that to only upload those that have changed. The function below below just adds a sha property to all the file object.
//
function sha1files(files) {
  return Promise.all(
      files.map(o => new Promise((resolve, reject) =>
          sha1(o.content).then(sha =>
            resolve(Object.assign(o, {sha: sha}))))));
}

// ### Generate index.html from source

function makeIndexHtml(source, meta) {
  return `<!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <title>${meta.title}</title>
    <meta name="format-detection" content="telephone=no">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <link rel=icon href=icon.png>
    <link href="https://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet">
    <body>
    <div id=app>
    ${meta.splash ?
      '<img src=' + meta.splash + ' width=100% height=100%>' :
        markdown2html(makeReadmeMd(source, meta))}
  </div>
    <script src=https://unpkg.com/reun></script>
    <script>document.write('<script src="//incoming.solsort.com/log.js?' + location.protocol + '//' + location.host + location.pathname + location.search + '" async></s' + 'cript>');</script>
    <script>setTimeout(()=>reun.require('./${meta.id}.js'),0);</script>
    </body>
    `
}

// ### Generate README.md from source

function makeReadmeMd(source, meta) {
  var user = meta.githubUser;
  var id = meta.id;
  var project = user + '/' + id;
  var s = `<img src=https://raw.githubusercontent.com/${project}/master/icon.png width=96 height=96 align=right>\n\n`;
  if(meta.url) {
    s+= '[![website](https://img.shields.io/badge/website-' +
        meta.url.replace(/.*[/][/]/, '').replace(/[/].*/, '') +
        `-blue.svg)](${meta.url})\n`;
  }
  s += `[![github](https://img.shields.io/badge/github-${project}-blue.svg)](https://github.com/${project})\n`;
  s+= `[![codeclimate](https://img.shields.io/codeclimate/github/${project}.svg)](https://codeclimate.com/github/${project})\n`;
  if(meta.travis) {
    s += `[![travis](https://img.shields.io/travis/${project}.svg)](https://travis-ci.org/${project})\n`;
  }
  if(meta.npm) {
    s += `[![npm](https://img.shields.io/npm/v/${id}.svg)](https://www.npmjs.com/package/${id})\n`;
  }
  s += js2markdown(source);
  return s;
}

// ## Save to github


function saveToGithub() {
  console.log('saveToGithub');
  location.href = 'https://mubackend.solsort.com/auth/github?url=' +
    location.href.replace(/[?#].*/, '') +
    '&scope=public_repo';
  localStorage.setItem('appeditAction', 'save');
  /* https://developer.github.com/v3/oauth/#scopes */
}
function save() {
  saveToGithub();
}

function loggedIn() {
  var ghurl = 'https://api.github.com';
  var token = location.hash.slice(21);
  var code = localStorage.getItem('appeditContent');
  var meta = localStorage.getItem('appeditMeta');
  var files = [];
  var username = '';
  var codeHash;
  var name = 'tutorial';
  var project;
  var dir;
  ajax('https://mubackend.solsort.com/auth/result/' + token)
    .then(o => token = o.token)
    .then(() => ajax('https://api.github.com/user?access_token=' + token))
    .then(u => {
      project = u.login + '/' + name;
      meta.githubUser = u.login;
      files = makeFiles(code, meta)
        ;})
    .then(()=> ajax(`https://api.github.com/repos/${project}` +
          '?access_token=' + token))
    .then(o => {
      if(o.message === 'Not Found') {
        return ajax('https://api.github.com/user/repos' +
            '?access_token=' + token, { data: {
              name: name,
              auto_init: true,
              gitignore_template: 'Node',
              license_template: 'mit'
            }}).then(() => new Promise((resolve) =>
                setTimeout(resolve, 300)));
      }
    }
    )
    .then(() => sha1(code))
    .then(sha => codeHash = sha)
    .then(()=> ajax(`https://api.github.com/repos/${project}/license` +
          '?access_token=' + token))
    .then(o => (o.license || {}).spdx_id)
    .then(license => {
      if(!['MIT', 'GPL-3.0'].includes(license)) {
        throw new Error('Invalid license')
      }
    }
    )
    .then(() => ajax(
          `https://api.github.com/repos/${project}/contents` +
          '?access_token=' + token))
    .then(files => {
      var sourceName = name + '.js';
      var file = files.filter(f => f.name === sourceName)[0] || {};
      if(file.sha !== codeHash) {

        // we need to save the change

      }
    })
  .catch(e => {
    if(e.constructor === XMLHttpRequest &&
        e.status === 200) {
      saveToGithub();
    }
    console.log('apierror', e);
    throw e;
  });

  localStorage.setItem('appeditAction', '');
}

function ajax(url, opt) {
  opt = opt || {};
  opt.method = opt.method || (opt.data ? 'POST' : 'GET');
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(opt.method, url);
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4) {
        if(xhr.responseText) {
          var result = xhr.responseText;
          try {
            result = JSON.parse(xhr.responseText);
          } catch(e) {
          }
          resolve(result);
        } else {
          reject(xhr);
        }
      }
    }
    xhr.send(opt.data ? JSON.stringify(opt.data) : undefined);
  });
}

// # Utility code
//
// ## General utility code

function js2markdown(src) {
  return ('\n'+src).replace(/\n/g, '\n    ').replace(/\n *[/][/] ?/g, '\n');
}

function markdown2html(markdown) {
  return (new showdown.Converter()).makeHtml(markdown);
}
function log(o) {
  console.log(o);
  return o;
}
function bin2hex(a) {
  return String.fromCharCode.apply(null, new Uint8Array(a))
    .replace(/./g, function(s) {
      var c = s.charCodeAt(0);
      return (c >> 4).toString(16) + (c & 15).toString(16)
    });
}
function sha1(str) {
  return crypto.subtle.digest('SHA-1',
      new self.TextEncoder('utf-8').encode(str))
    .then(bin2hex);
}

// ## Webworker setup

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
    runSaveCode(localStorage.getItem("appeditContent"));
  });
}
newWorker();
function workerExec(str) {
  return new Promise((resolve, reject) =>
      workerPid ? da
      .call(workerPid, 'reun:run', str, location.href)
      .then(o => o ? resolve(o) : reject(o))
      : reject(null)
      )
}
// TODO ping/keepalive
//
// ## Manage code
//
function runSaveCode(str) {
  localStorage.setItem('appeditContent', str);
  workerExec(str).then(o => {
    localStorage.setItem('appeditMeta', JSON.stringify([o && metaValues(o)]));
  });
}
function setCode(str) {
  runSaveCode(str);
  if(codemirror) {
    codemirror.setValue(str);
  }
}

// ## Code export

function metaValues(o) {
  var meta = o.meta || {};
  if(!meta.id && !meta.title) {
    meta = Object.assign({title: 'Unnamed solsort.com app'}, meta);
  }
  meta = Object.assign({
    id: (meta.title|| '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-'),
    title: meta.id,
    version: '0.0.0'
  }, meta);
  return meta;
}

// # Code for experimenting

try {
  console.log('makeFiles');
  sha1files(
      makeFiles(localStorage.getItem('appeditContent'),
        JSON.parse(localStorage.getItem('appeditMeta'))[0]))
    .then(o => console.log('makeFiles-sha', o));
} catch(e) {
}

// # Non-code Roadmap.
//
// - Growth
//   - Workshops
//     - HTML5/App development (non-technical: personal network, coworking spaces)
//     - Library-apps (library-networks, IVA?)
//     - Live HTML5/App prototyping (technical: @home-hackathon, cphjs, cph-frontend, ...)
//     - Local teaching
//   - Apps shared within dev environment
//   - Announce on various social medias
//   - Video tutorials about using app-edit / developing with javascript
// - Business model
//   - Dual-license infrastructure library: GPL/commercial
//   - Paid workshops
//   - Subscriptions:
//     - Free Trial - only github-export to public GPL/MIT-licensed projects, and no config.xml for building cordova apps
//     - Personal - for non-commercial projects only, allows you to export to private github projects, and with config.xml for phonegap build. Includes infrastructure non-GPL-license.
//     - Professional - for commercial projects, includes infrastructure non-GPL-license.
//   - Maybe 50% subscription fee back to community/growth: bug bounties, (recursive) referral (for example identify via coupon for first month free, limit such as 100), competition-prices, contributor-prizes, ...
//
// # License
//
// This software is copyrighted solsort.com ApS, and available under GPLv3, as well as proprietary license upon request.
//
// Versions older than 10 years also fall into the public domain.
//
// # Changelog
//
// ## 2017-01-01 Project started
//
