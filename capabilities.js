#!/usr/bin/env node

// Select appropriate capabilities based on configuration settings
// Inject environment variables used for remote sessions

var conf = require('./conf.json');


if (conf['local']) {
  var sessions = conf['local_settings'];
} else {
  var sessions = [];
  var r_sessions = conf['remote_settings'];

  for(i=0; i< r_sessions.length; i++) {
    var session = r_sessions[i];
    session["browserstack.user"] = process.env.BS_NAME || "";
    session["browserstack.key"] = process.env.BS_KEY || "";
    sessions.push(session);
  }
}

module.exports = sessions;
