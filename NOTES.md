##ISSUES

* Concurrency still behavious suspiciously at times...
* Some parts of the code is ugly
* Not catching and reacting to failures well (assert may not be best library)
* Violating Style Guide
* - Not using Loadsh (does this apply?)
* - Some lines are over 80 chars
* - Nesting too deeply

## TODO

* find way to pass site variable as command line arg (or another way)
* link with browser-stack or saucelabs
* Find a better way to handle selenium timeouts

## USAGE

* BS_NAME='browser_stack_name' BS_KEY='browser_stack_key' npm test

