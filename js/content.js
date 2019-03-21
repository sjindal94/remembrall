// listen for checkForWord request, call getTags which includes callback to sendResponse
chrome.runtime.onMessage.addListener(
    function (request, sender, sendMessage) {
        if (request.action === "checkForPassword") {
            checkForPassword(request, sender, sendMessage);
            // this is required to use sendResponse asynchronously
            return true;
        }
    }
);

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
    for (var i=0; i<inputs.length; i++) {
        if (inputs[i].type.toLowerCase() === "password") {
            ele.push(inputs[i]);
            return sendMessage(true);
        }
    }
    console.log(ele.toString());
    return sendMessage(false);
}