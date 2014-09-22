#!/usr/bin/env node

var assert    = require('assert');
var fs        = require('fs');

var mocha     = require('mocha');
var webdriver = require('selenium-webdriver');     // comment if using browserstack
//var webdriver = require('browserstack-webdriver'); // uncommet to use browserstack
var async     = require('async');
var colors    = require('colors');
var _         = require('lodash'); //not yet used

var conf      = require('../../conf.json');

// Ensure Kill Web Drivers on Force Quit (Mac/Linux Only)
process.on('SIGINT', function() {
  console.log('\nCaught Unexpected Interrupt Signal. Force Quitting...\n'.red)
  driver.quit();
  process.exit();
});

// Test Suite Variables
var HOST  = conf['host'] || 'http://busbud.com';
// TODO: capabilities can't be directly sourced from json conf file since it needs environment variables
var capabilities = { 'browserName' : 'chrome' };
var NAME  = process.env.BS_NAME || "";
var KEY   = process.env.BS_KEY || "";
var TC_TIMEOUT = 15000;
var d     = new Date;
var year  = d.getFullYear();
var month = d.getMonth() + 1;
var day   = d.getDate();
var TODAY = year + '-' + month + '-' + day;

// Common Functions
function strEndsWith(str, suffix) {
  return str.toLowerCase().match(suffix.toLowerCase()+"$")==suffix.toLowerCase();
}


before(function(done) {
  this.timeout(220000);

  driver = new webdriver.Builder()
    //.usingServer('http://hub.browserstack.com/wd/hub') // uncomment to use browserstack
    .withCapabilities(capabilities)
    .build();

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
    this.timeout(TC_TIMEOUT);

    TOR_TO_MTL = 'https://secure.busbud.com/en/bus-schedules/Toronto,Ontario,Canada/Montreal,Quebec,Canada';
    
    driver.get(TOR_TO_MTL).then(function() {
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
    this.timeout(TC_TIMEOUT);

    // TODO: run this test for a few consecutive days: today, tomorrow, etc (wrap everything in a forEach???)
    PRA_TO_MUN  = 'https://secure.busbud.com/en/bus-schedules/Prague,HlavniMestoPraha,CzechRepublic/Munich,Bavaria,Germany#date=';

    driver.get(PRA_TO_MUN + TODAY).then(function() {
      driver.findElements(webdriver.By.className('location')).then(function(locations) {
        async.forEach(locations, function(loc, step) {
          
          loc.isDisplayed().then(function() {
            return loc.getAttribute('innerHTML');
          }).then(function(location_text) {
            var underscore_location = location_text.indexOf('_')
            assert(underscore_location === -1, '"' + location_text + '"' + ' had one or more unexpected _ characters');
            step();
          });
        });
      });
    }).then(done);
  });
 
  it('destinations should not end with a period', function(done) {
    this.timeout(TC_TIMEOUT);

    WASH_TO_TOR  = 'https://secure.busbud.com/en/bus-schedules/Washington,DC,UnitedStates/NewYork,NewYork,UnitedStates#date='

    driver.get(WASH_TO_TOR + TODAY).then(function() {
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
  this.timeout(5000);

  process.on('uncaughtException', function(err) {
    driver.quit();
  });
  driver.quit().then(done);
});

