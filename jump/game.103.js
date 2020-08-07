
var jumper;
var scrollHeight=0;
var maxHeight = 0;
var minGap=20;
var maxGap=60;
var gravity = 0.5;
var jumpForce  = 14;
var highestPlat = 650;
var lowestPlat = 650;
var jumperHeight = 55;
var platforms;
var clouds;
var difficulty = 0;
var backround;
var platheight = 19.3;
var totalFrames = 0;
var bright;
var dead = false;
var restimer = 0;
var boing= new Audio("sounds/boing.mp3");
var jump= new Audio("sounds/jump.mp3");
var breakk= new Audio("sounds/break.mp3");
var fall= new Audio("sounds/fall.mp3");
var fallplayed = false;
var highscore = 0;
function startGame() {//make jumper character
    jumper = new component(250, 600,0, 40, 60, "images/character1.png",  "image",1);
    backround = new component(250, 350,0, 500, 700, "#a0deff",  "",1);//make backround rectangle
    clouds = [];//list of the clouds
    clouds.push(new platform(150, 500,256, 140, "normal",0,"right","images/cloud.png",  "image",0));//first cloud is at a fixed starting position
    //the first platform is in the middle at the bottom
    var startPltfrm = new platform(250, 650,80, platheight, "normal",0,"right","images/green.png",  "image",0);
    //create platform list with the first platform
    platforms = [];
    platforms.push(startPltfrm);
    //start the gamearea
    myGameArea.start();
}
var makeClouds = function(clds){
  //while the topmost cloud is not yet above the canvas, make new random ones
  while((clds[clds.length - 1]).y + scrollHeight/2 > - 100){
      //random x value for cloud
      var rndmx = 250+(400)*(Math.random()-0.5);
      //random change in y from previous cloud
      var rndmdy = 500*Math.random();
      //push the new cloud into the clouds list
      clds.push(new platform(rndmx, (clds[clds.length - 1]).y - rndmdy,256, 140, "normal",0,"right","images/cloud.png",  "image",0));
   }
}
var cloudOp = function(bright)
{
    //calculate the cloud opacity
    //if the sky is too dark, clouds should not be visible
    if (bright<0.5)
    {
        return 0;
    }
    else {
      //clouds should be visible
        return 2*(bright - 0.5);
    }
}
var renderClouds = function(clds){
    //loop through the clouds list
    for (var i = 0; i < clds.length; i++)
    {
        var cld = clds[i];
        //make a component used to render the cloud
        var render = new component(cld.x+cld.offset,cld.y+cld.height/2+scrollHeight/2,0,cld.width,cld.height, cld.color, cld.type,cloudOp(bright));
        //display the compoenent
        render.display();
    }
}
var deleteClouds = function(clds){
    //remove clouds when they get under the screen
    while((clds[0]).y+scrollHeight/2 > 800)
    {
        //removes clouds at the front of the list, which are the lowest lying ones.
        clds.shift();
    }
}
var renderJumper = function(jmpr){
    //jumper y should be calculated based on the scroll hieght at that moment
    jmpr.y = 700 - (jumperHeight - scrollHeight) - jmpr.height/2;
    //display the jumper
    jmpr.display();
    //we also need to render his counterpart on the other side of map when character is on edge.
    var jmpr2 = jmpr
    if (jmpr2.x > 350)
    {
        jmpr2.x -=500
    }
    else {
        jmpr2.x +=500
    }
    //display counterpart
    jmpr2.display();
}
var renderPlatforms = function(pltfrms){
  //loop through the platforms list and render them
    for (var i = 0; i < pltfrms.length; i++)
    {
        var pltfrm = pltfrms[i];
        //render compensating for scrollheight
        var render = new component(pltfrm.x+pltfrm.offset,pltfrm.y+pltfrm.height/2+scrollHeight,0,pltfrm.width,pltfrm.height, pltfrm.color, pltfrm.type,1);
        render.display();
    }
}
var renderBackround = function(bckrnd){
  //render the backround rectangel componenet
  //calculate the brightness of the overall enviroment using day night cycle
  bright = 0.6+0.4*Math.cos(totalFrames/500);
  //rgb values dependent on brightness
  var red  = (Math.floor(bright*160)).toString(16);
  var green = (Math.floor(bright*222)).toString(16);
  var blue = (Math.floor(bright*255)).toString(16);
  //put them together to form a hexadecimal color value.
  bckrnd.changeColor("#" + red + green+ blue);
  bckrnd.display();
  //total frames rendered increases by 1
  totalFrames +=1;
}
var makePlatforms = function(pltfrms){
  //add to the platforms list while the highest platform is in the canvas
  while(highestPlat+scrollHeight > 0){
    var moving;
    //with probability increasing with difficulty, make a fake red platform randomly
    if (Math.random()<(0.05+difficulty*0.4)){
      rndmfakex = 250+(400)*(Math.random()-0.5);
      rndmfakedy = (0.5*Math.random()+0.75)*minGap/2;
      pltfrms.push(new platform(rndmfakex, highestPlat-rndmfakedy,80, platheight, "fake",0,"right","images/red.png",  "image",0));
    }
    //making the normal platforms
    var rndmx = 250+(400)*(Math.random()-0.5);
    if (Math.random()<(0.1+difficulty*0.7)){//moving
      moving = true;
      rndmdy = (maxGap - minGap)*Math.random()+minGap;
      highestPlat-=rndmdy;
      var speed = 3*(Math.random()+1)
      if (Math.random()<0.5){
        //0.1 chance of spring attatched to platform
        if (Math.random()<(0.1)){
            pltfrms.push(new platform(rndmx, highestPlat - 10,10, 10, "mspring",speed,"right","images/spring.png",  "image",70*(Math.random()-0.5)));
        }
        //insert platform
        pltfrms.push(new platform(rndmx, highestPlat,80, platheight, "moving",speed,"right","images/blue.png",  "image",0));
      }
      else {
        //0.1 chance of spring attatched to platform
        if (Math.random()<(0.1)){
            pltfrms.push(new platform(rndmx, highestPlat - 10,10, 10, "mspring",speed,"left","images/spring.png",  "image",70*(Math.random()-0.5)));
        }
        //insert platform
        pltfrms.push(new platform(rndmx, highestPlat,80, platheight, "moving",speed,"left","images/blue.png",  "image",0));
      }

    }
    else{//notmoving
      moving = false;
      rndmdy = (maxGap - minGap)*Math.random()+minGap;
      highestPlat-=rndmdy;
      //0.1 chance of spring
      if (Math.random()<(0.1)){
          pltfrms.push(new platform(rndmx, highestPlat - 10,10, 10, "spring",0,"right","images/spring.png",  "image",70*(Math.random()-0.5)));
      }
      //insert stationary platform.
      pltfrms.push(new platform(rndmx, highestPlat,80, platheight, "normal",0,"right","images/green.png",  "image",0));
    }

  }
}
var movePlatforms = function(pltfrms)
{   //this function moves all the platforms that have type moving including moving springs
    for (var i = 0; i < pltfrms.length; i++)
    {//loop through platforms list and move them accordingly
        pltfrm = pltfrms[i];
        if (pltfrm.platformType == "moving" || pltfrm.platformType == "mspring"){
            if (pltfrm.dir == "right"){
                pltfrm.x += pltfrm.speed;
            }
            else if (pltfrm.dir == "left"){
                pltfrm.x -= pltfrm.speed;
            }
            //if it hits the edge, change direction
            if (Math.abs(pltfrm.x-250)>250 - 80/2)
            {
              if (pltfrm.dir == "right"){
                  pltfrm.dir = "left";
              }
              else if (pltfrm.dir == "left"){
                  pltfrm.dir  = "right";
              }
            }
        }
    }
}
//delete platforms under the canvas
var deletePlatforms = function(pltfrms){
    //while the lowest platform is under the edge, remove it.
    while(lowestPlat+scrollHeight > 700)
    {
        pltfrms.shift();
        var nextPlat = pltfrms[0];
        lowestPlat = nextPlat.y;
    }
}
var collide = function(jmpr, pltfrm,pltfrms)
{
    //if it is under the platform for the first time
    if (jumperHeight <= 700 - pltfrm.y && jmpr.prevY >= 700 - pltfrm.y){
        //if it is close enough to platform
        if (Math.abs(pltfrm.x+pltfrm.offset  - jmpr.x) < (pltfrm.width+jmpr.width)/2){
          //if it is fake, just delete that platform
            if(pltfrm.platformType == "fake")
            {
                breakk.cloneNode().play();
                pltfrms.splice(pltfrms.indexOf(pltfrm),1)
            }
            else {
              //we resolve collision with function
                resolveCollision(jmpr, pltfrm);
            }

        }
    }
}
var collideAll = function(jmpr, pltfrms)
{
    for (var i = 0; i < pltfrms.length; i++){
        pltfrm = pltfrms[i];
        collide(jmpr,pltfrm,pltfrms);
    }
}

