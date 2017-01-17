# JS▶ &nbsp; _AppEdit_

This is a code editor, where the edited code is executed live in a web worker. It is intended for teaching, and quickly making small HTML5/App prototypes.

    TODO: animated gif example here.

You can try it live at https://appedit.solsort.com/.

Features:

- Code editing with live execution in WebWorker


## Parts/modules

The code is / will become split up in different parts:

- [REUN](https://reun.solsort.com) - require/module-loader through unpkg
- [DireApe](https://direape.solsort.com) - Distributed Reactive App Environment - message passing + state + handle child processes
- AppEdit - The application itself
- GitHub-import/export (requires light server)

## Roadmap / intended features

### Milestone 1: make it usable as dev environment for myself

- [x] Reun 
- [x] DireApe 
- AppEdit
  - [ ] routing based on search-url
  - [x] Webworker start
  - [ ] webworker keep-live
  - [ ] About: Initial version of about-text, rendered as html
  - [ ] Read: convert literate source to markdown, and render
  - [x] Edit: codemirror + live execution of code in webworker
    - [x] CodeMirror working
    - [x] live execution of code in webworker
    - [x] VIM mode
  - [x] App: run the app in full window
  - [ ] Share: settings + save to github
    - [ ] choose whether to use 
- [ ] solsort batteries included util library
  - [ ] move jodom utilities into library
  - [ ] add functionality as needed
- GitHub 
  - [ ] github login service - mubackend security review / notes
  - [ ] read source from github
  - [ ] write file to github

### Maybe Later

- Better error reporting/handling
- Snippet sharing through ipfs (requires server)
- editor in VR
- simple reactive 3d-rendering library
- export of `package.json`, based on current `module.meta.package` content.
- security review of event handling, and add policy, - before events connected to cloud.
- events to any process, - not just in current browser
- sync/restore app-db to disk
- only send changes
- cross-thread event dispatch through transferables instead of json, for performance.
- Share app on social media
- Markdown support. Toggle between document, and literate code in editor.
- Share: persistent url to current code (without login).
- ClojureScript, C/C++, and OpenCL support.
- Optionally only run edited code on 'play', choose where to run the code (`webworker`, `main thread`, `serviceworker`, `browser-addon`, ...)
- LightScript support
- only allow export on GPL/MIT-projects
- JODOM - Jsonml Objects to DOM - render jsonml/appdb to DOM + dispatch events from dom
- JODOM (Rudimentary unoptimised implementation)
  - [x] Convert JsonML to DOM
  - [ ] `style(name, obj)` css by class
  - [ ] auto-append `px` to numeric values
  - [ ] `"div.class"` syntax
  - [ ] convert `on*` parameters to be emit events
  - [ ] support custom elements, ie: './ui.js:toggle' - 

## Application design

- About - information about project, getting started, examples, pricing, ... github-issues for project.
- Read - document rendered from literate source code for the current app
- Edit - live editing of code
- App - run the current app
- Share(+settings) - buttons to share the current app on social media etc.
- (Login)

## License

This software is copyrighted solsort.com ApS, and available under GPLv3, as well as proprietary license upon request.

Versions older than 10 years also fall into the public domain.

## Non-code Roadmap.

- Growth
  - Workshops
    - HTML5/App development (non-technical: personal network, coworking spaces)
    - Library-apps (library-networks, IVA?)
    - Live HTML5/App prototyping (technical: @home-hackathon, cphjs, cph-frontend, ...)
    - Local teaching
  - Apps shared within dev environment
  - Announce on various social medias
  - Video tutorials about using app-edit / developing with javascript
- Business model
  - Dual-license infrastructure library: GPL/commercial
  - Paid workshops
  - Subscriptions:
    - Free Trial - only github-export to public GPL/MIT-licensed projects, and no config.xml for building cordova apps
    - Personal - for non-commercial projects only, allows you to export to private github projects, and with config.xml for phonegap build. Includes infrastructure non-GPL-license.
    - Professional - for commercial projects, includes infrastructure non-GPL-license.
  - Maybe 50% subscription fee back to community/growth: bug bounties, (recursive) referral (for example identify via coupon for first month free, limit such as 100), competition-prices, contributor-prizes, ...
# Dependencies
    
    var da = require('direape@0.1');
    var slice = (a, start, end) => Array.prototype.slice.call(a, start, end);
    
# UI

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
    
# Read

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
    
# App

    function app() {
      document.getElementById('app').innerHTML = 'Starting app...';
      da.handle('appedit:html', (html) => {
        document.getElementById('app').innerHTML = 
          '<div id=appedit-content class=main></div>';
        document.getElementById('appedit-content').innerHTML = html;
      });
    }
    
# Share

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
    
# Editor

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
          'style="bottom:55%;outline:1px solid black"></div>';
      } else {
        document.getElementById('app').innerHTML =
          '<div id=appedit-code class=main style=right:50%></div>' +
          '<div id=appedit-content class=main ' +
          'style="left:50%;outline:1px solid black"></div>';
      }
    
      var codemirrorStyle = {
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%'
      };
    
      if(true || !localStorage.getItem('appeditContent')) {
        localStorage.setItem('appeditContent', 
            "// # Sample app \n//\n" +
            "// This is a bit of documentation, try 'Read' above. " +
            "Code can be written as semi-literate code, see more here " +
            "<https://en.wikipedia.org/wiki/Literate_programming>\n\n" +
            "module.meta = {\n" +
            "  name: 'sample-app'\n" +
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
            "`);" );
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
    
      da.handle('appedit:html', (html) => {
        document.getElementById('appedit-content').innerHTML = html;
      });
      setTimeout(createCodeMirror, 0);
      window.onresize = edit;
    }
    
# Webworker setup
    
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
        workerExec(localStorage.getItem("appeditContent"));
      });
    }
    newWorker();
    function workerExec(str) {
      workerPid && da
        .call(workerPid, 'reun:run', str, location.href)
        .then(o =>  console.log('run-result', o));
    }
TODO ping/keepalive
