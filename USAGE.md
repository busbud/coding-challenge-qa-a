# CODING CHALLENGE

## Usage:

```bash
BS_NAME="<browserStack_name>" BS_KEY="<browserStack_key>" npm test
```
Settings are defined in conf.json as follows:

* host (string) -> url to navigate to during suite setup
* schedule_url (string) -> imported for some tests
* local (boolean) -> toggle this to run locally, versus remotely via BrowserStack
* remote_settings (array) -> list of capabilities for BrowserStack test
* remote_index (integer) -> which list item from remote_settings list to use for current test
* local_settings (array) -> list of capabilities for local environment
* local_index (integer) -> which list item from local_settings list to use for current test

Ensure that mocha resides in your path. See package.json for dependencies. Further, ensure for local tests the system is configured with the drivers you specified (i.e., chromedriver, etc)


## Description:

Built on nodeJS using Mocha test framework and the asset unit test library to return the test result. All tests are currently run through webdriver (i.e., there is no API validation or load testing being performed).

Tests are configured in conf.json and currently run via one specified capability at a time.

Experimented a bit with running parallel tests across multiple platforms, but browserStack limits this to two (for a free account). Also, webdriver is a global, so it will need its own process.

This logic probably better resides outside of test.js, calling test.js on each item in remote_settings (or local_settings).

Scaling project up to handle parallelization will be useful for load testing, and to simulate real user workflows all interacting with the site at the same time.


## Architecture:

Consists of the following files:

* **test.js** : main executable  
* **driver.js** : returns webdriver for local or remote session
* **capabilities.js** : returns capability set in conf.json for local or remote session (and index)
* **conf.json** : test configurations & settings
* **package.json**: npm information, dependencies, etc


## Known Issues:

* Tests succeed if there is no network available. Selenium searches browsers' 404 page for elements identified in test case.
* **->** Quick & Dirty Fix: Add a quick sanity check by sending CURL to URL to ensure a response is returned, in the suite setup
* At random times, Busbud page can be very slow to calculate routes after the page has loaded
* **->** Quick & Dirty Fix: can be handled by adding waits (but that dramatically slows down tests, mostly unnecessaily)
* Some tests won't fail near the end of the day (if there are few routes left)
* **->** mitigating this by always getting schedule for tomorrow


## Wish List:

* Screens are not useful unless problematic sections are highlighted. Webdriver doesn't support this, but it should be possible.
* Organise screenshot folder (& tag with test name)
* Error logs
* Make screenshot dir if it doesn't exist (and then remove it from git tracking)
* Run parallel tests (requires premium browserStack account)
* **->** webdriver is an implicit global. Use process.webdriver. More than 2 browserStack sessions requires premium account
* Iterate tests through multiple days until failure (or set ceiling) occurs
* Support both browserStack & SauceLabs (& others)
* conf.json is limited. Some of these keys may require variables
* locations array won't scale. Scrape for this information.
