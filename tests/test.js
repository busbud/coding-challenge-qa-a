#!/bin/env node

var assert    = require('assert');
var fs        = require('fs');

var webdriver = require('selenium-webdriver');
var async     = require('async');
var colors    = require('colors');
var rand_str  = require("randomstring");
var _         = require('lodash'); //not yet used

// Ensure Kill Web Drivers on Force Quit (Mac/Linux Only)
process.on('SIGINT', function() {
  console.log('\nCaught Unexpected Interrupt Signal. Force Quitting...\n'.red)
  driver.quit();
  process.exit();
});

// Test Suite Variables */
var HOST = 'http://busbud.com';
var capabilities = { 'browserName' : 'chrome' }
var USERNAME = process.env.SAUCE_NAME || "";
var PASSWORD = process.env.SAUCE_KEY || "";

// Test Suite Setup
before(function(done) {
  this.timeout(220000);

  driver = new webdriver.Builder()
    .withCapabilities(capabilities)
    .build();

  // Catch Error in SE Driver Launch (Attempt Screenshot if Possible)
  process.on('uncaughtException', function(err) {
    console.log('\nError Setting up Test Suite... '.red + err);
    
    if (driver) {
      driver.takeScreenshot().then(function(screenshot) {
        var filepath = './error/screens/';
        var filename = 'Suite-Setup-' + rand_str.generate(3) + '.png';
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
  
  it('should not contain trip durations in fractions', function(done) {
    this.timeout(10000);

    TOR_TO_MTL = 'https://secure.busbud.com/en/bus-schedules/Toronto,Ontario,Canada/Montreal,Quebec,Canada';
    
    driver.get(TOR_TO_MTL).then(function() {
      driver.findElements(webdriver.By.className('duration')).then(function(durations) {
        async.forEach(durations, function(duration, callback) {
        
          duration.isDisplayed().then(function() {
            return duration.getAttribute('innerHTML');
          }).then(function(duration_text) {
            console.log(duration_text.indexOf('.'));
            assert.equal(duration_text.indexOf('.'), -1);
            callback();
          });
        });
      });
    }).then(done);
  });
  
  it('should render all destination names correctly', function(done) {
    this.timeout(10000);

    PRA_TO_MUN = 'https://secure.busbud.com/en/bus-schedules/Prague,HlavniMestoPraha,CzechRepublic/Munich,Bavaria,Germany#date=2014-09-24';

    driver.get(PRA_TO_MUN).then(function() {
      driver.findElements(webdriver.By.className('location')).then(function(locations) {
        async.forEach(locations, function(loc, callback) {
          
          loc.isDisplayed().then(function() {
            return loc.getAttribute('innerHTML');
          }).then(function(location_text) {
            console.log(location_text);
            assert.equal(location_text.indexOf('_'), -1);
            callback();
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

