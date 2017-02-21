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
// [Roadmap](https://github.com/solsort/AppEdit/milestones?direction=asc&sort=due_date) and [feedback/suggestions](https://github.com/solsort/AppEdit/issues/new) via github issues.
//
// ## Dependencies:

exports.info = {
  title: 'AppEdit',
  version: '0.2.0',
  customIndexHtml: true
};

var ss = require('solsort', {version: '0.2'});
var da = require('direape');
da.testSuite('appedit');
da.ready(() => da.runTests('appedit'));

// ## Main

function main() {
  // TODO: move all state into ss.set/get

  uiReset();

  switch(ss.getJS(['route', 'page'])) {
    case 'read':
      read();
      break;
    case 'edit':
      ss.eval(edit);
      break;
    case 'app':
      app();
      break;
    case 'share':
      share();
      break;
    default:
      about();
  }
}

// ### UI Reset

function uiReset() {
  ss.bodyElem('appedit-help').style.display = 'none';
  ss.bodyElem('codemirror-container').style.display = 'none';
  ss.bodyElem('appedit-main-app').style.left = 0;
  ss.bodyElem('appedit-main-app').innerHTML = '';

}

// ## About

var aboutElem;
da.ready(() => {
  aboutElem = document.getElementById('about');
  aboutElem.remove();
});

function about() {
  ss.bodyElem('appedit-main-app').appendChild(aboutElem);

  var example = type => (name => 
      ['a.example-link', 
      { href: `?page=${type}&github=solsort/${name}` },
      ['img', {src: `https://github.com/solsort/${name}/raw/master/icon.png`}]]);

  ss.renderJsonml(['div',
      ['h3', 'Demos / tutorials'],
      ['div'].concat(['tutorial'].map(example('edit'))),
      ['h3', 'Function libraries'],
      ['div'].concat(['solsort', 'fri', 'direape', 'reun'].map(example('read'))),
      ['h3', 'Major Applications'],
      example('read')('appedit'),
  ], document.getElementById('appedit-examples'));

}

// ## Read
//
function read() {
  var code = ss.getJS('code') || '';
  return Promise.resolve(ss.eval((r, e, module) => 
        module.exports = markdown2html(js2markdown(code))))
    .then(html => addToc(html))
    .then(str => ss.bodyElem('appedit-main-app').innerHTML = str);
}

function js2markdown(src) {
  return ('\n'+src).replace(/\n/g, '\n    ').replace(/\n *[/][/] ?/g, '\n');
}

function markdown2html(markdown) {
  return (new (require('showdown@1.6.0')).Converter())
    .makeHtml(markdown);
}

function addToc(html) {
  var str = '';
  !html.replace(
      /<[hH]([123456])[^>]*?id="?([^> "]*)[^>]*>(.*)<[/][hH][123456]/g,
  function(_, level, hash, title) {
    for(var i = 1; i < level; ++i) {
      str += '&nbsp;|&nbsp;&nbsp;';
    }
    str += '<a href="#' + hash + '">' + title + '</a><br>';
  });
  return html.replace('</h1>',
      '</h1><div class=table-of-contents><strong>Table of contents:</strong><br><br>' + str + '</div><br>' );
}



// ## Edit

// ### edit

function edit() {

  ss.bodyElem('appedit-main-app').style.left = '60%';
  app();

  ss.bodyElem('codemirror-container').style.display = 'inline';

  if(ss.getJS(['ui', 'show-help'])) {
    ss.bodyElem('appedit-help').style.display = 'inline';
  }

  if(codemirror()) {
    codemirror().focus();
  } else {
    ss.eval(createCodeMirror);
  }
}

// ### createCodeMirror

var _codemirror;

function codemirror() {
  return _codemirror;
}

