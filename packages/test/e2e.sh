#!/bin/bash

# VARIABLES
# ==================================================----------------------------------
ROOT=$(pwd);
VERDACCIO_PORT=4873;
LOCAL_REGISTRY_URL="http://localhost:$VERDACCIO_PORT/";
TEST_SERVER_PORT=19999;

echo "ROOT: $ROOT";
echo "LOCAL_REGISTRY_URL: $LOCAL_REGISTRY_URL";


# SETUP LOCAL REGISTRY
# ==================================================----------------------------------
function stopTestServer() {
  PID=$(lsof -t -i:$TEST_SERVER_PORT); # kill test server
  if [[ $PID =~ ^[0-9]+$ ]] ; then
    kill -9 "$PID";
  fi
}

function stopLocalRegistry {
  PID=$(lsof -t -i:$VERDACCIO_PORT); # kill verdaccio
  if [[ $PID =~ ^[0-9]+$ ]] ; then
    kill -9 "$PID";
  fi
  rm -rf "$ROOT/test/storage"; # clean verdaccio storage
}

function cleanup {
  stopLocalRegistry;
  stopTestServer;
}

function handleError {
  echo "$(basename "$0"): ERROR! An error was encountered executing line $1." 1>&2;
  echo 'Exiting with error.' 1>&2;
  cleanup;
  exit 1;
}

function handleExit {
  echo 'Exiting without error.' 1>&2;
  cleanup;
  exit;
}

trap 'handleError $LINE0 $BASH_COMMAND' ERR;
trap 'handleExit' SIGQUIT SIGTERM SIGINT SIGHUP;

if [[ -d "$ROOT/test/storage" ]]; then
  tree "$ROOT/test/storage";
  rm -rf "$ROOT/test/storage";
fi;

VERDACCIO_REGISTRY_LOG=$(mktemp);
echo "VERDACCIO_REGISTRY_LOG: $VERDACCIO_REGISTRY_LOG";

(npx verdaccio@latest --config "$ROOT/test/verdaccio.yaml" --listen $VERDACCIO_PORT &>"$VERDACCIO_REGISTRY_LOG" &); # start verdaccio with log
grep -q 'http address' <(tail -f "$VERDACCIO_REGISTRY_LOG"); # wating verdaccio


