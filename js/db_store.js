const pouchDb = new PouchDB('db_store');

function readDoc(_id){
    pouchDb.get(_id, function(err, doc) {
        if (err) {
            return console.log(err);
        } else {
            console.log(doc);
        }
    });
}

function writeDoc(doc){
    pouchDb.put(doc, function(err, response) {
        if (err) {
            return console.log(err);
        } else {
            console.log(response);
            console.log("Document created Successfully");
        }
    });
}

function removeDoc(_id, _rev){
    //Deleting an existing document
    pouchDb.remove(_id, _rev, function(err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("Document deleted successfully");
        }
    });
}

function readAllDocs() {
    //Retrieving all the documents in PouchDB
    pouchDb.allDocs({include_docs: true, descending: true}, function(err, docs) {
        if (err) {
            return console.log(err);
        } else {
            console.log(docs.rows[0].doc);
            return docs;
        }
    });
}


/*Add mul docs or update multiple or delete multiple
doc1 = {_id: '001', name: 'Ram', age: 23, Designation: 'Programmer'}
doc2 = {_id: '002', name: 'Robert', age: 24, Designation: 'Programmer'}
doc3 = {_id: '003', name: 'Rahim', age: 25, Designation: 'Programmer'}

docs = [doc1, doc2, doc3]

//Inserting Documents
db.bulkDocs(docs, function(err, response) {
   if (err) {
      return console.log(err);
   } else {
      console.log("Documents created Successfully");
   }
});
 */

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