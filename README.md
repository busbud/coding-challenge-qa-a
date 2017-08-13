# QA Coding Challenge

Find three (major or minor) issues on Busbud.com and write the automated regression tests that reproduce the failure across one or more browsers.

## Functional requirements

* Tests are run on the command line using `npm test`
* Tests are run against a configurable host, with `www.busbud.com` as the default
* Tests can be configured to run various browser and OS combinations, at a minimum the following should be included
  * Any of Chrome latest, Firefox latest, or Safari latest on Mac OS
* Testing service credentials are passed as environment variables

## Non-functional requirements

* Challenge is submitted as pull request against this repo ([fork it](https://help.github.com/articles/fork-a-repo/) and [create a pull request](https://help.github.com/articles/creating-a-pull-request-from-a-fork/)).
* Tests are written in javascript, using NodeJS
* Tests are written against a BDD framework like `mocha`
* Tests cases describe expected behavior
* Style guide: https://github.com/busbud/js-style-guide

### Bonus

* Tests run against a testing service (SauceLabs, BrowserStack or similar)
* Tests run against mobile browsers
* Tests capture screenshots of failures

## What we're looking for

1. Interesting or impactful issues
1. Using high-quality existing libraries or small amounts of custom code
1. Showing your work through your commit history
1. Polish
1. Pride in craftsmanship

## References

* https://wiki.saucelabs.com/display/DOCS/Instant+Selenium+Node.js+Tests
* http://www.browserstack.com/automate/node
