# JS▶ &nbsp; _AppEdit_

This is a code editor, where the edited code is executed live in a web worker. It is intended for teaching, and quickly making small HTML5/App prototypes.

    TODO: animated gif example here.

You can try it live at https://appedit.solsort.com/.

Current features:

- Code editing with live execution in WebWorker


## Roadmap / intended features

- Now: make it usable as dev environment for myself
  - Enable working with files on GitHub. 
  - Good keybindings: VIM++
  - JavaScript and Markdown support
- Later
  - ClojureScript, C/C++, and opencl support


## Parts/modules

The code is / will become split up in different parts:

- Weare - Web app require - require/module-loader through unpkg
- Draf - distributed reactive app framework: appdb + event dispatch
- JsonML-dom: render jsonml/appdb to DOM + dispatch events from dom
- CodeMirror tweaks: options for vim, custom folding, enable jshint, keybinding for switching between code/doc, etc.
- Error reporting/handling
- GitHub-import/export (requires light server)
- Snippet sharing through ipfs (requires server)
- Literate javascript rendering through markdown

When AppEdit supports export of npm-modules, these parts will probably be separated out as independent npm modules. Until then, they will live within this repository.

### Draf

This is the underlying app-architecture for AppEditor, as well as most apps made with it.

Every process has:

- `pid` - process uuid
- `db` - local cache of distributed db. Reactive atom with immutable JSON-like data structure, - can only be altered through events.
  - `db[pid]` - application local data
- events:
  - `{type: string, src: pid, dst: pid, data:...}`


- NB: evt. https://github.com/tc39/proposal-observable
- NB: CBOR, cbor-js

The building stone for building distributed applications

- event loop/handling
- persistent
- transferable

## UI

- About - information about project, getting started, examples, pricing, ... github-issues for project.
- Read - document rendered from literate source code for the current app
- Edit - live editing of code
- App - run the current app
- Share(+settings) - buttons to share the current app on social media etc.
- (Login)

## Non-code Roadmap.


- PR
  - Workshops
    - HTML5/App development (non-technical: personal network, coworking spaces)
    - Library-apps (library-networks, IVA?)
    - Live HTML5/App prototyping (technical: @home-hackathon, cphjs, cph-frontend, ...)
  - Apps shared within dev environment
  - Announce on various social medias
- Business model to get 
  - Dual-license infrastructure library: GPL/commercial
  - Paid workshops
  - Subscriptions:
    - Free Trial - only github-export to public GPL/MIT-licensed projects, and no config.xml for building cordova apps
    - Personal - for non-commercial projects only, allows you to export to private github projects, and with config.xml for phonegap build. Includes infrastructure non-GPL-license.
    - Professional - for commercial projects, includes infrastructure non-GPL-license.

