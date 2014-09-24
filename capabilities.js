// Select appropriate capabilities based on configuration settings
// Inject environment variables used for remote sessions

var conf = require('./conf.json');

var session = [];

if (conf['local']) {
  session = conf.local_settings[conf.local_index];
} else {
  session = conf.remote_settings[conf.remote_index];
  session["browserstack.user"]  = process.env.BS_NAME || "";
  session["browserstack.key"]   = process.env.BS_KEY || "";
  /*
  conf.remote_settings.forEach(function(session) {
    session["browserstack.user"]  = process.env.BS_NAME || "";
    session["browserstack.key"]   = process.env.BS_KEY || "";
    sessions.push(session);
  });*/
}

module.exports = session;
