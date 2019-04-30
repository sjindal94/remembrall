// listen for checkForWord request, call getTags which includes callback to sendResponse
chrome.runtime.onMessage.addListener((request, sender, sendMessage) => {
        console.log("Message received");
        switch (request.action) {
            case "alertUser":
                console.log("Password Exists");
                if(currentForm === 'signup') {
                    alert("Remembrall : Already in Use! Choose a different password");
                    $(signupForm.password_field).val("");
                    $(signupForm.password_field).focus();
                }
                else if(currentForm === 'login') {
                    alert("Remembrall : Input password belongs to some other website, possible phishing attack.");
                    $(loginForm.password_field).val("");
                    $(loginForm.password_field).focus();
                }
                //sendResponse({result: 'success'});
                break;
            case "fetchDomainname":
                var domain = location.hostname;
                chrome.extension.sendMessage({type: "URLinWebStore", domain: domain}, $.noop);
                //sendResponse({result: 'success'});
                break;
            case "detectPageType":
                checkForForms(detectPageType);
                //sendResponse({result: 'success'});
                break;
            case "addUrlListener":
                console.log(currentURL);
                console.log("Needs addition of listener as it is not in Alexa db");
                break;
            default:
                console.log("Invalid action received");
            //sendResponse({result: 'failure'});
        }
        // this is required to use sendResponse asynchronously
        return true;
    }
);

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

let extraStrings = ['name', 'gender', 'sex', 'number', 'age', 'birthday'],
    signupStrings = ['signup', 'create account', 'register', 'sign up'],
    buttonStrings = ['signup', 'create account', 'register', 'sign up', 'join'],
    loginStrings = ['login', 'log in'];

let regexExt = new RegExp(extraStrings.join("|"), "i"),
    regex = new RegExp(signupStrings.join("|"), "i"),
    regexButton = new RegExp(buttonStrings.join("|"), "i"),
    lregex = new RegExp(loginStrings.join("|"), "i");

var signupForm = null;
var loginForm = null;
var currentForm = null;

var currentURL = null;

let passwordInputListener = function (event) {
    let password = event.currentTarget.value;
    let url = window.location.hostname;
    if(signupForm !== null && this === signupForm.password_field)
        currentForm = 'signup';
    else if(loginForm !== null && this === loginForm.password_field)
        currentForm = 'login';
    else
        console.log("None");    
    console.log("passwordInputListener: ", password, url);
    chrome.runtime.sendMessage({type: "checkPasswordReuse", url: url, password: password}, $.noop);
}

/**
 * This function binds our protection to any suitable input elements on the
 * page. This way, we'll fire off the appropriate checks when an input value
 * changes.
 */

var monitorForm = function (formType) {
    var found = false;
    if(formType === 'signup') {
        for (let i = 0; i < signupForm.mForm.elements.length; i++) {
            let type = signupForm.mForm.elements[i].type;
            switch (signupForm.mForm.elements[i].type) {
                case "password":
                    signupForm.password_field = signupForm.mForm.elements[i];
                    signupForm.mForm.elements[i].addEventListener("change", passwordInputListener);
                    found = true;
                    break;
            }
            if(found) break;
        }
    }
    else {
        for (let i = 0; i < loginForm.mForm.elements.length; i++) {
            let type = loginForm.mForm.elements[i].type;
            switch (loginForm.mForm.elements[i].type) {
                case "password":
                    loginForm.password_field = loginForm.mForm.elements[i];
                    loginForm.mForm.elements[i].addEventListener("change", passwordInputListener);
                    found = true;
                    break;
            }
            if(found) break;
        }
    }
}

function checkEmailElement(type, fieldName, className) {
    let fieldNameConditions = ["email", "id", "login"];
    let classNameConditions = ["email"];

    let test1 = fieldNameConditions.some(el => fieldName.includes(el));
    let test2 = classNameConditions.some(el => className.includes(el));

    //console.log(test1, test2);
    return type === "email" || test1 || test2;
}

var detectPageType = function (formsList) {
    console.log("Detecting page type");
    for (let i = 0 ; i < formsList.length; i++) {
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
                console.log("Page contains SIGNUP in id, action, name or classname");
                signupForm = {
                    mForm : form,
                    mFormType : 'signup'
                };
            } else if(lregex.test(id) || lregex.test(action) || lregex.test(name) || lregex.test(className)) {
                console.log("Page contains LOGIN in id, action, name or classname");
                loginForm = {
                    mForm : form,
                    mFormType : 'login'
                };
            } else {
                for (let j = 0, element; element = elements[j++];) {
                    let type = element.type;
                    let fieldName = element.name;
                    let className = element.className;

                    if (type === "submit" && (regexButton.test(element.innerHTML) || regexButton.test(element.value))) {
                        console.log("Page contains signup. Button label : " + element.innerHTML);
                        mForm = form;
                        break;
                    }
                    if (checkEmailElement(type, fieldName, className)) {
                        containsEmail = true;
                        console.log("Contains email");
                    }
                    if (type === "password") {
                        containsPass = true;
                        console.log("Contains password");
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
                    signupForm = {
                        mForm : form,
                        mFormType : 'signup'
                    }
                } else if (containsEmail && containsPass) {
                    console.log("Login Page detected");
                    loginForm = {
                        mForm : form,
                        mFormType : 'login'
                    }
                }
            }
        }
    }

    if (signupForm !== null) {
        monitorForm(signupForm.mFormType);
        if(signupForm.password_field != null) {
            $(signupForm.mForm).on("submit", function () {
                console.log('submitting form');
                var password = signupForm.password_field.value;
                var url = window.location.hostname;
                chrome.runtime.sendMessage({type: "addToDatabase", url: url, password: password}, $.noop);
            });
        }
    }

    if (loginForm !== null) {
        monitorForm(loginForm.mFormType);
        if(loginForm.password_field != null) {
            $(loginForm.mForm).on("submit", function () {
                console.log('submitting form');
                var password = loginForm.password_field.value;
                var url = window.location.hostname;
                chrome.runtime.sendMessage({type: "addToDatabase", url: url, password: password}, $.noop);
            });
        }
    }
}

var checkForForms = function(callback) {
    var formsList = document.getElementsByTagName('form');
    // fetchAllUrls();
    console.log("In checkForForms");
    setTimeout(function() {
        if(formsList.length > 0)
            callback(formsList);
    }, 1000);
}

var fetchAllUrls = function() {
    var urlList = document.getElementsByTagName('a');
    console.log("In fetchAllUrls");
    if(urlList != null) {
        console.log(urlList);
        for(let i = 0 ; i < urlList.length ; i++) {
            console.log("Adding listener to " + urlList[i].hostname);
            urlList[i].onclick = function() {
                // chrome.runtime.sendMessage({type: "URLinWebStorePre", url: urlList[i].hostname}, $.noop);
            }
        }
    }
}

checkForForms(detectPageType);
