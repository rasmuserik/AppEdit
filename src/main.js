
function sxml2str(o) {
  if(typeof o === "string") {
    return document.createTextNode(o);
  } else if(Array.isArray(o)) {
    console.log(o[0])
    let node = document.createElement(o[0]);
    let tagtype = o[0];
    let params = o[1];
    let firstChild;
    if(typeof params === "object" && params.constructor === Object) {
      firstChild = 2;
    } else {
      params = {};
      firstChild = 1;
    }
    for(let i = firstChild; i < o.length; ++i) {
      node.appendChild(sxml2str(o[i]));
    }
    return node;
  } else {
    console.log('err', o, typeof o);
    throw "unexpected type of parameter to sxml2str - " + o;
  }
}

console.log('helo', window.y = sxml2str(
      ["div",
      ["div", {id: "a"}, "hello"],
      ["span", "hello"]]
      ));
module.hot && module.hot.accept();

window.x = (window.x || 0) + 1;
console.log('hello', window.x);

window.app.innerHTML="hello " + window.x;

class Str {
  constructor(s) {
    this.val = s;
  }
  toString() {
    return this.val
  }
}
console.log(Str);
