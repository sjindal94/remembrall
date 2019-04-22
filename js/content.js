// listen for checkForWord request, call getTags which includes callback to sendResponse
chrome.runtime.onMessage.addListener(
    function (request, sender, sendMessage) {
        console.log("Message received");
        if (request.action === "detectPageType") {
            detectPageType();
        } else if (request.action === "validateURL") {
            //validateURL(request, sender, sendMessage);
        }
        // this is required to use sendResponse asynchronously
        console.log("Return true");
        return true;
    }
);

/*
 * validateURL() - verifys the URL against the list of Certified URLs (Alexa 10K Websites) provides user options to 
 *                  -Dismiss Now (Alert user again)
 *                  -Dismiss Forever (Add this URL to list of Certified URLs)
 * 
 * Presently it is a static list of URLs where the user clicked URL will be verified 
 * and the options to dismiss/dismissForever is provided.
 *    
 */
function validateURL(request, sender, sendMessage) {

    var Urls = getUrls();
    console.log(location.href);
    console.log(location.hostname);
    var domain = location.hostname;
    var flag = 0;

    for (var i = 0; i < Urls.length; i++) {
        if (domain.match(Urls[i])) {
            flag = 1;
            console.log(Urls[i]);
            console.log("domain found");
        }
    }

    if (flag === 0) {
        console.log("popUp");
        //chrome.windows.create({url: chrome.extension.getURL("dialog.html"), type: "popup"});
        chrome.extension.sendMessage({type: "dialog"}, $.noop);
    }

    console.log("EOF ValidateURL");
}

// validateURL();

/*
 * Rules to identify a signup page :
 * 1. The window.location has signup in its path
 * 2. There exists a form element in the html dom with
 *      a. method == post
 *           i. action, id, or name containing words like ['signup']
 *          ii. form containing button type = 'submit' with value or name in ['signup','create','create account','register']
 *         iii. has atleast 1 input type = 'email'
 *                  atleast 1 input type = 'password'
 *                  atleast 1 buttom type = 'submit'
 *              and atleast 1 other non hidden input type with name in
 *                  ['first name', 'mobile number', 'phone number', 'last name', 'name', 'gender', 'dob', 'birth', 'date']
 *
 * Works for :
 *      - Facebook      : https://www.facebook.com/
 *      - Yahoo         : https://login.yahoo.com/account/create?src=fpctx&intl=us&lang=en-US&done=https%3A%2F%2Fwww.yahoo.com&specId=yidReg
 *      - Google        : https://accounts.google.com/signup/v2/webcreateaccount?hl=en-GB&flowName=GlifWebSignIn&flowEntry=SignUp&nogm=true
 *      - Github        : https://github.com/
 *      - Linkedin      : https://www.linkedin.com/
 *      - Reddit        : https://www.reddit.com/
 *      - Twilio        : https://www.twilio.com/try-twilio
 *      - Amazon        :
 *      -
 *
 * Does not work for :
 *      - Instacart
 *      - Apple
 */

var extraStrings = ['name', 'gender', 'sex', 'number', 'age', 'birthday'],
    signupStrings = ['signup', 'create account', 'register', 'sign up'],
    buttonStrings = ['signup', 'create account', 'register', 'sign up', 'join'];

var regexExt = new RegExp(extraStrings.join("|"), "i"),
    regex = new RegExp(signupStrings.join("|"), "i"),
    regexButton = new RegExp(buttonStrings.join("|"), "i");

var signup_form = null;

var monitorForm = function () {
    console.log('here');
    $(signup_form).submit(function (event) {
        console.log('submitting form');
        var form_data = {};
        var password;
        for (var i = 0; i < this.elements.length; i++) {
            var name = this.elements[i].name;
            var type = this.elements[i].type;
            var value = this.elements[i].value;
            if (type && type.toLowerCase() === "password")
                password = this.elements[i].value;
            if (name && type.toLowerCase() !== "hidden")
                form_data[name] = value;
        }
        console.log("Validating password");
        chrome.extension.sendMessage({type: "validate_password", data: form_data, password: password}, function(response) {
            console.log("HERE", response.result);
            //event.preventDefault();
        });
    });
    return true;
};

function checkEmailElement(type, fieldName, className){
    let fieldNameConditions = ["email", "id", "login"];
    let classNameConditions = ["email"];

    var test1 = fieldNameConditions.some(el => fieldName.includes(el));
    var test2 = classNameConditions.some(el => className.includes(el));

    console.log(test1, test2);
    if(type === "email" || test1 || test2){
        return true;
    }
    return false;
}

var detectPageType = function () {
    console.log("Detecting page type");
    var formsList = document.getElementsByTagName('form');
    for (let i = 0, len = formsList.length; i < len; i++) {
        var form = formsList[i];
        var method = form.method,
            id = form.id,
            action = form.action,
            name = form.name,
            className = form.className,
            elements = form.elements;
        var containsEmail = false,
            containsPass = false,
            containsSelect = false,
            containsExtra = false;

        if (method == 'post' || method == 'get') {
            if (regex.test(id) || regex.test(action) || regex.test(name) || regex.test(className)) {
                console.log("Page contains signup in id, action, name or classname");
                signup_form = form;
                break;
            } else {
                for (let j = 0, element; element = elements[j++];) {
                    let type = element.type;
                    let fieldName = element.name;
                    let className = element.className;

                    if (type === "submit" && (regexButton.test(element.innerHTML) || regexButton.test(element.value))) {
                        console.log("Page contains signup. Button label : " + element.innerHTML);
                        signup_form = form;
                        break;
                    }
                    if (checkEmailElement(type, fieldName, className)) {
                        containsEmail = true;
                    }
                    if (type === "password") {
                        containsPass = true;
                    }
                    if (regexExt.test(fieldName)) {
                        containsExtra = true;
                    }
                    if (type === "select") {
                        containsSelect = true;
                    }
                }
                if (containsEmail && containsPass && (containsExtra || containsSelect)) {
                    console.log("Signup page detected");
                    signup_form = form;
                    break;
                }
                // } else if(containsEmail && containsPass) {
                //     console.log("Login Page detected");
                //     break;
                // }
            }
        }
    }
    if (signup_form !== null) {
        monitorForm();
        //chrome.extension.sendMessage({type: "intercept_request"}, $.noop);
    }
}