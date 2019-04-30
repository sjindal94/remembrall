var webDb = null;


/*
 * createWebStore() - create a Db or opens an existing Db
 */
function createWebStore() {
    webDb = new PouchDB('web_store');
    initWebDb();
}


/*
 * initWebDb() - initialize the WebDb with top10000 web links.
 */
function initWebDb() {
    console.log("Initializing WebDb");
    webDb.info().then(function (result) {
        if(result.doc_count === 0)
            ReadCSVFile('csv/top10000.csv');
        else
            console.log("Documents already exist!");
      }).catch(function (err) {
        console.log(err);
      });   
}


/*
 * ReadCSVFile() - read & write the data from
 *                 static CSV file to WebDb(Url)
 * @Url: Weblink DomainName 
 */
const ReadCSVFile = async file => {
    //TODO: Need to check if await can be used to remove those port errors
    const response = await fetch(file);
    const fileData = await response.text();
    let docs = $.csv.toObjects(fileData);
    writeBulkDocsWebDb(docs);
};


/*
 * writeDocWebDb() - write a single entry onto WebDb()
 *                   @doc: DomainName
 */
function writeDocWebDb(doc) {
    if (webDb == null) console.log("DB Does not exist");
    else webDb.put(doc, function (err, response) {
        if (err) {
            return console.log(err);
        } 
        //else {
            //console.log(response);
            //console.log("Document Added to DB Successfully");
            //readDocAlexa("1");
        //}
    });
}


/*
 * readAllDocsWebDb() - read all entries from the WebDb()
 */
function readAllDocsWebDb() {
    //Retrieving all the documents in credentialDb
    if (webDb == null) console.log("DB Does not exist");
    else webDb.allDocs({include_docs: true, descending: true}, function (err, docs) {
        if (err) {
            return console.log(err);
        } else {
            console.log(docs);
            return docs;
        }
    });
}


/*
 * writeBulkDocsWebDb() - write a block of data onto WebDb()
 *                        @docs: DomainName1, DomainName2...N
 */
function writeBulkDocsWebDb(docs) {
    if (webDb == null) console.log("DB Does not exist");
    else webDb.bulkDocs(docs, function (err, response) {
        if (err) {
            return console.log(err);
        } else {
            console.log("Documents created Successfully");
        }
    });
    readAllDocsWebDb();
}


/*
 * readAllDocsWebDb() - read an entry(_id) from the WebDb()
 */
function readDocWebDb(_id) {
    console.log("Reading just 1 entry with id:" + _id);
    if (webDb == null) console.log("DB Does not exist");
    else webDb.get(_id, function (err, doc) {
        if (err) {
            return console.log(err);
        } else {
            console.log(doc);
        }
    });
}


/*
 * destroyWebDb() - drop all entries and delete the WebDb()
 */
function destroyWebDb() {
    //deleting database
    if (webDb == null) console.log("DB Does not exist");
    else webDb.destroy(function (err, response) {
        if (err) {
            return console.log(err);
        } else {
            webDb = null;
            console.log("Database AlexaDB Deleted: ", response);
        }
    });
}



// function parseTextFile(data) {

//     //console.log(data);
//     var lines = data.split("\n");
//     //console.log(lines);
//     //var result = [];

//     //lines.length has all 10K URLs,
//     //presenty we can test with 100 only.
//     for (var i = 0; i < 100; i++) {

//         var object = {};
//         object[i] = lines[i].split(",");
//         //result.push(obj);

//         JSON.stringify(object[i]);

//         var id = object[i][0];
//         var domainName = object[i][1];

//         var dbEntry = {
//             "_id": domainName
//             //"domain": Url
//         };

//         writeDocWebDb(dbEntry);
//         //readAllDocsAlexa();

//     }
//     console.log("Reading doc");
//     readAllDocsWebDb();

// }

// function initializeStaticDBAlexa() {
//     console.log("Initializing DB for Alexa");
//     var dbEntry1 = {
//         "_id": "1",
//         "Url": "www.twilio.com"
//     };
//     var dbEntry2 = {
//         "_id": "2",
//         "Url": "www.reddit.com"
//     };
//     var dbEntry3 = {
//         "_id": "3",
//         "Url": "www.instagram.com"
//     };
//     var dbEntry4 = {
//         "_id": "4",
//         "Url": "stackoverflow.com"
//     };
//     var dbEntry5 = {
//         "_id": "5",
//         "Url": "www.google.com"
//     };
//     var dbEntry6 = {
//         "_id": "6",
//         "Url": "www.facebook.com"
//     };
//     var dbEntry7 = {
//         "_id": "7",
//         "Url": "www.microsoft.com"
//     };
//     var dbEntry8 = {
//         "_id": "8",
//         "Url": "github.com"
//     };
//     var dbEntry9 = {
//         "_id": "9",
//         "Url": "www.youtube.com"
//     };
//     var dbEntry10 = {
//         "_id": "10",
//         "Url": "www.yahoo.com"
//     };

//     dbEntries = [dbEntry1, dbEntry2, dbEntry3, dbEntry4, dbEntry5, dbEntry6, dbEntry7, dbEntry8, dbEntry9, dbEntry10];
//     //writeBulkDocsAlexa(dbEntries);

// }


/* Reference/Credits: (async file fetch)
* https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
*/
