(function() {
    var myID;
    var myPosition;
    var LOCATION_ROOT_URL = Script.resolvePath(".");    
    var VOLUME = 1;
    var SEARCH_RADIUS = 50;
    var SCRAMBLE_TIME_MS = 5000;
    var FINISHED_TIME_MS = 4000;
    var piecesX = 6;
    var piecesY = 6;
    var pieces = [];
    var pieceIDs = [];
    var shuffeledPieces = [];
    var imageURL = LOCATION_ROOT_URL + "picture1.png"; 
    var finishedSound = SoundCache.getSound(LOCATION_ROOT_URL + "171671__leszek-szary__success-1.wav");
    var swooshSound = SoundCache.getSound(LOCATION_ROOT_URL + "419341__wizardoz__swoosh.wav");   
    var selection1ID = Uuid.NULL;
    var selection2ID = Uuid.NULL;
    var timerTextID = Uuid.NULL;
    var rightPieces = 0;
    var pixelsX = 2560;
    var pixelsY = 1440;
    var maxY = 1.75;
    var maxX = maxY * (pixelsX / pixelsY);
    var leftMargin = -maxX/2 + maxX / (piecesX *2);
    var bottomMargin = -maxY/2 + maxY / (piecesY *2) + 0.3;
    var isRunning = false;
    
    this.remotelyCallable = [
        "command",
        "receivePieces",
        "load"                  
    ];

    this.preload = function (entityID) {
        myID = entityID;
        myPosition = Entities.getEntityProperties(myID,["position"]).position;        
        cleanup();
    };    

    this.command = function(id,param) {
        var action = param[0];
        if (action === "Start" && isRunning === false) {
            Audio.playSound(swooshSound, { volume: VOLUME, position: myPosition }); 
            isRunning = true;
            start();
        }
        if (action === "Reset" && isRunning === true) {
            Audio.playSound(swooshSound, { volume: VOLUME, position: myPosition }); 
            isRunning = false;
            resetPuzzle();
        }          
    };

    this.receivePieces = function(id,param) {
        selection1ID = param[0];
        selection2ID = param[1];
        var pos1 = Entities.getEntityProperties(selection1ID,["subImage"]).subImage;
        var pos2 = Entities.getEntityProperties(selection2ID,["subImage"]).subImage;
        Entities.editEntity (selection1ID,{subImage: pos2});
        Entities.editEntity (selection2ID,{subImage: pos1});
        selection1ID = Uuid.NULL;
        selection2ID = Uuid.NULL;
        checkIfFinished();             
    };
    
    this.load = function(id,param) {
        imageURL = param[0];
        pixelsX = param[1];
        pixelsY = param[2];
        piecesX = param[3];
        piecesY = param[3];
        var maxY = 1.75;
        maxX = maxY * (pixelsX / pixelsY);
        leftMargin = -maxX/2 + maxX / (piecesX *2);
        bottomMargin = -maxY/2 + maxY / (piecesY *2) + 0.3;
        Audio.playSound(finishedSound, { volume: VOLUME, position: myPosition });
        print("loading finished");
        resetPuzzle();        
        start(); 
    };

    function cleanup() {
        var ents = Entities.findEntities(myPosition, 50);
        for (var s in ents) {
            var props = Entities.getEntityProperties(ents[s]);
            if (props.name === "PuzzlePiece" && props.parentID === myID) {
                Entities.deleteEntity(ents[s]);
            }
        }
    }

    function start() {
        var ents = Entities.findEntities(myPosition, SEARCH_RADIUS);
        for (var s in ents) {
            var props = Entities.getEntityProperties(ents[s]);
            if (props.name === "PuzzlePiecesText" && props.parentID === myID) {
                timerTextID = props.id;
                print("found timerID");
            }
        }
        Entities.editEntity(timerTextID,{text: 0}); 
        cleanup();       
        for (var px = 0; px < piecesX; px++) {
            for (var py = 0; py < piecesY; py++) {        
                var imageID = Entities.addEntity({
                    parentID: myID,
                    type: "Image",
                    name: "PuzzlePiece",
                    localPosition: {
                        x: leftMargin + (px * (maxX/piecesX)),
                        y: bottomMargin + (py*(maxY/piecesY)),
                        z: 0.2},
                    dimensions: { x: maxX/piecesX, y: maxY/piecesY, z: 0.05 },
                    subImage: {
                        x: px*(pixelsX/piecesX),
                        y: ((pixelsY-(pixelsY/piecesY))-py*(pixelsY/piecesY)),
                        width: (pixelsX/piecesX),
                        height: (pixelsY/piecesY)},
                    imageURL: imageURL,
                    grab: {grabbable: false},
                    keepAspectRatio: true,            
                    lifetime: 6000 // Delete after 5 minutes.
                });
                pieceIDs.push(imageID);               
            }    
        }

        for (var k = 0; k < pieceIDs.length; k++) {        
            var newSubImage = Entities.getEntityProperties(pieceIDs[k],"subImage").subImage;        
            pieces.push(newSubImage);
        }

        Script.setTimeout(function () {
            var temp = pieces.slice();    
            shuffeledPieces = shuffle(temp);   
            for (var i = 0; i < pieceIDs.length; i++) { 
                Entities.editEntity(pieceIDs[i],{"subImage": shuffeledPieces[i]});
            }
        }, SCRAMBLE_TIME_MS);    

        function shuffle(piecesObject) {
            var currentIndex = piecesObject.length, temporaryValue, randomIndex;    
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;    
                // And swap it with the current element.
                temporaryValue = piecesObject[currentIndex];
                piecesObject[currentIndex] = piecesObject[randomIndex];
                piecesObject[randomIndex] = temporaryValue;
            }   
            return piecesObject;
        }        
    }

    function resetPuzzle() {
        pieces = [];
        pieceIDs = [];
        shuffeledPieces = [];
        Entities.editEntity(timerTextID,{text: 0});
        cleanup();
        isRunning = false;
    }        
   
    function checkIfFinished() {
        shuffeledPieces = [];
        rightPieces = 0;    
        for (var i = 0; i < pieceIDs.length; i++) {           
            var newSubImage = Entities.getEntityProperties(pieceIDs[i],"subImage").subImage;           
            shuffeledPieces.push(newSubImage);
        }
       
        for (var j = 0; j < pieces.length; j++) {        
            if (shuffeledPieces[j].x === pieces[j].x) {
                if (shuffeledPieces[j].y === pieces[j].y) {
                    rightPieces++;                   
                }
            }
        }

        print(rightPieces);
        Entities.editEntity(timerTextID,{text: rightPieces + "/" + piecesX*piecesY});

        if (rightPieces === piecesX * piecesY) {
            Audio.playSound(finishedSound, { volume: VOLUME, position: myPosition }); 
            Script.setTimeout(function () {
                for (var k in pieceIDs) {
                    Entities.deleteEntity(pieceIDs[k]);
                }                
                pieces = [];
                pieceIDs = [];
                shuffeledPieces = [];
                Entities.editEntity(timerTextID,{text: 0});
                cleanup();
                isRunning = false;
            }, FINISHED_TIME_MS );   
        }       
    }
});

