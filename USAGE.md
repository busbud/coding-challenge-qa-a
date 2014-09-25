# CODING CHALLENGE

## Usage:

```bash
BS_NAME=<browserStack_name> BS_KEY=<browserStack_key> npm test
```
Settings are defined in conf.json as follows:

* host [str] (url to navigate to during suite setup)
* schedule_url [str] (imported for some tests)
* local [bool] (toggle this to run locally, versus remotely via BrowserStack)
* remote_settings [arr] (list of capabilities for BrowserStack test)
* remote_index [int] (which list item from remote_settings list to use for current test)
* local_settings [arr] (list of capabilities for local environment)
* local_index [int] (which list item from local_settings list to use for current test)

Ensure that mocha resides in your path. See package.json for dependencies.


## Architecture:

Consists of the following files

* test.js : main executible  
* driver.js : returns webdriver for local or remote session
* capabilities.js : returns capability set in conf.json for local or remote session (and index)
* conf.json : test configurations & settings
* package.json: npm information, dependencies, etc


## Known Issues:

* Tests succeed if there is no network available. Selenium searches browsers' 404 page for elements identified in test case.
* -> Quick & Dirty Fix: Quick sanity check by sending CURL to URL to ensure a response is returned, in the suite setup
* At random times, busbud page can be very slow to calculate routes after the page has loaded
* -> Quick & Dirty Fix: can be handled by adding waits (but that dramatically slows down tests, mostly unnecessaily)
* Tests won't fail near the end of the day (if there are few routes left)
* -> mitigating this by always getting schedule for tomorrow


## Wish List:

* Screens are not useful unless problematic sections are highlighted. Webdriver doesn't support this, but it should be possible.
* Organise screenshot folder (& tag with test name)
* Error logs
* Make screenshot dir if it doesn't exist (and then remove it from git tracking)
* Run parallel tests (requires premium browserStack account)
* -> "Uncaught UnknownError: 2 sessions are currently being used. Please upgrade to add more parallel sessions."
* Iterate tests through multiple days until failure (or set ceiling) occurs
* Support both browserStack & SauceLabs (& others)
* conf.json is limited. Some of these keys may require variables
