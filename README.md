# Remembrall
Chrome extension for a password manager that warns user for password reuse, phishing attacks, and malicious links. It is a web app that stores its data locally inside the browser using [PouchDB](https://pouchdb.com) so that your password data never leaves the machine.

## Motivation
Modern browsers employ a wide range of security mechanisms to protect users against malicious websites. Unfortunately, these protections are often not sufficient and therefore users are often exposed to malicious and unwanted content. In this project, we have designed and developed a browser extension that will help users browse more securely. Namely, the extension  supports the following features:

* **Detect password reuse**: Users unfortunately tend to reuse passwords across websites. Whenever one of these websites is compromised, attackers can take advantage of these passwords and use them against different services. The ideal solution to this problem is to stop users from re-using passwords in the first place. Your browser extension should be able to detect when a user is creating a new account on a website and compare the password that the user has selected against all other previously stored passwords. If the password is the same, the extension should warn the user and encourage him to choose a different password.

* **Detect the entering of passwords on the wrong website**: Assuming that we have convinced users to use unique passwords, we can now detect whether the user is trying to login to a website with the password of a different website. This should allow us to protect users from falling victim to phishing attacks (e.g. detect that the user is entering her paypal.com password to the attacker.com website).

* **Modify link-clicking behavior**: Some security researchers have argued that most users would be protected if software would stop them from visiting unpopular websites. Your extension should inspect all links in all webpages visited and for those links that are leading the user outside of the Alexa top 10K websites, the user should be warned if they click on that link. The user should have the option to dismiss the block once (i.e. be allowed to visit that website) or for ever (i.e. ask the extension not to bother her next time she visits that particular website).

## Installation
Remembrall isn't packaged for installation yet from the Chrome Store yet, but you can install it by cloning this repository to your machine and then following these ['Load the extension'](https://developer.chrome.com/extensions/getstarted) instructions.

### Prerequisites

Download and install dependencies

External dependencies:
* [jQuery](https://jquery.com/)
* [Pouchdb](https://pouchdb.com/api.html)
* [pouchdb.quick-search](https://github.com/pouchdb-community/pouchdb-quick-search)

## Core Logic
* Detecting Signup Page

* Detecting Login Page

* Detecting Malicious URLs

### Schema
Remembrall stores its data in JSON documents like so:
```
 {
     "url": "www.facebook.com",
     "password":"U2FsdGVkXMleGDhErIERR18f8DaJSWufC91vcYjiGLs=",
 }
```

There are two schemas that are initialised during the initial extension setup. One schema to store the credentials of the user and the other for whitelisted URLs. 

## Testing
A number of manual tests was performed to make sure the app is working as expected and is responsive accross different websites.
* Checked the signup detection across majority of the popular websites. (Task 1)
* Checked the login detection across majority of the popular websites. (Task 2)
* Checked manually numerous google search results, to ensure that a warning is shown when a non whitelisted url is clicked. (Task 3) 


## Authors

* [Shubham Jindal](https://github.com/sjindal94)
* Anirudh Kulkarni
* Shivasagar Boraiah

## License

## Acknowledgments
