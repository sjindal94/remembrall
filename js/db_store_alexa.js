var pouchDbAlexa = null;


function readDocAlexa(_id) {
    console.log("Reading just 1 entry with id:"+ _id);
    if(!pouchDbAlexa) console.log("DB Does not exist");
    else pouchDbAlexa.get(_id, function (err, doc) {
        if (err) {
            return console.log(err);
        } else {
            console.log(doc);
        }
    });
}

function writeDocAlexa(doc) {
    if(!pouchDbAlexa) console.log("DB Does not exist");
    else pouchDbAlexa.put(doc, function (err, response) {
        if (err) {
            return console.log(err);
        } else {
            console.log(response);
            console.log("Document created Successfully");
            readDocAlexa("1");
        }
    });
}


function readAllDocsAlexa() {
    //Retrieving all the documents in PouchDB
    if(!pouchDbAlexa) console.log("DB Does not exist");
    else pouchDbAlexa.allDocs({include_docs: true, descending: true}, function (err, docs) {
        if (err) {
            return console.log(err);
        } else {
            console.log(docs);
            return docs;
        }
    });
}

function createDBAlexa(){
    //Creating the database object
    pouchDbAlexa = new PouchDB('db_store_alexa');
    initDBForTest();
}

function destroyDBAlexa(){
    //deleting database
    if(!pouchDbAlexa) console.log("DB Does not exist");
    else pouchDbAlexa.destroy(function (err, response) {
        if (err) {
            return console.log(err);
        } else {
            console.log("Database Deleted");
        }
    });
}

createDBAlexa();

