var pouchDbAlexa = null;

function parseTextFile(data) {

    var lines=data.split(" ");
    //var result = [];

    //lines.length has all 10K URLs,
    //presenty we can test with 100 only.
    for(var i=0; i<100; i++){
  
        var object = {};
        var currentline=lines[i].split(",");

        object[i]=currentline;
        //result.push(obj);

        JSON.stringify(object[i]);
        
        var id = object[i][0];
        var Url = object[i][1];

        //console.log(id);
        //console.log(Url);

        var dbEntry = {
            "_id": id,
            "Url": Url
        };

        writeDocAlexa(dbEntry);
        //readAllDocsAlexa();
    
    }

    readAllDocsAlexa();
    
  }



/*
 * Reference/Credits:
 * https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
 *  
 */ 
const ReadTextFile = async file => {
 
    const response = await fetch(file)
    const data = await response.text()
    //console.log(text)
    parseTextFile(data)

}


function initializeDBAlexa() {

    console.log("Initializing DB for Alexa");
    /*
     * Alexa 10K .csv to .txt one-time-parser 
     * Reference/Credits:
     * https://jsfiddle.net/Santoshtiwari14/1c5z608s/
     *
     */ 
    ReadTextFile('csv/alexa_10k.txt');

}



function initializeStaticDBAlexa() {
    console.log("Initializing DB for Alexa");
    var dbEntry1 = {
        "_id": "1",
        "Url": "www.twilio.com"
    };
    var dbEntry2 = {
        "_id": "2",
        "Url": "www.reddit.com"
    };
    var dbEntry3 = {
        "_id": "3",
        "Url": "www.instagram.com"
    };
    var dbEntry4 = {
        "_id": "4",
        "Url": "stackoverflow.com"
    };
    var dbEntry5 = {
        "_id": "5",
        "Url": "www.google.com"
    };
    var dbEntry6 = {
        "_id": "6",
        "Url": "www.facebook.com"
    };
    var dbEntry7 = {
        "_id": "7",
        "Url": "www.microsoft.com"
    };
    var dbEntry8 = {
        "_id": "8",
        "Url": "github.com"
    };
    var dbEntry9 = {
        "_id": "9",
        "Url": "www.youtube.com"
    };
    var dbEntry10 = {
        "_id": "10",
        "Url": "www.yahoo.com"
    };

    dbEntries = [dbEntry1, dbEntry2, dbEntry3, dbEntry4, dbEntry5, dbEntry6, dbEntry7, dbEntry8, dbEntry9, dbEntry10];
    //writeBulkDocsAlexa(dbEntries);

}


function writeBulkDocsAlexa(docs) {
    if(!pouchDbAlexa) console.log("DB Does not exist");
    else pouchDbAlexa.bulkDocs(docs, function (err, response) {
        if (err) {
            return console.log(err);
        } else {
            console.log(response);
            console.log("Documents created Successfully");
        }
    });
    readAllDocsAlexa();
}


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
            //console.log("Document Added to DB Successfully");
            //readDocAlexa("1");
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
    //destroyDBAlexa();
    initializeDBAlexa();
}

function destroyDBAlexa(){
    //deleting database
    if(!pouchDbAlexa) console.log("DB Does not exist");
    else pouchDbAlexa.destroy(function (err, response) {
        if (err) {
            return console.log(err);
        } else {
            console.log("Database AlexaDB Deleted");
        }
    });
}

//createDBAlexa();

