function rawgit(path) {
  url = 'https://raw.githubusercontent.com/' + path;
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4) {
        if(typeof xhr.responseText === 'string') {
          resolve(xhr.responseText);
        } else {
          reject(xhr);
        }
      }
    }
    xhr.send();
  });
}
