//TODO: clean up variable names
"use strict";                                                                   //this will break everything if there's any errors... that's a good thing
var mPanCanvas, mPanLoc, radarCanvas, mPanel, radar, radarLoc;                  //General canvas page vars
var map, zoomMap, tile, tileHighlight, retX, retY, animate, radLimit, radarRad;                //hold info for various bits and bobs
var upY, downY, leftX, rightX;                                                  //movement vars
var mouseX, mouseY, mPanTrack;                                                  //mouse trackers for main panel

/*Set up any global stuff that won't ever change after page load*/
function init() {
    /*get the topmost canvases that we'll need for mouse tracking*/
    mPanCanvas = document.getElementById('mPanOverlay');
    radarCanvas = document.getElementById('mapOverlay');
    
    /*get all the canvas contexts*/
    mPanel = document.getElementById('mainPanel').getContext('2d');
    mPanLoc = document.getElementById('mPanOverlay').getContext('2d');
    radar = document.getElementById('map').getContext('2d');
    radarLoc = document.getElementById('mapOverlay').getContext('2d');

    /*create the zoomed map grid references for use later*/ 
    zoomMap =new Array(13);
    zoomMap = [
    [3,9],
    [2,9],
    [1,11],
    [0,11],
    [1,11],
    [0,11],
    [0,12],
    [0,11],
    [1,11],
    [0,11],
    [1,11],
    [2,9],
    [3,9]
    ];
    
    /*set any initial values we will need*/
    radarRad = 100;
    retX = radarRad;
    retY = radarRad;
    animate=0;
    radLimit=radarRad-8;
    
    /*create the game's map*/
    map = new Array(radarRad*2);
    createMap();
    
    /*draw the radar background once on load*/
    drawRadar();

    tile = new Image();                                                         //create the spritesheet object
    tile.src = 'images/tiles.png';                                              //tell script where spritesheet is

    tileHighlight = new Image();                                                //create the spritesheet object for the tools png (highlights/buttons etc.)
    tileHighlight.src = 'images/tools.png';                                     //tell script where spritesheet is

    document.onkeydown = keydown;                                               //keyboard listener
    
    /*
    * Event listeners track the mouse movements. 
    * N.B.: You need to track on the topmost layer!!!
    */
    mPanCanvas.addEventListener('mousemove', function(evt){
        getMousePos(mPanCanvas, evt);
    }, false);
    radarCanvas.addEventListener('mousemove', function(evt){
        getMousePos(radarCanvas, evt);
    }, false);
    
    drawLoc();
    mainLoop();
}

/*the main game loop*/
function mainLoop() {
    if (animate==1){
       animate = 0;
    } else {
        animate +=1;
    }
    drawZoomMap();
    setTimeout(mainLoop, 200); //set the framerate here
}

/*detect when the up key is pressed*/
function keydown(e) {
    switch(e.keyCode) {
        case 38:
            move('up');
            break;
        case 40:
            move('down');
            break;         
        case 37:
            move('left');
            break;         
        case 39:
            move('right');
            break;  
        default:
            console.log("Uhm... that key doesn't do anything... ");
          break;
    }
    drawLoc();
}

/*Reads the mouse position*/
function getMousePos(canvas, evt){
    // get canvas position
    var obj = canvas;
    var top = 0;
    var left = 0;
    
    while (obj && obj.tagName != 'BODY') {
        top += obj.offsetTop;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
        
    }
    
    // return relative mouse position
    mouseX = evt.clientX - left + window.pageXOffset;
    mouseY = evt.clientY - top + window.pageYOffset;
    drawmPanLoc();
    return {
        x: mouseX,
        y: mouseY
    };
    
}

/*shifts our reference reticule (if possible), then redraws the map*/
function move(dir) {
    upY = retY-2;
    downY = retY+2;
    leftX = retX-1;
    rightX = retX+1;
    switch(dir) {
        case 'up':
            if(radius(retX,upY)<radLimit) {
                retY = upY;
            }
            break;         
        case 'down':
            if(radius(retX,downY)<radLimit) {
                retY = downY;
            }
            break;         
        case 'left':
            if(radius(leftX,retY)<radLimit) {
                retX = leftX;
            }
            break;          
        case 'right':
            if(radius(rightX,retY)<radLimit) {
                retX = rightX;
            }
            break;         
        default:
            break;
    }
    drawZoomMap();
    drawLoc();
}

/*this function is just a placeholder to give us a background on the elements so we can see placement*/
function drawRadar() {
    radar.beginPath();
    radar.arc(100,100,100,0,Math.PI*2,true);
    radar.fillStyle= "#000";
    radar.fill();
}

