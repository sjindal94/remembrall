var pouchDb = null;
function initDBForTest() {
    console.log("Initializing DB");
    var dbEntry1 = {
        "_id": "1",
        "url": "www.twilio.com",
        "user_data": "some_email",
        "password": hashString("password123")
    };
    var dbEntry2 = {
        "_id": "2",
        "url": "www.github.com",
        "user_data": "some_email",
        "password": hashString("password321")
    };
    var dbEntry3 = {
        "_id": "3",
        "url": "www.facebook.com",
        "user_data": "some_email",
        "password": hashString("password")
    };
    dbEntries = [dbEntry1, dbEntry2, dbEntry3];
    writeBulkDocs(dbEntries);
    readAllDocs();
}

function writeBulkDocs(docs) {
    pouchDb.bulkDocs(docs, function (err, response) {
        if (err) {
            return console.log(err);
        } else {
            console.log(response);
            console.log("Documents created Successfully");
        }
    });
}

function readDoc(_id) {
    console.log("Reading just 1 entry with id:"+ _id);
    pouchDb.get(_id, function (err, doc) {
        if (err) {
            return console.log(err);
        } else {
            console.log(doc);
        }
    });
}

function writeDoc(doc) {
    pouchDb.put(doc, function (err, response) {
        if (err) {
            return console.log(err);
        } else {
            console.log(response);
            console.log("Document created Successfully");
            readDoc("1");
        }
    });
}

function removeDoc(_id, _rev) {
    //Deleting an existing document
    pouchDb.remove(_id, _rev, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("Document deleted successfully");
        }
    });
}

function readAllDocs() {
    //Retrieving all the documents in PouchDB
    pouchDb.allDocs({include_docs: true, descending: true}, function (err, docs) {
        if (err) {
            return console.log(err);
        } else {
            console.log(docs);
            return docs;
        }
    });
}

function createDB(){
    //Creating the database object
    pouchDb = new PouchDB('db_store');
    initDBForTest();
}

function destroyDB(){
    //deleting database
    pouchDb.destroy(function (err, response) {
        if (err) {
            return console.log(err);
        } else {
            console.log("Database Deleted");
        }
    });
}

createDB();
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