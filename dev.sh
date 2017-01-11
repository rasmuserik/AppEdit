if [ ! -e node_modules/.bin/live-server ]; then npm install live-server jshint; fi
./node_modules/.bin/jshint *.js;
./node_modules/.bin/live-server --no-browser;
