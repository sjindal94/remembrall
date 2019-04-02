// listen for checkForWord request, call getTags which includes callback to sendResponse
chrome.runtime.onMessage.addListener(
    function (request, sender, sendMessage) {
        if (request.action === "checkForPassword") {
            checkForPassword(request, sender, sendMessage);
            // this is required to use sendResponse asynchronously
            return true;
        }
        if (request.action === "checkForSignup") {
            checkForSignup(request, sender, sendMessage);
            // this is required to use sendResponse asynchronously
            return true;
        }
        if (request.action === "validateURL") {
             validateURL(request, sender, sendMessage);
             return true;
        }
    }
);


 function validateURL(request, sender, sendMessage) {

    var Urls = ['stackoverflow.com','www.google.com', 'www.amazon.com', 'www.facebook.com', 'www.microsoft.com', 'www.github.com'];
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
         console.log("TODO popUp");
         //chrome.windows.create({url: chrome.extension.getURL("dialog.html"), type: "popup"});
     }

    console.log("EOF ValidateURL");
 }

//Returns the index of the first instance of the desired word on the page.
// function checkForWord(request, sender, sendResponse){
//     var scripts = document.getElementsByTagName("script");
//     for (var i=0;i<scripts.length;i++) {
//         if (scripts[i].src.toLowerCase().indexOf("jquery")>-1){
//             return sendResponse(true);
//         }
//     }
//     return sendResponse(false);
// }


function checkForPassword(request, sender, sendMessage) {
    console.log("Getting password inputs");
    var ele = [];

    //check if tab.title has login word
    //check if tab.url has login word
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].type.toLowerCase() === "password") {
            ele.push(inputs[i]);
            return sendMessage(true);
        }
    }
    console.log(ele.toString());
    return sendMessage(false);
}

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
    regexBut = new RegExp(buttonStrings.join("|"), "i");

var signup_form = null;

/*
 * Sample code to make use of PouchDB
 */
const db = new PouchDB('vault');

var doc = {
    "_id": "1",
    "url": "www.facebook.com",
    "hash": "password123"
};
function initDocs(text) {
    db.put(doc, function callback(err, result) {
        if (!err) {
            console.log('Successfully posted a todo!');
        }
    });
}

function listDocs() {
    db.allDocs({include_docs: true, descending: true}, function(err, doc) {
        console.log(doc.rows[0].doc);
    });
}

initDocs();
listDocs();
/**********************************************************************************/

var monitorForm = function() {
    $(signup_form).submit(function(event) {
        console.log('submitting form');
        var form_data = {};
        var password;
        for(var i = 0; i < this.elements.length; i++) {
            var name = this.elements[i].name;
            var type = this.elements[i].type;
            var value = this.elements[i].value;
            console.log(name + " " + value + " " + type);
            if(type && type.toLowerCase() === "password")
                password = this.elements[i].value;
            if(name && type.toLowerCase() !== "hidden")
                form_data[name] = value;
        }
        chrome.extension.sendMessage({type: "store", data: form_data, password: password}, $.noop);
    });
}

var checkForSignup = function() {
    var formsList = document.getElementsByTagName('form');
    for(let i = 0, len = formsList.length; i < len; i++) {
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

        if(method == 'post' || method == 'get') {
            if(regex.test(id) || regex.test(action) || regex.test(name) || regex.test(className)) {
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
                if(containsEmail && containsPass && (containsExtra || containsSelect)) {
                    console.log("Page contains signup");
                    signup_form = form;
                    break;
                }
            }
        }
    }
    if(signup_form !== null) monitorForm();
}
checkForSignup();
