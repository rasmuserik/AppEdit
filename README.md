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
