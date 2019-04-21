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

    var domain = location.hostname;
    chrome.extension.sendMessage({type: "dialog", domain: domain}, $.noop);

}

validateURL();

{
/* 
 * Rules to identify a signup page :
 * 1. There exists a form element in the html dom with
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
}

var extraStrings = ['name', 'gender', 'sex', 'number', 'age', 'birthday'],
    signupStrings = ['signup', 'create account', 'register', 'sign up'],
    buttonStrings = ['signup', 'create account', 'register', 'sign up', 'join'];

var regexExt = new RegExp(extraStrings.join("|"), "i"),
    regex = new RegExp(signupStrings.join("|"), "i"),
    regexBut = new RegExp(buttonStrings.join("|"), "i");

var signup_form = null;
var password_field = null;

var protectPasswordInput = function(event) {
    let password = event.currentTarget.value;
    let url = window.location.hostname;
    console.log("Inside protectPasswordInput. Password is : " + password);
    console.log("Current host name : " + url);
    chrome.runtime.sendMessage({type: "dupePass", url: url, password: password}, $.noop);
}

 /**
 * This function binds our protection to any suitable input elements on the
 * page. This way, we'll fire off the appropriate checks when an input value
 * changes.
 */
var monitorForm = function () {
    for (var i = 0; i < signup_form.elements.length; i++) {
        var type = signup_form.elements[i].type;
        switch (signup_form.elements[i].type) {
            case "password":
                password_field = signup_form.elements[i];
                console.log('password_field');
                console.log(password_field);
                signup_form.elements[i].addEventListener("change", protectPasswordInput);
                break;
        }
    }
}

var checkForSignup = function () {
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

                    if (type === "submit" && (regexBut.test(element.innerHTML) || regexBut.test(element.value))) {
                        console.log("Page contains signup. Button label : " + element.innerHTML);
                        signup_form = form;
                        break;
                    }
                    if (type === "email" || fieldName.includes("email") || fieldName.includes("id") || className.includes("email")) {
                        // console.log("Contains Email/userid");
                        containsEmail = true;
                    }
                    if (type === "password") {
                        // console.log("Contains Password");
                        containsPass = true;
                    }
                    if (regexExt.test(fieldName)) {
                        // console.log("Contains " + fieldName);
                        containsExtra = true;
                    }
                    if (type === "select") {
                        // console.log("Contains Select");
                        containsSelect = true;
                    }
                }
                if (containsEmail && containsPass && (containsExtra || containsSelect)) {
                    console.log("Page contains signup");
                    signup_form = form;
                    break;
                }
            }
        }
    }
    if (signup_form !== null) monitorForm();
}
checkForSignup();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {   
    if (request.isPresent) {
        console.log("Password Exists");
        alert("Already in Use! Choose a different password");
        if(password_field != null) {
            $(password_field).val("");
            $(password_field).focus();
        }
    }
});

$(signup_form).on("submit", function () {
    console.log('submitting form');
    var password = password_field.value;
    var url = window.location.hostname;
    chrome.runtime.sendMessage({type: "addToDatabase", url: url, password: password}, $.noop);
});