var resolveCollision = function(jmpr, pltfrm)
{
    //if it is spring, make it jump higher
    if (pltfrm.platformType =="mspring" || pltfrm.platformType =="spring"){
      jmpr.yVel = Math.max(2*jumpForce, jmpr.yVel);
      pltfrm.y -=10;
      pltfrm.height +=10
      //play sound
      boing.cloneNode().play();
    }
    else {
      //else just set it to normal force
      jmpr.yVel = Math.max(jumpForce, jmpr.yVel);
      jump.cloneNode().play();
    }
}
var backoutCollision = function(jmpr,pltfrms){
  //this function makes sure that the jumper is not inside the block by moving it out 1 pixel at a time.
    for (var i = 0; i < pltfrms.length; i++){
      pltfrm = pltfrms[i];
      if (pltfrm.platformType != "fake"){
        if (jumperHeight <= 700 - pltfrm.y && jmpr.prevY >= 700 - pltfrm.y){

          if (Math.abs(pltfrm.x+pltfrm.offset  - jmpr.x) < (pltfrm.width+jmpr.width)/2){
              while (jumperHeight <= 700 - pltfrm.y){
                jumperHeight +=1;
              }
          }
        }
      }
    }
}
var updateJumperVars = function(jmpr)
{
    //jumper y velocity subject to gravity
    jmpr.yVel -= gravity;
    //if left key pressed move left
    if (myGameArea.keys && myGameArea.keys[37]){
        jmpr.xVel -= 1.4;
    }
    //if right key pressed move right
    if (myGameArea.keys && myGameArea.keys[39]){
        jmpr.xVel += 1.4;
    }
    //make xvel not go to infinity by mulltiplying it by 0.9
    jmpr.xVel *= 0.9;
    //change the height of the jumper and the x
    jumperHeight += jmpr.yVel;
    jmpr.x += jmpr.xVel;
    //if it is too far to the right or to the left, move it to other side of screen.
    if (jmpr.x > myGameArea.canvas.width){
        jmpr.x -=myGameArea.canvas.width;
    }
    if (jmpr.x < 0){
        jmpr.x +=myGameArea.canvas.width;
    }
}
var updateScrollHeight = function(){
  //make scroll height get closer to the maximum target height
    maxHeight = Math.max(jumperHeight,maxHeight);
    scrollHeight += (maxHeight-scrollHeight-350)/20;
}
var displayScore = function(){
  //write the score in the top left hand corner
    ctx = myGameArea.canvas.getContext("2d");
    ctx.font = "30px Arial";
    ctx.fillText(Math.floor(maxHeight), 10, 35);
}
var updateDifficulty = function(){
  //update the difficulty setting by increasing it closer to 1
    difficulty = 1 - 15000/(maxHeight+15000);
    minGap = 165 * difficulty + 20;
    maxGap = 125 * difficulty + 60;
}
var animate = function(jmpr){
  //animate the character based on how fast its moving
  if (jmpr.xVel < 0){//moving left
    if (jmpr.yVel < jumpForce/2){jmpr.changeColor("images/character1.png");}
    else {jmpr.changeColor("images/characterjump1.png");}
  }
  else {//moving right
    if (jmpr.yVel < jumpForce/2){jmpr.changeColor("images/character2.png");}
    else {jmpr.changeColor("images/characterjump2.png");}
  }
}
var checkDead = function(){
    if ((jumperHeight - scrollHeight) < -100)
    {//check whether jumper is under canvas
      dead = true;
      //set highscore to the hieghest score
      highscore = Math.max(highscore, Math.floor(maxHeight));
      ctx = myGameArea.canvas.getContext("2d");
      ctx.font = "30px Arial";
      ctx.fillText("Game Over", 100, 250);
      ctx.fillText("Press space to try again", 100, 300);
      ctx.fillText("Your highscore is " + highscore, 100, 350);
      restimer += 1;
      if (!fallplayed){
          fall.cloneNode().play();
          fallplayed = true;
      }
      if (myGameArea.keys && myGameArea.keys[32] && restimer > 10)
      {
        //reset all variables when key space is pressed to retry
        fallplayed = false;
        scrollHeight=0;
        maxHeight = 0;
        minGap=20;
        maxGap=60;
        gravity = 0.5;
        jumpForce  = 14;
        highestPlat = 650;
        lowestPlat = 650;
        jumperHeight = 55;
        platforms;
        clouds;
        difficulty = 0;
        backround;
        platheight = 19.3;
        totalFrames = 0;
        jumper = new component(250, 600,0, 40, 60, "images/character1.png",  "image",1);
        backround = new component(250, 350,0, 500, 700, "#a0deff",  "",1);
        clouds = [];
        clouds.push(new platform(150, 500,256, 140, "normal",0,"right","images/cloud.png",  "image",0));
        var startPltfrm = new platform(250, 650,80, platheight, "normal",0,"right","images/green.png",  "image",0);
        platforms = [];
        platforms.push(startPltfrm);
        dead = false;
        restimer = 0;
      }
    }
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
      //make the canvas and stuff.
        this.canvas.width = 500;
        this.canvas.height = 700;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[4]);
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
        })
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function platform(x, y, width, height, platformType, speed, dir,color, type,offset) {
    this.type = type;
    this.color = color;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.offset = offset;
    this.platformType = platformType;
    this.speed = speed;
    this.dir = "right";
}
function component(x, y, dir, width, height, color, type,transparency) {
    this.type = type;
    if (type == "image") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.xVel = 0;
    this.yVel = 0;
    this.prevY = scrollHeight;
    this.color = color;
    this.display = function(){
        ctx = myGameArea.context;
        if (type == "image") {
            ctx.save();
            ctx.globalAlpha = transparency;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.dir);
            ctx.fillStyle = this.color;
            ctx.drawImage(this.image, this.width / -2, this.height / -2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.save();
            ctx.globalAlpha = transparency;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.dir);
            ctx.fillStyle = this.color;
            ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
            ctx.restore();
        }
    }
    this.changeColor = function(newcolor){
      this.color = newcolor;
      if (type == "image"){
          this.image.src = newcolor;
      }
    }

}
function updateGameArea() {
  //while not dead do all the stuff.
    if (!dead){
      myGameArea.clear();
      makeClouds(clouds);
      makePlatforms(platforms);
      deletePlatforms(platforms);
      deleteClouds(clouds);
      movePlatforms(platforms);
      updateJumperVars(jumper);
      collideAll(jumper,platforms);
      backoutCollision(jumper,platforms);
      updateScrollHeight();
      animate(jumper);
      renderBackround(backround);
      renderClouds(clouds);
      renderPlatforms(platforms);
      renderJumper(jumper);
      displayScore();
      updateDifficulty();
      jumper.prevY = jumperHeight;
    }
    checkDead();
}
