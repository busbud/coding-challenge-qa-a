// Select appropriate webdriver based on configuration settings

var conf = require('./conf.json');

var webdriver;

if (conf.local) {
  webdriver = require('selenium-webdriver');
} else {
  webdriver = require('browserstack-webdriver');
}

module.exports = webdriver;
