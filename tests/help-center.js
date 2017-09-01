const assert = require('assert');

describe('When clicking on Busbud logo in help center', function() {
	it('should bring you to the Busbud home', function() {
		// test steps go here
		browser.url('http://help.busbud.com/hc/en-us');
		browser.click('.header .logo a');

		browser.pause(3000);

		assert(browser.getUrl() === 'https://www.busbud.com/en');
	});
});