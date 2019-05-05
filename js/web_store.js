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
        if (result.doc_count === 0)
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
    else webDb.put(doc, function (err) {
        if (err) {
            return console.log(err);
        } else {
            //console.log(response);
            //console.log("Document Added to DB Successfully");
            //readDocAlexa("1");
            webDb.createIndex({
                index: {
                    fields: ['url']
                }
            }).then(function (result) {
                // handle result
            }).catch(function (err) {
                console.log(err);
            });
        }
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
    else webDb.bulkDocs(docs, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("Documents created Successfully");
        }
    });
    //readAllDocsWebDb();
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


/* Reference/Credits: (async file fetch)
* https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
*/