function createCodeMirror() {
  var container = ss.bodyElem('codemirror-container');
  container.innerHTML = '<h1>Loading editor...</h1>';

  ss.loadCss('//unpkg.com/codemirror/lib/codemirror.css');
  ss.loadCss('//unpkg.com/codemirror/addon/lint/lint.css');
  ss.loadCss('//unpkg.com/codemirror/addon/dialog/dialog.css');
  ss.loadCss('//unpkg.com/codemirror/addon/fold/foldgutter.css');
  require('codemirror/lib/codemirror');
  require('codemirror/addon/runmode/runmode.js');
  require('codemirror/addon/runmode/colorize.js');
  require('codemirror/addon/dialog/dialog.js');
  require('codemirror/addon/fold/foldcode.js');
  require('codemirror/addon/fold/foldgutter.js');
  require('codemirror/addon/lint/lint.js');
  require('codemirror/addon/lint/javascript-lint.js');
  require('codemirror/keymap/vim.js');
  require('codemirror/mode/javascript/javascript.js');
  self.JSHINT = require('jshint/dist/jshint.js').JSHINT;
  enableLiterateFolding();

  ss.nextTick(()=> {
    _codemirror = require('codemirror')(
        function(elem) {
          elem.id = 'codemirror';
          container.innerHTML = '';
          container.appendChild(elem);
        },
        {
          mode: 'javascript',
          extraKeys: {
            'Ctrl-E': () => {
              localStorage.setItem('appeditAfterExport', 'Edit');
              location.search = '?Export';
            },
            'Ctrl-S': () => location.search = '?Share',
            'Ctrl-Q': (cm) => cm.foldCode(cm.getCursor()),
            'Ctrl-H': () => 
              ss.setJS(['ui', 'show-help'],
                  !ss.getJS(['ui', 'show-help']))
          },
          lineWrapping: true,
          keyMap: ss.getJS(['settings', 'vim']) ? 'vim' : 'default',
          lineNumbers: true,
          foldGutter: true,
          gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers',
          'CodeMirror-foldgutter'],
          lint: {esversion: 6},
          value: ss.getJS('code')
        });
    codemirror().on('changes', function(o) {
      var content = o.getValue();
      ss.setJS('code', content);
    });
    codemirror().focus();
  });

  // ### Custom folding

  function enableLiterateFolding() {
    var CodeMirror = require('codemirror');
    /* TODO: refactor: javascript-mode should have configurable fold-method, 
     * and this shouldn't be called 'brace' */
    CodeMirror.registerHelper('fold', 'brace', function(cm, start) {
      var level, end, maxDepth = 100, firstLine = cm.getLine(start.line), lastLine = cm.lastLine();

      function headerLevel(line) {
        if (!line) return maxDepth;
        var match = line.match(/[/][/] #+/);
        return match ? match[0].length - 3 : maxDepth;
      }

      level = headerLevel(firstLine);
      if (level === maxDepth) return undefined;

      for (end = start.line + 1; end < lastLine; ++end) {
        if (headerLevel(cm.getLine(end + 1)) <= level) {
          break;
        }
      }

      return {
        from: CodeMirror.Pos(start.line, cm.getLine(start.line).length),
        to: CodeMirror.Pos(end, cm.getLine(end).length)
      };
    });
  }
}


// ### Styling

ss.ready(() => ss.loadStyle('codemirror',{
  '#codemirror-container': {
    marginTop: 0,
    position: 'absolute',
    display: 'inline-block',
    top: 36, left: 0, right: '40%', bottom: 0,
  },
  '#codemirror': {
    height: '100%'
  }

}));


// ### Help popup / vim mode

ss.ready(() => {

  // Close help on click

  ss.bodyElem('appedit-help').onclick = () => {
    ss.setJS(['ui', 'show-help'], false);
    codemirror().focus();
  };

  // Vim-mode button toggles state

  ss.bodyElem('appedit-vim-mode').onclick = (e) => {
    ss.setJS(['settings', 'vim'],
        !ss.getJS(['settings', 'vim']));
    e.stopPropagation();
    localStorage.setItem('appeditSettings', 
        JSON.stringify(ss.getJS('settings')));
    codemirror().focus();
  };

  // Change of `'settings.vim'` enables vim-mode

  ss.rerun('appedit:vim', () => {
    var enabled = ss.getJS(['settings', 'vim']);
    document.getElementById('appedit-vim-checkbox').checked = enabled;
    if(codemirror()) {
      codemirror().setOption('keyMap', enabled ? 'vim' : 'default');
    }
    document.getElementById('appedit-vim-help').style.display =
      enabled ? 'inline' : 'none';

  });
});

// ## App

var child, runningApp, rerunApp;

function app() {
  ss.bodyElem('appedit-main-app').innerHTML = '<div id=solsort-ui></div>';
  ss.nextTick(() => ss.rerun('appedit:app', appProcess));
}

