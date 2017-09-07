const assert = require('assert');

describe('When clicking on Busbud logo in help center', function() {
	it('should bring you to the Busbud home', function() {
		// test steps go here
		browser.url('http://help.busbud.com/hc/en-us');
		browser.click('.header .logo a');

		browser.pause(3000);

		// This test is going to fail since it is expected to reach the homepage
		assert(browser.getUrl() === 'https://www.busbud.com/en');
	});
});