/*accepts the type of tile to draw, the x column number and the y column number, then draws it*/
function drawTile(tileType, tilePosX, tilePosY, highlight) {
    try
        {if (tilePosX < zoomMap[tilePosY][0] || tilePosX >= zoomMap[tilePosY][1]) {
            //this if checks to make sure we requested a tile we can draw, mainly to prevent highlighting outside of the map
        } else {
            var sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight; //Canvas vars
            sourceWidth = 346;                                                          //original tile width
            sourceHeight = 400;                                                         //original tile height
            destinationWidth = 60;                                                      //tile width on zoomMap... If I want 13 tiles across... for s=35
            destinationHeight = 70;                                                     //tile height on zoomMap                                                 
            destinationY = Math.floor(tilePosY*destinationWidth*0.88);                   //shift it by r
                
                if (tilePosY%2 === 0) {                                                     //if the column is odd...
                    destinationX = Math.floor(tilePosX*destinationWidth);             //we need to displace it vertically
                } else {                                                                    //if it’s even though
        
                    destinationX = Math.floor(tilePosX*destinationWidth+destinationWidth/2);//we just set the vertical displace normally
                }
                
            if (highlight === true){
                // INSERT HIGHLIGHT CODE
                sourceX = 0;
                sourceY = 0;
                        
                mPanLoc.drawImage(tileHighlight, sourceX, sourceY, sourceWidth, sourceHeight,
                      destinationX, destinationY, destinationWidth, destinationHeight);
            } else {
                sourceX = animate*346;
                sourceY = tileType*400;
        
                mPanel.drawImage(tile, sourceX, sourceY, sourceWidth, sourceHeight,
                      destinationX, destinationY, destinationWidth, destinationHeight);
            }
        }    
    } catch(e){}
}

/*creates the map*/
function createMap() {
	var x;
	var y;
	for(y=0;y<radarRad*2;y++) {
		map[y]=new Array(radarRad*2);                                                  //create an array to hold the x cell, we now have a 200x200 2d array
		for(x=0; x<radarRad*2; x++) {
            map[y][x]=new Array(2);                                             //each cell needs to hold its own array of the specific tile's values, so we're working with a 3 dimensional array - this will change when i set tiles as objects
			if(radius(x,y)<=radarRad) {                                              //check the radius, mark true if it's mapped, mark false if it's not in the circle
				map[y][x][0]=true;                                              //invert axes because referencing the array is not like referencing a graph
				map[y][x][1]=randTile();                                        //if we're in the circle, assign a tile value
			}else{
				map[y][x][0]=false;
			}
		}
	}
}

/*returns the distance of the given point from the centrepoint*/
function radius(xVal,yVal) {
    return Math.sqrt((xVal-radarRad)*(xVal-radarRad)+(yVal-radarRad)*(yVal-radarRad));
}

/*this draws the tiles, looping through the zoomMap's grid and placing the appropriate tile*/
function drawZoomMap() {
    mPanel.clearRect(0,0,720,720);
    var y,x,end;
    for(y=0;y<zoomMap.length;y++) {
        x=zoomMap[y][0];
        end=zoomMap[y][1];
        while (x<end) {
            drawTile(map[(retY+y-5)][(retX+x-6)][1],x,y);
            x++;
        }
    }
}

/*This function just generates random tiles for us to test performance*/
function randTile() {
    return Math.floor(Math.random()*2);
}

/*draws the current location on the small radar map*/
function drawLoc() {   
    radarLoc.clearRect(0,0,radarRad*2,radarRad*2);
    radarLoc.beginPath();
    radarLoc.arc(retX,retY,7,0,Math.PI*2,true);
    radarLoc.fillStyle= "#FFF";
    radarLoc.fill();
    radarLoc.closePath();
}

/*Draws a spot under the mouse pointer when on the main map, we'll later replace
this with code to highlight the selected hexagon*/
function drawmPanLoc() {
    mPanLoc.clearRect(0,0,720,720);
    var x, yDiff;
    var y = Math.floor(mouseY/(70*0.75));
    
    if (y%2 !== 0) {
        x = Math.floor((mouseX-30)/60);
    } else {
        x = Math.floor(mouseX/60);
    }
    
    //corner case code
    yDiff = (mouseY/(70*0.75))-y;
    if (yDiff < 0.33) {
        //tells which intermediate block we're in...
        var xDiff, left, right;
        if (y%2 !== 0) {
            xDiff = (((mouseX-30)/60)-x);
            
            if(xDiff<0.5) {
                left=0.5-xDiff;
                if((left*10)>(yDiff*10)*Math.tan(Math.PI/3)) {
                    y -=1;
                }
            } else {
                right = xDiff-0.5;
                if((right*10)>(yDiff*10)*Math.tan(Math.PI/3)) {
                    y -=1;
                    x += 1;
                }
            }
        } else {
            xDiff = ((mouseX/60)-x);
            if(xDiff<0.5) {
                left=0.5-xDiff;
                if((left*10)>(yDiff*10)*Math.tan(Math.PI/3)) {
                    y -=1;
                    x -= 1;
                }
            } else {
                right = xDiff-0.5;
                if((right*10)>(yDiff*10)*Math.tan(Math.PI/3)) {
                    y -=1;
                }
            }
        }

    }
    
    if (mPanTrack === true) {
        drawTile(1,x,y,true);
    }
}

/*When the radar is clicked, moves the map to that location*/
function jump() {
    var x = mouseX;
    var y = mouseY;
    //ensure we're dealing with a multiple of two (since we move up and down in twos)
    if (y%2 !== 0) {
        y -= 1;
    }
    if (radius(x,y) < radLimit) {
        retX = x;
        retY = y;
        drawLoc();
    }
}