function appProcess() {
  var code = ss.getJS('code');

  if(runningApp) {
    rerunApp = true;
    return;
  }
  runningApp = true;
  rerunApp = false;

  if(!child) {
    Promise.resolve(ss.spawn())
      .then(childPid => {
        child = childPid;
        ss.call(child, 'reun:eval', 'require("solsort")')
          .then(() => ss.call(child, 'fri:subscribe', ss.pid, 'fri:set', ['ui', 'html']))
          .then(() => runningApp = false)
          .then(() => appProcess());
      });
    return;
  }

  Promise.resolve(ss.call(child, 'reun:eval', code))
    .then(result => console.log('child-result:', result))
    .then(() => runningApp = false)
    .then(() => rerunApp && appProcess());

}



// ## Share
//
var shareElem;
da.ready(() => {
  shareElem = document.getElementById('share');
  shareElem.remove();
});
function share() {
  ss.bodyElem('appedit-main-app').appendChild(shareElem);
  ss.ajax('https://code-storage.solsort.com/', {data: ss.getJS('code')})
    .then(id => {
      ss.renderJsonml(['a', 
          {href: `https://appedit.solsort.com/?page=read&sourceHash=${id}`},
          id], document.getElementById('appedit-share-buttons'));
    });
}
// ## Navigation bar

ss.ready(() => {
  ss.loadStyle('nav-bar-css', {
    '#topbar': {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: '100',
      height: 36,
      background: '#345',
    },
    '#topbar img': {
      width: 36
    },
    '#topbar a': {
      display: 'inline-block',
      verticalAlign: 'top',
      height: 20,
      padding: '9px 10px 7px 10px',
      color: '#fff',
      textDecoration: 'none',
      fontSize: 16,
    },
    '#topbar .selected': {
      background: '#123',
    }
  });

  ss.handle('navigate', (_, page) => ss.setJS(['route', 'page'], page));

  var link = (name) => ['a', { href: '#',
    onClick: 
      ss.event('navigate', {preventDefault:true,data:name.toLowerCase()}),
    class: name.toLowerCase() === ss.getJS(['route', 'page']) 
           ? 'selected' : '',
  }, name];

  ss.rerun('topbar', () =>
      ss.renderJsonml(['nav', ['img', {src: 'icon.png'}]].concat(
          ['About', 'Read', 'Edit', 'App', 'Share'].map(link)),
        ss.bodyElem('topbar')));
});

// ## Initialisation
//
// ### Initialisation

ss.setJS(['route', 'page'], 'about');

ss.ready(() => {
  loadSourceCode();

  ss.setJS('settings', JSON.parse(localStorage.getItem('appeditSettings')));

  ss.loadStyle('main-style',{
    '#appedit-main-app': {
      display: 'inline-block',
      position: 'absolute',
      top: 36, left: 0, right: 0, bottom: 0,
      overflow: 'auto',
    }
  });

  ss.bodyElem('loading').style.display = 'none';
  da.ready(() => ss.rerun('route', main));

});

// ### Source code loading

function loadSourceCode() {
  var repos = ss.getJS(['route', 'github']);
  var sourceHash = ss.getJS(['route', 'sourceHash']);
  ss.setJS(['route', 'sourceHash']);
  ss.setJS(['route', 'github']);

  if(sourceHash) {
    ss.GET('https://code-storage.solsort.com/' + sourceHash)
      .then(o => {
        ss.setJS('code', o);
        localStorage.setItem('appeditContent', ss.getJS('code'));
      }).catch(loadError);
  } else if(repos) {
    ss.GET(`https://api.github.com/repos/${repos}/contents/${repos.replace(/.*[/]/, '')}.js`)
      .then(o => {
        ss.setJS('code', atob(JSON.parse(o).content));
        localStorage.setItem('appeditContent', ss.getJS('code'));
      }).catch(loadError);
  } else {
    ss.setJS('code', localStorage.getItem('appeditContent'));
    if(!ss.getJS('code')) {
      ss.setJS('// Loading...');
      ss.setJS(['route', 'github'], 'solsort/tutorial');
      loadSourceCode();
    }
  }
  if(!ss.getJS()) {
    ss.setJS('');
  }
}

function loadError() {
  console.log('here');
  ss.setJS('code', 
      '//\ # Load Error\n' +
      '//\n// Could not load the file.\n\n' +
      'var ss = require(\'solsort\');\n\n' +
      'ss.html(() => [\'div\',\n' +
        '  [\'h1\', \'Load Error\'],\n' +
        '  \'Could not load the file.\'\n]);\n');
}

// ## Non-code Roadmap.
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
// ## License
//
// This software is copyrighted solsort.com ApS, and available under GPLv3, as well as proprietary license upon request.
//
// Versions older than 10 years also fall into the public domain.
//