# LOCAL PUBLISH
# ==================================================----------------------------------
for dir in "$ROOT/out/packages"/*/; do
  echo "//localhost:$VERDACCIO_PORT/:_authToken=ANONYMOUS_TOKEN_STRING" > "$dir/.npmrc";
done

echo "PUNCH: $(which rocket-punch)";
npx rocket-punch publish --skip-selection --tag e2e --registry "$LOCAL_REGISTRY_URL";

# TEST
# ==================================================----------------------------------
function fileExists() {
  if ! ls "$1" 1> /dev/null 2>&1; then
    echo "ERROR: Undefined the file $1";
    handleError 0;
  fi
}

function is200() {
  STATUS=$(curl -o /dev/null -w "%{http_code}" "$1");

  if [[ $STATUS -ne 200 ]]; then
    echo "ERROR: the http status of $1 is not the 200 $STATUS";
    handleError;
  fi
}

function createTmpFixture() {
  TEMP=$(mktemp -d);
  cp -rv "$ROOT/test/fixtures/$1"/* "$TEMP" > /dev/null;
  cp -rv "$ROOT/test/fixtures/$1"/.[^.]* "$TEMP" > /dev/null;
  cd "$TEMP" || exit 1;
  echo "FIXTURE: $1"
  echo "TEMP: $TEMP";
  echo "PWD: $(pwd)";
  yarn install --registry "$LOCAL_REGISTRY_URL" > /dev/null;
}

## webpack-dev-server
#
#createTmpFixture webpack-dev-server/basic;
#yarn add @ssen/webpack-dev-server@e2e --dev --registry "$LOCAL_REGISTRY_URL" > /dev/null;
#(PORT=$TEST_SERVER_PORT yarn run start &> log.txt &);
#sleep 15s;
#is200 "http://localhost:$TEST_SERVER_PORT";
#stopTestServer;
#
## web
#
#createTmpFixture web/start;
#yarn add @rocket-scripts/web@e2e --dev --registry "$LOCAL_REGISTRY_URL" > /dev/null;
#
#(PORT=$TEST_SERVER_PORT yarn run start &> log.txt &);
#sleep 15s;
#is200 "http://localhost:$TEST_SERVER_PORT";
#is200 "http://localhost:$TEST_SERVER_PORT/manifest.json";
#is200 "http://localhost:$TEST_SERVER_PORT/favicon.ico";
#stopTestServer;
#
#yarn run build;
#fileExists "$TEMP"/out/app/manifest.json;
#fileExists "$TEMP"/out/app/size-report.html;
#fileExists "$TEMP"/out/app/favicon.ico;
#fileExists "$TEMP"/out/app/index.html;
#fileExists "$TEMP"/out/app/index.*.js;
#fileExists "$TEMP"/out/app/vendor.*.js;
#
#
#createTmpFixture web/worker;
#yarn add @rocket-scripts/web@e2e --dev --registry "$LOCAL_REGISTRY_URL" > /dev/null;
#
#yarn run build;
#fileExists "$TEMP"/out/app/manifest.json;
#fileExists "$TEMP"/out/app/size-report.html;
#fileExists "$TEMP"/out/app/favicon.ico;
#fileExists "$TEMP"/out/app/index.html;
#fileExists "$TEMP"/out/app/index.*.js;
#fileExists "$TEMP"/out/app/vendor.*.js;
#fileExists "$TEMP"/out/app/*.worker.js;
#
#
#createTmpFixture web/webpack-config;
#yarn add @rocket-scripts/web@e2e --dev --registry "$LOCAL_REGISTRY_URL" > /dev/null;
#
#(PORT=$TEST_SERVER_PORT yarn run start &> log.txt &);
#sleep 15s;
#is200 "http://localhost:$TEST_SERVER_PORT";
#is200 "http://localhost:$TEST_SERVER_PORT/manifest.json";
#is200 "http://localhost:$TEST_SERVER_PORT/favicon.ico";
#stopTestServer;
#
#yarn run build;
#fileExists "$TEMP"/out/app/manifest.json;
#fileExists "$TEMP"/out/app/size-report.html;
#fileExists "$TEMP"/out/app/favicon.ico;
#fileExists "$TEMP"/out/app/index.*.js;
#fileExists "$TEMP"/out/app/index.html;
#
#
#createTmpFixture web/static-file-directories;
#yarn add @rocket-scripts/web@e2e --dev --registry "$LOCAL_REGISTRY_URL" > /dev/null;
#
#(PORT=$TEST_SERVER_PORT yarn run start &> log.txt &);
#sleep 15s;
#is200 "http://localhost:$TEST_SERVER_PORT";
#is200 "http://localhost:$TEST_SERVER_PORT/manifest.json";
#is200 "http://localhost:$TEST_SERVER_PORT/favicon.ico";
#is200 "http://localhost:$TEST_SERVER_PORT/hello.json";
#stopTestServer;
#
#yarn run build;
#fileExists "$TEMP"/out/app/manifest.json;
#fileExists "$TEMP"/out/app/size-report.html;
#fileExists "$TEMP"/out/app/favicon.ico;
#fileExists "$TEMP"/out/app/index.*.js;
#fileExists "$TEMP"/out/app/index.html;
#fileExists "$TEMP"/out/app/hello.json;
#
#
#createTmpFixture web/proxy;
#yarn add @rocket-scripts/web@e2e --dev --registry "$LOCAL_REGISTRY_URL" > /dev/null;
#
#(PORT=$TEST_SERVER_PORT yarn run start &> log.txt &);
#sleep 15s;
#is200 "http://localhost:$TEST_SERVER_PORT";
#is200 "http://localhost:$TEST_SERVER_PORT/manifest.json";
#is200 "http://localhost:$TEST_SERVER_PORT/favicon.ico";
#is200 "http://localhost:$TEST_SERVER_PORT/api/assets/book-opened.svg";
#stopTestServer;
#
## TODO out-dir

# EXIT
# ==================================================----------------------------------
cleanup;