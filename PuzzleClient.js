(function() {
    var myID;
    var LOCATION_ROOT_URL = Script.resolvePath(".");   
    var hoverSound = SoundCache.getSound(LOCATION_ROOT_URL +"108336__qat__click-01-fast.wav");
    var swooshSound = SoundCache.getSound(LOCATION_ROOT_URL + "419341__wizardoz__swoosh.wav");   
    var CLICK_VOLUME = 1;
    var SWITCH_TIME_MS = 500;
    var myPosition;     
    var selection = 0;
    var selection1ID = Uuid.NULL;
    var selection2ID = Uuid.NULL;
    var LIST_NAME = "SelectionExample",
        ITEM_TYPE = "entity",
        HIGHLIGHT_STYLE = {
            outlineUnoccludedColor: { red: 0, green: 255, blue: 255 },
            outlineUnoccludedAlpha: 0.8,
            outlineOccludedColor: { red: 0, green: 255, blue: 255 },
            outlineOccludedAlpha: 0.8,
            outlineWidth: 2
        };

    Selection.enableListHighlight(LIST_NAME, HIGHLIGHT_STYLE);  

    this.preload = function (entityID) {
        myID = entityID;
        myPosition = Entities.getEntityProperties(myID,["position"]).position;
    };

    function hoverEnterEntity(entityID) { 
        var parent = Entities.getEntityProperties(entityID,["parentID"]).parentID;
        if (parent === myID) {       
            Audio.playSound(hoverSound, { volume: CLICK_VOLUME, position: myPosition }); 
        }
    }

    function onMousePressEvent(id,event) {        
        if (event.button === "Primary") {
            var props = Entities.getEntityProperties(id);
            var sendButtonPress = "";

            if (props.name === "PuzzleStartButton" && props.parentID === myID) {
                sendButtonPress = "Start";                
            }
            if (props.name === "PuzzleResetButton" && props.parentID === myID) {
                sendButtonPress = "Reset";               
            }
            if (props.name === "PuzzleLoadButton" && props.parentID === myID) {
                var url = Window.prompt("URL of the image","");
                var pixelsX = Window.prompt("Horizontal pixels","");
                var pixelsY = Window.prompt("Vertical pixels","");
                var pieces = Window.prompt("pieces per side","");
                print (!isNaN(pixelsX));
                print (!isNaN(pixelsY));
                print (!isNaN(pieces));
                Entities.callEntityServerMethod(                             
                    myID, 
                    "load",
                    [url,pixelsX,pixelsY,pieces]
                );                
            }
            if (props.name === "PuzzlePiece" && props.parentID === myID) {                
                if (selection === 0 ) {
                    selection1ID = id;
                }
                if (selection === 1 ) {
                    selection2ID = id;
                }
                if (selection < 2) {
                    Selection.addToSelectedItemsList(LIST_NAME, ITEM_TYPE, id);
                }
                if (selection >= 1) {                
                    Script.setTimeout(function () { 
                        selection = 0;
                        Selection.clearSelectedItemsList(LIST_NAME);                        
                        Audio.playSound(swooshSound, { volume: CLICK_VOLUME, position: myPosition });                
                        Entities.callEntityServerMethod(                             
                            myID, 
                            "receivePieces",
                            [selection1ID,selection2ID]
                        );                                                     
                    }, SWITCH_TIME_MS);
                }
                selection++;
            }

            if (sendButtonPress === "Start" ||
                 sendButtonPress === "Reset") {                      
                Entities.callEntityServerMethod(                             
                    myID, 
                    "command",
                    [sendButtonPress]
                );
                print("sendCommand: " + sendButtonPress);
            }                                           
        }            
    }
       
    Entities.hoverEnterEntity.connect(hoverEnterEntity);
    Entities.mousePressOnEntity.connect(onMousePressEvent);
});
