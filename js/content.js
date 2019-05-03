let iframe = null;
// listen for checkForWord request, call getTags which includes callback to sendResponse
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log("Message received", request);
        switch (request.action) {
            case "processWebPage":
                // iframe = document.createElement('iframe');
                // iframe.src = chrome.extension.getURL("modal.html");
                // iframe.width = "500px";
                // iframe.height = "300px";
                // iframe.id = "myFrame";
                // iframe.style.position = "center";
                // //$(iframe).hide();//necessary otherwise frame will be visible
                // //$(iframe).appendTo("body");
                // document.body.appendChild(iframe);
                // $(iframe).hide();
                // let modal = document.querySelector(".modal");
                // let closeButton = document.querySelector(".close-button");
                // function toggleModal() {
                //     modal.classList.toggle("show-modal");
                // }
                // function windowOnClick(event) {
                //     if (event.target === modal) {
                //         toggleModal();
                //     }
                // }
                // closeButton.addEventListener("click", toggleModal);
                // window.addEventListener("click", windowOnClick);

                processWebPage(detectPageType);
                sendResponse({result: 'success', currentUrl: location.hostname});
                break;
            default:
                console.log("Invalid action received");
                sendResponse({result: 'failure'});
        }
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

let allForms = [];
let currentFormIndex = null;
let currentURLs = new Set();
let urlList = null;

/**
 * This function binds our protection to any suitable input elements on the
 * page. This way, we'll fire off the appropriate checks when an input value
 * changes.
 */

let monitorForm = function (allForms) {
    for (let ind = 0; ind < allForms.length; ind++) {
        for (let i = 0; i < allForms[ind].mForm.elements.length; i++) {
            if (allForms[ind].mForm.elements[i].type === "password") {
                allForms[ind].password_field = allForms[ind].mForm.elements[i];
                allForms[ind].mForm.elements[i].addEventListener("change", function () {

                    let password = event.currentTarget.value;
                    currentFormIndex = ind;
                    chrome.runtime.sendMessage({
                        type: "checkPasswordReuse",
                        url: window.location.hostname,
                        password: password,
                        formType: allForms[ind].mFormType
                    }, function (response) {
                        console.log('checkPasswordReuse response: ', response);
                        if (response === "alertUser") {
                            if (allForms[currentFormIndex].mFormType === 'signup') {
                                alert("Remembrall : Already in Use! Choose a different password");
                            } else {
                                alert("Remembrall : Input password belongs to some other website, possible phishing attack.");
                            }
                            $(allForms[currentFormIndex].password_field).val("");
                            $(allForms[currentFormIndex].password_field).focus();
                        }
                    });
                });
                break;
            }
        }
    }
};

function checkEmailElement(type, fieldName, className) {
    let fieldNameConditions = ["email", "id", "login"];
    let classNameConditions = ["email"];

    let test1 = fieldNameConditions.some(el => fieldName.includes(el));
    let test2 = classNameConditions.some(el => className.includes(el));

    return type === "email" || test1 || test2;
}

let detectPageType = function (formsList) {
    console.log("Detecting page type");
    for (let i = 0; i < formsList.length; i++) {
        let form = formsList[i],
            method = form.method,
            id = form.id,
            action = form.action,
            name = form.name,
            className = form.className,
            elements = form.elements,
            containsEmail = false,
            containsPass = false,
            containsSelect = false,
            containsExtra = false;
        if (method === 'post' || method === 'get') {
            if (regex.test(id) || regex.test(action) || regex.test(name) || regex.test(className)) {
                console.log("Page contains SIGNUP in id, action, name or classname");
                allForms.push({mForm: form, mFormType: 'signup'});
            } else if (lregex.test(id) || lregex.test(action) || lregex.test(name) || lregex.test(className)) {
                console.log("Page contains LOGIN in id, action, name or classname");
                allForms.push({mForm: form, mFormType: 'login'});
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
                    allForms.push({mForm: form, mFormType: 'signup'});
                } else if (containsEmail && containsPass) {
                    console.log("Login Page detected");
                    allForms.push({mForm: form, mFormType: 'login'});
                }
            }
        }
    }
    monitorForm(allForms);
    for (let ind = 0; ind < allForms.length; ind++) {
        if (allForms[ind].mFormType === 'signup') {
            if (allForms[ind].password_field != null) {
                $(allForms[ind].mForm).on("submit", function () {
                    console.log('submitting form');
                    let password = allForms[ind].password_field.value;
                    let url = window.location.hostname;
                    chrome.runtime.sendMessage({
                        type: "saveCredentials",
                        url: url,
                        password: password
                    }, function (response) {
                        console.log('saveCredentials response: ', response);
                    });
                });
            }
        }
    }
};

let processLinksinPage = function () {
    urlList = document.getElementsByTagName('a');
    console.log("In processLinksinPage");
    if (urlList != null && urlList.length > 0) {
        for (let i = 0; i < urlList.length; i++) {
            // console.log("Before getDomain " + urlList[i].href);
            let tempURL = getDomain(urlList[i].href);
            // console.log("After getDomain " + tempURL)
            if (tempURL != null && tempURL !== "")
                currentURLs.add(tempURL);
        }
        console.log(currentURLs);
        chrome.runtime.sendMessage({
            type: "checkDomainWhitelisting",
            currentURLs: Array.from(currentURLs)
        }, function (maliciousUrls) {
            console.log(maliciousUrls);
            if (maliciousUrls.length !== 0)
                addListenerToMalUrls(new Set(maliciousUrls));
        });
    }
};

let processWebPage = function (callback) {
    console.log("In processWebPage");
    processLinksinPage();
    let formsList = document.getElementsByTagName('form');
    setTimeout(function () {
        if (formsList.length > 0)
            callback(formsList);
    }, 1000);
};

let shouldWhitelistDomain = function (hostname, href) {
    console.log('Intercepting onclick for anchor tag');
    let retVal = confirm("Add this URL permanently to the Web Store?");
    if (retVal === true) {
        console.log("UserInput: add URL to Web Store");
        chrome.runtime.sendMessage({type: "whiteListDomain", hostname: hostname}, function (response) {
            console.log('whiteListDomain response: ', response);
        });
    } else {
        console.log("UserInput: Do Not add URL to Web Store");
    }
    location.replace(href);
};

let addListenerToMalUrls = function (maliciousUrls) {
    console.log("In addListenerToMalUrls");
    if (maliciousUrls != null) {
        console.log(maliciousUrls);
        for (let i = 0; i < urlList.length; i++) {
            let href = urlList[i].href;
            let hostname = getDomain(href);
            if (maliciousUrls.has(hostname)) {
                urlList[i].href = "#";
                urlList[i].onclick = function () {
                    shouldWhitelistDomain(hostname, href);
                }
            }
        }
    }
};