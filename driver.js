#!/usr/bin/env node

// Select appropriate webdriver based on configuration settings

var conf = require('./conf.json');


if (conf['local']) {
  var webdriver = require('selenium-webdriver');
} else {
  var webdriver = require('browserstack-webdriver');
}

module.exports = webdriver;
