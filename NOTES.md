##ISSUES

* Concurrency can behave suspiciously if any small tweaks are made...
* Some parts of the code needs a cleanup
* Not catching and reacting to failures well (assert may not be best library)
* Violating Style Guide
* - Not using Loadsh (does this apply?)
* - Some lines are over 80 chars
* - Nesting too deeply

## TODO

* Find way to iterate test over every platform/browser in capabilities
* Find a better way to handle selenium timeouts

## USAGE

* BS_NAME='browser_stack_name' BS_KEY='browser_stack_key' npm test

