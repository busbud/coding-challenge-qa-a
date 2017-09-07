const assert = require('assert');

describe('When selecting a language in profile settings', function() {
	it('should display the whole website in the selected language', function() {
		// test steps go here
		browser.url('https://www.busbud.com/en')

		browser.click('#js-header-signin-link');
		
		browser.pause(2000);

		browser.setValue('[type="email"]', 'tremblayveronique@gmail.com')
		browser.setValue('[type="password"]', 'timitimi')
		browser.click('button[type="submit"]')

		browser.pause(2000);

		browser.url('https://www.busbud.com/en/account/profile');
		browser.selectByVisibleText('select', 'Français (Canada)');

		// This test is going to fail since it doesn't change the language of the website 
		// corresponding to the settings for the user profile
		assert(browser.getUrl() === 'https://www.busbud.com/fr-ca/account/profile');
	});
});