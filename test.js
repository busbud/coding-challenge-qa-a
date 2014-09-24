var assert    = require('assert');
var fs        = require('fs');

var async     = require('async');
var colors    = require('colors');

var session   = require(__dirname + '/capabilities.js');
var webdriver = require(__dirname + '/driver.js');
var conf      = require(__dirname + '/conf.json');
var locations = require(__dirname + '/locations.json');


// Imported server config
var host    = conf.host || 'http://busbud.com';
var server  = conf.remote_server;
var SCHEDULES_URL = conf.schedule_url;

// Timeouts
var START_TIMEOUT = 20000;
var TEST_TIMEOUT  = 30000;
var STOP_TIMEOUT  = 5000;

// Schedules, Date & Time
var d       = new Date;
var year    = d.getFullYear();
var month   = d.getMonth() + 1;
var day     = d.getDate();
var MONTH   = [year, month].join('-');
var TODAY   = [year, month, day].join('-')
var TMRW    = [year, month, day + 1].join('-')

// Common Functions
function strEndsWith(str, suffix) {
  return str.toLowerCase().slice(-suffix.toLowerCase().length) === suffix.toLowerCase();
}
function callback(stream) {
  console.log("Exiting.")
}


// Kill webdriver on force quit (*NIX Only)
process.on('SIGINT', function(callback) {
  console.error('\nCaught Unexpected Interrupt Signal. Force Quitting...\n'.red);
  if (driver) { driver.quit() }
  process.exit();
});

// Catch exceptions and attempt a screenshot
process.on('uncaughtException', function(err, callback) {
  console.error('\n\tError... '.red + err);

  if (driver) {
    driver.takeScreenshot().then(function(screenshot) {
      var browser   = session.browserName || "";
      var version   = session.browser_version || "";
      var filepath  = './error/screens/';
      var filename  = browser + version + (new Date).toISOString() + '.png';
      fs.writeFileSync(filepath + filename, new Buffer(screenshot, 'base64'));
    });
  }
});


before(function(done) {
  this.timeout(START_TIMEOUT);

  if (conf['local']) {
    driver = new webdriver.Builder()
      .withCapabilities(session)
      .build();
  } else {
    driver = new webdriver.Builder()
      .usingServer(server)
      .withCapabilities(session)
      .build();
  }
  driver.get(host).then(function() {
    console.log('Configuring Test Environment. Navigating to: ' + host.yellow +
                  '\n' + 'Using the following settings: ' + '%j'.yellow, session);
  }).then(done);
});


// Test Cases
describe('Routes', function() {

  it('should not contain trip durations in complicated fractions of hours', function(done) {
    this.timeout(TEST_TIMEOUT);

    var TRIP = SCHEDULES_URL + locations["TOR"] + '/' + locations["MTL"] + '#date=';

    driver.get(TRIP + TMRW);
    driver.findElements(webdriver.By.className('duration')).then(function(durations) {
      async.forEach(durations, function(duration, step) {

        duration.isDisplayed().then(function() {
          return duration.getAttribute('innerHTML');
        }).then(function(duration_text) {
          var dot_location = duration_text.indexOf('.');
          var next_character = duration_text.substring(dot_location + 1, dot_location + 2);
          if (dot_location !== -1) {
            assert.equal(next_character, "5", '"' + duration_text + '"' +
                          ' contained a fraction that 60 minutes is not divisible by');
          }
          step();
        });
      });
    }).then(done);
  });

  it('should not render destination names with unexpected characters', function(done) {
    this.timeout(TEST_TIMEOUT);

    var TRIP = SCHEDULES_URL + locations['PRA'] + '/' + locations['MUN'] + '#date=';

    driver.get(TRIP + TMRW);
    driver.findElements(webdriver.By.className('location')).then(function(locations) {
      async.forEach(locations, function(loc, step) {

        loc.isDisplayed().then(function() {
          return loc.getAttribute('innerHTML');
        }).then(function(location_text) {
          var underscore_location = location_text.indexOf('_');
          assert.equal(underscore_location, -1, '"' + location_text + '"' +
                          ' had one or more unexpected _ characters');
          step();
        });
      });
    }).then(done);
  });

  it('destinations should not end with a period', function(done) {
    this.timeout(TEST_TIMEOUT);

    var TRIP = SCHEDULES_URL + locations['WASH'] + '/' + locations['NYC'] + '#date=';

    driver.get(TRIP + TMRW);
    driver.findElements(webdriver.By.className('location')).then(function(locations) {
      async.forEach(locations, function(loc, step) {

        loc.isDisplayed().then(function() {
          return loc.getAttribute('innerHTML');
        }).then(function(location_text) {
          var loc_length = location_text.length;
          var last_character = location_text.substring(loc_length - 1);
          if (!(strEndsWith(location_text, ' st.') || (strEndsWith(location_text, ' ave.')))) {
            assert.notEqual(last_character, '.', '"' + location_text + '"' +
                              ' ended in an unexpected period');
          }
          step();
        });
      });
    }).then(done);
  });

});

after(function(done) {
  this.timeout(STOP_TIMEOUT);
  process.removeListener('SIGINT', callback);
  process.removeListener('uncaughtException', callback);
  driver.quit().then(done);
});
