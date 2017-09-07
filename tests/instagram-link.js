const assert = require('assert');

describe('When clicking on the Instagram link', function() {
	it('should bring you to the Busbud instagram page', function() {
		// test steps go here
		browser.url('http://www.busbud.com');
		browser.click('a.social.instagram');

		browser.pause(3000);

		const lastTabId = browser.getTabIds()[browser.getTabIds().length - 1];
		browser.switchTab(lastTabId);

		// This test is going to fail since it's redirected to Page Not Found
		assert(browser.getUrl() === 'https://www.instagram.com/busbudapp/');
	});

	it('should not be unavailable', function() {
		console.log(browser.getTitle())
		assert(browser.getTitle().indexOf('Page Not Found') === -1);
	});
});