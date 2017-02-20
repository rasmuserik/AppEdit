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

exports._meta = {
  title: 'AppEdit',
  version: '0.2.0',
  customIndexHtml: true
};

var ss = require('solsort', {version: '0.2'});
var da = require('direape');
da.testSuite('appedit');
da.ready(() => da.runTests('appedit'));

// ## Utilities
//
// TODO move to solsort

ss.bodyElement = (id, type) => {
  type = type || 'div';
  var elem = document.getElementById(id);
  if(!elem) {
    elem = document.createElement(type);
    elem.id = id;
    document.body.appendChild(elem);
  }
  return elem;
};

// ### URI Routing 
ss.ready(() => {

  function stateUrl() {
    var params = [];
    var route = ss.getJS('route');
    for(var k in route) {
      if(route[k] !== undefined) {
        params.push(uriStringify(k) + '=' + uriStringify(route[k]));
      }
    }
    return '?' + params.join('&');
  }

  function uriParse(s) {
    s = decodeURIComponent(s);
    try { s = JSON.parse(s); } catch(_) { true; }
    return s;
  }

  function uriStringify(s) {
    try {
      JSON.parse(s);
      s = JSON.stringify(s);
    } catch(_) { true; }
    return encodeURIComponent(s);
  }

  if(ss.isBrowser()) {
    var search = location.search.slice(1);
    if(search) {
      var route = {};
      search = search.split('&').map(s => s.split('='));
      for(var kv of search) {
        var k = kv[0], v = kv[1];
        route[uriParse(k)] = uriParse(v);
      }
      ss.setJS('route', route);
    }

    ss.rerun('ss:route-url', () => 
        history.replaceState(null, null, 
          location.href.replace(/[?].*.?/, '') + stateUrl()));
  }
});

// ## Error

function error(e) {
  ss.bodyElement('app').innerHTML = `<h1 style=background:red>${e}</h1>`;
}

// ## Routing
//
ss.setJS(['route', 'page'], 'about');
ss.ready(() => ss.rerun('route-log', () => {
  ss.bodyElement('about').style.display = 'none';
  switch(ss.getJS(['route', 'page'])) {
    case 'read':
      read().then(str => ss.bodyElement('app').innerHTML = str);
      break;
    default:
      ss.bodyElement('app').innerHTML = '';
      ss.bodyElement('about').style.display = 'inline';
  }
}));

// ## Read
//
function read() {
  var code = ss.getJS('code') || '';
  return Promise.resolve(ss.eval((r, e, module) => {
    module.exports = markdown2html(js2markdown(code))
  }))
  .then(html => addToc(html));
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
        ss.bodyElement('topbar')));
});

// ## Load from github

ss.ready(() => {
  var repos = ss.getJS(['route', 'github']);
  if(repos) {
    ss.GET(`https://api.github.com/repos/${repos}/contents/${repos.replace(/.*[/]/, '')}.js`)
      .then(o => {
        ss.setJS('code', atob(JSON.parse(o).content));
        localStorage.setItem('appeditContent', ss.getJS('code'));
        ss.setJS(['route', 'github']);
      }).catch(() => {
        error('Error loading "' + repos + '" from GitHub');
      });
  } else {
    ss.setJS('code', localStorage.getItem('appeditContent'));
  }
});

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
