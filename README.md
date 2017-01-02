# AppEdit

This is a code editor, where the edited code is executed live in a web worker. 
It is intended for teaching, and quickly making small HTML5/App prototypes.

# Literate source code

Below is the actual source code for the application.

## App state / initialisation

    var state = self.appeditState;
    if(!state) {
      state = self.appeditState = {};
      createCodeMirror();
    }

## Util

### Dependencies

    var URL = self.URL || self.webkitURL;
    var Worker = self.Worker;

### Convert jsonml to dom

    function jsonml2dom(o) { 
      if(typeof o === 'string') {
        return document.createTextNode(o);
      } else if(Array.isArray(o)) {
        var node = document.createElement(o[0]);
        var tagtype = o[0];
        var params = o[1];
        var firstChild;
        if(typeof params === 'object' && params.constructor === Object) {
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

## UI - Code editor

    function createCodeMirror() {
      state.codemirror = self.CodeMirror(
          function(cmElement) {
            cmElement.id = "codemirror";
            Object.assign(cmElement.style,
                {position: "absolute",
                top: 0,
                left: 0,
                width: "50%",
                outline: "1px solid black",
                height: "100%" });
            document.body.appendChild(cmElement);
          },
          {
        mode: 'javascript',
        lineWrapping: true,
        lineNumbers: true,
        value: localStorage.getItem('appeditContent') || 'console.log(\'hello world\');'
      });
      state.codemirror.on('change', function(o) { state.onsourcechange(o); });
    }

## WebWorker

### Initial worker code

    /* jshint ignore:start */
    var workerCodeUrl = URL.createObjectURL(new Blob([`
    console.log('hi from worker', self.events);
    
    var events = {};
    self.setHandler = function(e, f) { events[e] = f; }
    self.onmessage = function(e) {
      var handler = events.eventError;
      if(typeof e === "object" && events[e.type]) {
        handler = events[e.type];
      } 
      // TODO handle binary data
      handler(e);
    }
    setHandler('eval', o => eval(o.code));
    setHandler('eventError', o => console.log('Unhandled event: ', event));
    `]));
    /* jshint ignore:end */

### Initialisation functions.

    function newWorker() {
      if(state.worker) {
        state.worker.terminate();
      }
      state.worker = new Worker(workerCodeUrl);
    }
    newWorker();
    
    function exec(o) {
      var url = stringToObjectUrl(o);
      URL.revokeObjectURL(url);
    }

## onchange

    state.onsourcechange = function(o) {
      var content = o.getValue();
      localStorage.setItem("appeditContent", content);
      exec(content);
    };
