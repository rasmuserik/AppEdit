# JS▶ &nbsp; _AppEdit_

This is a code editor, where the edited code is executed live in a web worker. It is intended for teaching, and quickly making small HTML5/App prototypes.

    TODO: animated gif example here.

You can try it live at https://appedit.solsort.com/.

Features:

- Code editing with live execution in WebWorker


## Roadmap / intended features

### Milestone 1: make it usable as dev environment for myself

- WEARE (Rudimentary unoptimised implementation)
  - [ ] Just `require()` module, and it will load via unpkg or local.
- DRAF (Rudimentary unoptimised implementation)
  - [ ] `pid`: process uuid
  - [ ] DB: immutable atom, - `{proc-uuid: {..process data}, ..}`
  - [ ] `handleEvent(type, (event, db) => db)`.
  - [ ] Propagation of events between workers
  - [ ] db-access functions - `get([local-path], default)`, `world([global-path], default-value)`, - returns immutable-like value, with `toJS()`
  - [ ] `dispatch(event)`
  - [ ] `reaction(name, () => ())`, - automatically reruns, when (relevant parts of) db has changed.
  - [ ] subscriptions of parts of DB between threads + unsubscribe
- JODOM (Rudimentary unoptimised implementation)
  - [ ] Convert JsonML to DOM
  - [ ] auto-append `px` to pixel values
  - [ ] convert `on*` parameters to be emitte events
  - [ ] support custom elements, ie: './ui.js:toggle'
- UI
  - [ ] custom element: `./ui.js:markdown`
  - [ ] custom element: `./ui.js:toggle`
- CodeMirror tweaks. (not jodom yet)
  - [ ] Get CodeMirror working
  - [ ] run in separate file, only load code-mirror when editor is open
  - [ ] VIM mode
- AppEdit
  - [ ] routing based on search-url
  - [ ] webworker start/keep-alive
  - [ ] About: Initial version of about-text, rendered as html
  - [ ] Read: convert literate source to markdown, and render
  - [ ] Edit: Live execution of code in webworker
  - [ ] App: run the app in full window
  - [ ] Share: settings + save to github
  - [ ] Editor: codemirror + live execution in webworker
- GitHub 
  - [ ] github login service - mubackend security review / notes
  - [ ] read source from github
  - [ ] write file to github

### Later

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


## Parts/modules

The code is / will become split up in different parts:

- Weare - Web app require - require/module-loader through unpkg
- Draf - distributed reactive app framework: appdb + event dispatch
- Jodom - JsonML-dom: render jsonml/appdb to DOM + dispatch events from dom
- UI - ui-widgets
- CodeMirror-tweaks: options for vim, custom folding, enable jshint, keybinding for switching between code/doc, etc.
- Error reporting/handling
- GitHub-import/export (requires light server)
- Snippet sharing through ipfs (requires server)

When AppEdit supports export of npm-modules, these parts will probably be separated out as independent npm modules. Until then, they will live within this repository.

### Draf

This is the underlying app-architecture for AppEditor, as well as most apps made with it.

Every process has:

- `pid` - process uuid
- `db` - local cache of distributed db. Reactive atom with immutable JSON-like data structure, - can only be altered through events.
  - `db[pid]` - application local data
- events:
  - `{type: string, dst: pid, data:...}` (optional `src:`, added later)


- NB: evt. https://github.com/tc39/proposal-observable
- NB: CBOR, cbor-js

The building stone for building distributed applications

- event handling/queue
- persistent
- transferable

## UI

- About - information about project, getting started, examples, pricing, ... github-issues for project.
- Read - document rendered from literate source code for the current app
- Edit - live editing of code
- App - run the current app
- Share(+settings) - buttons to share the current app on social media etc.
- (Login)

## License

The software is copyrighted solsort.com ApS, and available under GPLv3, as well as proprietary license upon request.

Versions older than 10 years also fall into the public domain.

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

