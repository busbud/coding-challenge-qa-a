// Select appropriate capabilities based on configuration settings
// Inject environment variables used for remote sessions

var conf = require('./conf.json');

var sessions = [];

if (conf['local']) {
  sessions = conf.local_settings;
} else {
  //var r_sessions = conf.remote_settings;

  conf.remote_settings.forEach(function(session) {
    //var session = r_session;
    session["browserstack.user"]  = process.env.BS_NAME || "";
    session["browserstack.key"]   = process.env.BS_KEY || "";
    sessions.push(session);
  });
}

module.exports = sessions;
