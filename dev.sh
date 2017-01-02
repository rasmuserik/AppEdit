if [ ! -e node_modules/.bin/live-server ]; then npm install live-server; fi
cat appedit.js  | sed -e 's/^/    /' | sed -e 's/^    \/\/\( \|\)//' > README.md ;
./node_modules/.bin/jshint appedit.js ;
./node_modules/.bin/live-server --no-browser;
