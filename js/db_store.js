var pouchDb = null;

function initDBForTest() {
    console.log("Initializing DB");
    var dbEntry1 = {
        "_id": hashString("password123"),
        "h_url": hashString("www.twilio.com"),
        "h_password": hashString("password123"),
        "url": "www.twilio.com",
        "password": "password123"
    };
    var dbEntry2 = {
        "_id": hashString("password321"),
        "h_url": hashString("www.github.com"),
        "h_password": hashString("password321"),
        "url": "www.github.com",
        "password": "password321"
    };
    var dbEntry3 = {
        "_id": hashString("password"),
        "h_url": hashString("www.facebook.com"),
        "h_password": hashString("password"),
        "url": "www.facebook.com",
        "password": "password"
    };
    dbEntries = [dbEntry1, dbEntry2, dbEntry3];
    writeBulkDocs(dbEntries);
}

function writeBulkDocs(docs) {
    if (pouchDb == null) console.log("DB Does not exist");
    else pouchDb.bulkDocs(docs, function (err, response) {
        if (err) {
            return console.log(err);
        } else {
            console.log(response);
            console.log("Documents created Successfully");
        }
    });
    readAllDocs();
}

function readDoc(_id) {
    console.log("Reading just 1 entry with id:" + _id);
    if (pouchDb == null) console.log("DB Does not exist");
    else pouchDb.get(_id, function (err, doc) {
        if (err) {
            return console.log(err);
        } else {
            console.log(doc);
        }
    });
}

function infoDB() {
    if (pouchDb == null) console.log("DB Does not exist");
    else pouchDb.info().then(function (info) {
        console.log(info);
    })
}

function writeDoc(doc) {
    if (pouchDb == null) console.log("DB Does not exist");
    else pouchDb.put(doc, function (err, response) {
        if (err) {
            return console.log(err);
        } else {
            console.log(response);
            console.log("Document created Successfully");
        }
    });
}

function removeDoc(_id, _rev) {
    //Deleting an existing document
    if (pouchDb == null) console.log("DB Does not exist");
    else pouchDb.remove(_id, _rev, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("Document deleted successfully");
        }
    });
}

function readAllDocs() {
    //Retrieving all the documents in PouchDB
    if (pouchDb == null) console.log("DB Does not exist");
    else pouchDb.allDocs({include_docs: true, descending: true}, function (err, docs) {
        if (err) {
            return console.log(err);
        } else {
            console.log(docs);
            return docs;
        }
    });
}

function createDB() {
    //Creating the database object
    pouchDb = new PouchDB('db_store');
    initDBForTest();
}

function destroyDB() {
    //deleting database
    if (pouchDb == null) console.log("DB Does not exist");
    else pouchDb.destroy(function (err, response) {
        if (err) {
            return console.log(err);
        } else {
            pouchDb = null;
            console.log(response);
            console.log("Database Deleted");
        }
    });
}

/*
Incase we save address, contact cards , secret files images etc
//Adding attachment to a document
db.putAttachment('001', 'att_1.txt', my_attachment, 'text/plain', function(err, res) {
   if (err) {
      return console.log(err);
   } else {
      console.log(res+"Attachment added successfully")
   }
});
 */