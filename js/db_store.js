const pouchDb = new PouchDB('db_store');

function initDBForTest() {

    var dbEntry1 = {
        "_id": "1",
        "url": "www.twilio.com",
        "user_data": "some_email",
        //"password": hashString("password123")
        "password"  : "password123"
    };
    var dbEntry2 = {
        "_id": "1",
        "url": "www.github.com",
        "user_data": "some_email",
        //"password": hashString("password321")
        "password": "password321"
    };
    var dbEntry3 = {
        "_id": "1",
        "url": "www.facebook.com",
        "user_data": "some_email",
        //"password": hashString("password")
        "password": "password"
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
            console.log(docs.rows[0].doc);
            return docs;
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