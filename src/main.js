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
