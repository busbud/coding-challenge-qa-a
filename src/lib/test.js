#!/usr/bin/env node

var assert    = require('assert');
var fs        = require('fs');

var mocha     = require('mocha');
var async     = require('async');
var colors    = require('colors');
var _         = require('lodash'); //not yet used

var conf      = require('../../conf.json');
var locations = require('../../locations.json');

// Choose Local or Remote Webdriver (as per conf config)
if (conf['local']) {
  var webdriver = require('selenium-webdriver');
} else {
  var webdriver = require('browserstack-webdriver');
}

// Imported Variables
var HOST = conf['host'] || 'http://busbud.com';
if (conf['local']) {
  var capabilities = { "browserName": "chrome" };
} else {
  // TODO: Find way to iterate through capabilities (using first index, for now)
  var capabilities = conf['capabilities'][0];
  capabilities["browserstack.user"] = process.env.BS_NAME || "";
  capabilities["browserstack.key"]  = process.env.BS_KEY || "";
}

// Timeouts
var START_TIMEOUT = 20000;
var RUN_TIMEOUT   = 15000;
var STOP_TIMEOUT  = 5000;

// Schedules, Date & Time
var d     = new Date;
var year  = d.getFullYear();
var month = d.getMonth() + 1;
var day   = d.getDate();
var TODAY = year + '-' + month + '-' + day;
var SCHEDULES = "https://secure.busbud.com/en/bus-schedules/";

// Common Functions
function strEndsWith(str, suffix) {
  return str.toLowerCase().match(suffix.toLowerCase()+"$")==suffix.toLowerCase();
}


// Ensure Kill Web Drivers on Force Quit (Mac/Linux Only)
process.on('SIGINT', function() {
  console.log('\nCaught Unexpected Interrupt Signal. Force Quitting...\n'.red);
  driver.quit();
  process.exit();
});


before(function(done) {
  this.timeout(START_TIMEOUT);

  if (conf['local']) {
    driver = new webdriver.Builder()
      .withCapabilities(capabilities)
      .build();
  } else {
    driver = new webdriver.Builder()
      .usingServer('http://hub.browserstack.com/wd/hub')
      .withCapabilities(capabilities)
      .build();
  }

  // Catch Error in SE Driver Launch (Attempt Screenshot if Possible)
  // FIXME: This still runs after the tests have begun. It shouldn't (or it should add the testcase name)
  process.on('uncaughtException', function(err) {
    console.log('\nError setting up test suite... '.red + err);
    
    if (driver) {
      driver.takeScreenshot().then(function(screenshot) {
        var now       = month + '-' + day +'-' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();
        var filepath  = './error/screens/';
        var filename  = 'suite-setup-' + now + '.png';
        fs.writeFileSync(filepath + filename, new Buffer(screenshot, 'base64'));    
      });
    }
  });

  driver.get(HOST).then(function() {
    console.log('Configuring Test Environment. Navigating to: ' + HOST.yellow);
  }).then(done);
});


// Tests
describe('Routes', function() {
  
  it('should not contain trip durations in complicated fractions of hours', function(done) {
    this.timeout(RUN_TIMEOUT);
    
    var TRIP = SCHEDULES + locations["TOR"] + '/' + locations["MTL"]
    
    driver.get(TRIP).then(function() {
      driver.findElements(webdriver.By.className('duration')).then(function(durations) {
        async.forEach(durations, function(duration, step) {
        
          duration.isDisplayed().then(function() {
            return duration.getAttribute('innerHTML');
          }).then(function(duration_text) {
            var dot_location = duration_text.indexOf('.');
            var next_character = duration_text.substring(dot_location + 1, dot_location + 2);
            if (dot_location !== -1) {
              assert(next_character === "5", '"' + duration_text + '"' + ' contained a fraction that 60 minutes is not divisible by');
            }
            step();
          });
        });
      });
    }).then(done);
  });
  
  it('should not render destination names with unexpected characters', function(done) {
    this.timeout(RUN_TIMEOUT);

    // TODO: run this test for a few consecutive days: today, tomorrow, etc (wrap everything in a forEach???)
    var TRIP = SCHEDULES + locations['PRA'] + '/' + locations['MUN'] + '#date=';

    driver.get(TRIP + TODAY).then(function() {
      driver.findElements(webdriver.By.className('location')).then(function(locations) {
        async.forEach(locations, function(loc, step) {
          
          loc.isDisplayed().then(function() {
            return loc.getAttribute('innerHTML');
          }).then(function(location_text) {
            var underscore_location = location_text.indexOf('_');
            assert(underscore_location === -1, '"' + location_text + '"' + ' had one or more unexpected _ characters');
            step();
          });
        });
      });
    }).then(done);
  });
 
  it('destinations should not end with a period', function(done) {
    this.timeout(RUN_TIMEOUT);
    
    var TRIP = SCHEDULES + locations['WASH'] + '/' + locations['NYC'] + '#date=';

    driver.get(TRIP + TODAY).then(function() {
      driver.findElements(webdriver.By.className('location')).then(function(locations) {
        async.forEach(locations, function(loc, step) {

          loc.isDisplayed().then(function() {
            return loc.getAttribute('innerHTML');
          }).then(function(location_text) {
            var loc_length = location_text.length;
            var last_character = location_text.substring(loc_length - 1);
            if (!(strEndsWith(location_text, ' st.') || (strEndsWith(location_text, ' ave.')))) {
              assert(last_character !== '.', '"' + location_text + '"' + ' ended in an unexpected period');
            }
            step();
          });
        });
      });
    }).then(done);
  });

});

// Test Suite Teardown
after(function(done) {
  this.timeout(STOP_TIMEOUT);

  process.on('uncaughtException', function(err) {
    driver.quit();
  });
  driver.quit().then(done);
});

