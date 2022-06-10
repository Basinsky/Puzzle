//
//  puzzle-Spawner.js
//  
//  Created by Basinsky on 10 June 2021
//  
//  Spawner script for puzzle game 
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

var localRot;
var LOCATION_ROOT_URL = Script.resolvePath(".");
var TIME_OUT_MS = 1000;
var START_COLOR = { r: 0, g: 100, b: 0 };
var HALF_CIRCLE_DEGREE = 180; 

function generateQuatFromDegreesViaRadians(rotxdeg,rotydeg,rotzdeg) {
    var rotxrad = (rotxdeg/HALF_CIRCLE_DEGREE)*Math.PI;
    var rotyrad = (rotydeg/HALF_CIRCLE_DEGREE)*Math.PI;
    var rotzrad = (rotzdeg/HALF_CIRCLE_DEGREE)*Math.PI;          
    var newRotation = Quat.fromPitchYawRollRadians(rotxrad,rotyrad,rotzrad); 
    return newRotation;
}

var mainID = Entities.addEntity({
    type: "Model",        
    name: "PuzzleFrame",   
    modelURL: LOCATION_ROOT_URL + "puzzle.glb?" + Date.now(),
    script: LOCATION_ROOT_URL + "PuzzleClient.js?" + Date.now(),
    serverScripts: LOCATION_ROOT_URL + "PuzzleServer.js?" + Date.now(),       
    position: Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: 1.1, z: -5 })),    
    rotation: MyAvatar.orientation,     
    lifetime: -1,            
    userData: JSON.stringify({
        grabbableKey: { grabbable: false, triggerable: false }
    })                          
});

Entities.addEntity({
    type: "Image",        
    name: "PuzzleStartButton",    
    dimensions: { x: 0.9164, y: 0.4430, z: 0.01}, 
    parentID: mainID,   
    imageURL: LOCATION_ROOT_URL + "Start.png?" + Date.now(),       
    localPosition: { x: -1.6662, y: -1.1825, z: 0.18 },
    lifetime: -1,            
    userData: JSON.stringify({
        grabbableKey: { grabbable: false, triggerable: true }
    })                          
});

Entities.addEntity({
    type: "Image",        
    name: "PuzzleResetButton",    
    dimensions: { x: 0.9164, y: 0.4430, z: 0.01}, 
    parentID: mainID,   
    imageURL: LOCATION_ROOT_URL + "Reset.png?" + Date.now(),       
    localPosition: { x: -0.5444, y: -1.1825, z: 0.18 },
    lifetime: -1,            
    userData: JSON.stringify({
        grabbableKey: { grabbable: false, triggerable: true }
    })                          
});

Entities.addEntity({
    type: "Image",        
    name: "PuzzleLoadButton",    
    dimensions: { x: 0.9164, y: 0.4430, z: 0.01}, 
    parentID: mainID,   
    imageURL: LOCATION_ROOT_URL + "Load.png?" + Date.now(),       
    localPosition: { x: 0.5368, y: -1.1825, z: 0.18 },
    lifetime: -1,            
    userData: JSON.stringify({
        grabbableKey: { grabbable: false, triggerable: true }
    })                          
});

Entities.addEntity({
    type: "Text",        
    name: "PuzzlePiecesText",    
    dimensions: { x: 0.9164, y: 0.4430, z: 0.01}, 
    parentID: mainID,
    localPosition: { x: 1.7012, y: -1.1865, z: 0.18 },
    lifetime: -1, 
    backgroundAlpha: 0,  
    lineHeight: 0.29,
    text: 0,         
    userData: JSON.stringify({
        grabbableKey: { grabbable: false, triggerable: true }
    })                          
});

Script.stop();

