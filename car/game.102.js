var wheelBehind;
var wheelAhead;
var car1;
var terrain;
var gravity = 0.15;
function reset() {
  ctx = myGameArea.context;
  ctx.font = "50px Arial";
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.fillText("Press Space to Play Again", 350, 350);
  ctx.strokeText("Press Space to Play Again", 350, 350);
  if (myGameArea.keys[32])
  {
    wheelBehind = new wheel(601, 100,0, 16, "wheel.png",  "image");
    wheelAhead = new wheel(599, 100,0, 16, "wheel.png",  "image");
    car1 = new car(wheelAhead,wheelBehind, 40,25, "Car.png","image");
    terrain = new terrain([], 100);
    terrain.createInitialTerrain();
    terrain.scrollX = 0;
    terrain.scrollY = 0;
  }
}
function startGame() {
    wheelBehind = new wheel(601, 100,0, 16, "wheel.png",  "image");
    wheelAhead = new wheel(599, 100,0, 16, "wheel.png",  "image");
    car1 = new car(wheelAhead,wheelBehind, 40,25, "Car.png","image");
    terrain = new terrain([], 100);
    terrain.createInitialTerrain();
    myGameArea.start();
}
var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
      //make the canvas and stuff.
        this.canvas.width = 1200;
        this.canvas.height = 700;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);

        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
        })
        window.addEventListener('touchmove', function (e) {
          myGameArea.x = e.touches[0].screenX;
          myGameArea.y = e.touches[0].screenY;
        })

        window.addEventListener("keydown", function(e) {
    // space, page up, page down and arrow keys:
    if([32, 33, 34, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);
    },
    clear : function() {
      this.context.fillStyle = "#87cefa";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
function impulses(impX, impY, impAng)
{
  this.impX = impX;
  this.impY = impY;
  this.impAng = impAng;
}
function car(wheelAhead, wheelBehind, l1, l2, color, type)
{
  this.type = type;
  if (type == "image") {
      this.image = new Image();
      this.image.src = color;
  }
  this.mass = 10;
  this.wheelAhead = wheelAhead;
  this.wheelBehind = wheelBehind;
  this.l1 = l1;
  this.l2 = l2;
  this.angleCOG = Math.atan(l2/l1);
  this.lengthCOG = Math.sqrt(l1 * l1 + l2 * l2);
  this.kHorizontal = 0.3;
  this.kVerticle = 0.12;

  this.springX = 0;
  this.springY = 0;
  this.springX1 = 0;
  this.springY1 = 0;

  this.springXP = 0;
  this.springYP = 0;
  this.springX1P = 0;
  this.springY1P = 0;

  this.springDamp = 0.15;

  this.x = 350;
  this.y = 350;
  this.xVel = 0;
  this.yVel = 0;


  this.wheelAhead.x = (l1 + this.x);
  this.wheelAhead.y = (l2 + this.y);
  this.wheelBehind.x = (-l1 + this.x);
  this.wheelBehind.y = (l2 + this.y);

  this.xImp = 0;
  this.yImp = 0;

  this.dir = 0;
  this.angVel = 0;
  this.angImp = 0;
  this.display = function(){
      ctx = myGameArea.context;
      ctx.save();
      ctx.translate(this.x -terrain.scrollX, this.y -terrain.scrollY);
      ctx.rotate(this.dir);
      ctx.fillStyle = this.color;
      if (this.type == "image")
          ctx.drawImage(this.image, -64, -42, 128, 64);
      else
          ctx.fillRect(this.l1 / -1, 10 / -1, 2*this.l1, 2*10);
      ctx.restore();
  }
  this.displayScore = function(){
     ctx = myGameArea.context;
     ctx.font = "50px Arial";
     ctx.fillStyle = '#FFFFFF';
     ctx.strokeStyle = '#000000';
     ctx.lineWidth = 1;
     ctx.fillText("Score: " + Math.floor((this.x-350)/100), 10, 50);
     ctx.strokeText("Score: " + Math.floor((this.x-350)/100), 10, 50);
  }
  this.springForcesAll  = function()
  {

    var carXRot = this.x * Math.cos(this.dir) + this.y * Math.sin(this.dir);
    var carYRot = -this.y * Math.cos(this.dir) + this.x * Math.sin(this.dir);

    var wheelXRot = this.wheelBehind.x * Math.cos(this.dir) + this.wheelBehind.y * Math.sin(this.dir);
    var wheelYRot = -this.wheelBehind.y * Math.cos(this.dir) + this.wheelBehind.x * Math.sin(this.dir);

    this.springX = carXRot - this.l1 - wheelXRot;
    this.springY = carYRot - this.l2 - wheelYRot;

    var wheelxImpRot = this.springX * this.kHorizontal + this.springDamp*(this.springX - this.springXP);
    var wheelyImpRot = this.springY * this.kVerticle+this.springDamp*(this.springY - this.springYP);

    this.springXP = this.springX;
    this.springYP = this.springY;

    this.wheelBehind.xImp += wheelxImpRot * Math.cos(this.dir) + wheelyImpRot * Math.sin(this.dir);
    this.wheelBehind.yImp += -wheelyImpRot * Math.cos(this.dir) + wheelxImpRot * Math.sin(this.dir);

    var wheelXRot1 = this.wheelAhead.x * Math.cos(this.dir) + this.wheelAhead.y * Math.sin(this.dir);
    var wheelYRot1 = -this.wheelAhead.y * Math.cos(this.dir) + this.wheelAhead.x * Math.sin(this.dir);

    this.springX1 = carXRot + this.l1 - wheelXRot1;
    this.springY1 = carYRot - this.l2 - wheelYRot1;

    var wheelxImpRot1 = this.springX1 * this.kHorizontal+ this.springDamp*(this.springX1 - this.springX1P);
    var wheelyImpRot1 = this.springY1 * this.kVerticle+ this.springDamp*(this.springY1 - this.springY1P);

    this.springX1P = this.springX1;
    this.springY1P = this.springY1;

    this.wheelAhead.xImp += wheelxImpRot1 * Math.cos(this.dir) + wheelyImpRot1 * Math.sin(this.dir);
    this.wheelAhead.yImp += -wheelyImpRot1 * Math.cos(this.dir) + wheelxImpRot1 * Math.sin(this.dir);

    var carXImpRot = -(wheelxImpRot1 + wheelxImpRot)/this.mass;
    var carYImpRot = -(wheelyImpRot1 + wheelyImpRot)/this.mass;

    this.xImp = carXImpRot * Math.cos(this.dir) + carYImpRot * Math.sin(this.dir);
    this.yImp = -carYImpRot * Math.cos(this.dir) + carXImpRot * Math.sin(this.dir);

    this.angImp = this.lengthCOG * ((wheelyImpRot1*Math.cos(this.angleCOG) + wheelxImpRot1*Math.sin(this.angleCOG))-(wheelyImpRot*Math.cos(this.angleCOG) - wheelxImpRot*Math.sin(this.angleCOG)))/(1/3 * this.mass *this.l1 * this.l1);

  }
  this.doForces = function()
  {
    this.yImp +=gravity;
    this.yVel += this.yImp;
    this.xVel += this.xImp;
    this.angVel += this.angImp;
    this.dir += this.angVel;
    this.x += this.xVel;
    this.y += this.yVel;
  }
  this.controls = function()
  {
    if (myGameArea.keys && myGameArea.keys[39] || (myGameArea.x && myGameArea.y && myGameArea.x > 600))
    {
      this.wheelBehind.angImp += 0.1;
    }
    if (myGameArea.keys && myGameArea.keys[37] || (myGameArea.x && myGameArea.y && myGameArea.x < 600))
    {
      this.wheelBehind.angImp -= 0.1;
    }
  }
  this.dead = function()
  {
    var x = this.x + 50 * Math.sin(this.dir);
    var y = this.y - 50 * Math.cos(this.dir);
    return terrain.point(x,y);
  }
  /*this.setWheels = function()
  {
    this.wheelAhead.x = this.x - this.l2 * Math.sin(this.dir) + this.l1 * Math.cos(this.dir);
    this.wheelAhead.y = this.y + this.l2 * Math.cos(this.dir) + this.l1 * Math.sin(this.dir);

    this.wheelBehind.x = this.x - this.l2 * Math.sin(this.dir) - this.l1 * Math.cos(this.dir);
    this.wheelBehind.y = this.y + this.l2 * Math.cos(this.dir) - this.l1 * Math.sin(this.dir);

    this.wheelAhead.xVel = this.xVel - this.angVel * this.lengthCOG * Math.sin(this.dir + this.angleCOG);
    this.wheelAhead.yVel = this.yVel + this.angVel * this.lengthCOG * Math.cos(this.dir + this.angleCOG);

    this.wheelBehind.xVel = this.xVel + this.angVel * this.lengthCOG * Math.sin(this.dir - this.angleCOG);
    this.wheelBehind.yVel = this.yVel - this.angVel * this.lengthCOG * Math.cos(this.dir - this.angleCOG);
  }
  this.setCar = function()
  {
    this.xVel += (this.wheelAhead.xImp + this.wheelBehind.xImp);
    this.yVel += (this.wheelAhead.yImp + this.wheelBehind.yImp);

    this.x += this.xVel;
    this.y += this.yVel;
    this.angVel += 2/this.lengthCOG * (this.wheelAhead.yImp * Math.cos(this.dir + this.angleCOG) - this.wheelAhead.xImp* Math.sin(this.dir + this.angleCOG));
    this.angVel += 2/this.lengthCOG * (this.wheelBehind.yImp * Math.cos(-this.dir + this.angleCOG) - this.wheelBehind.xImp* Math.sin(-this.dir + this.angleCOG));
  }*/
}
function wheel(x, y, dir, r, color, type) {
    this.type = type;
    if (type == "image") {
        this.image = new Image();
        this.image.src = color;
    }
    this.r = r;
    this.x = x;
    this.y = y;
    this.contactPoints = 0;

    this.bouncy = 0.2;
    this.sfriction = 2;
    this.kfriction = 1.6;

    this.xVel = 0;
    this.yVel = 0;
    this.xImp = 0;
    this.yImp = 0;

    this.dir = dir;
    this.angVel = 0;
    this.angImp = 0;

    this.color = color;
    this.display = function(){
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x -terrain.scrollX, this.y -terrain.scrollY)
        ctx.rotate(this.dir);
        ctx.fillStyle = this.color;
        if (type == "image")
            ctx.drawImage(this.image, this.r / -1, this.r / -1, 2*this.r, 2*this.r);
        else
            ctx.fillRect(this.r / -1, this.r / -1, 2*this.r, 2*this.r);
        ctx.restore();
    }
    this.changeColor = function(newcolor){
      this.color = newcolor;
      if (type == "image"){
          this.image.src = newcolor;
      }
    }
    this.resetImp = function()
    {
            this.contactPoints = 0;
            this.yImp =0 ;
            this.xImp =0 ;
            this.angImp =0 ;
    }
    this.calculateImpulse = function(platAng)
    {
      var rotXVel = this.xVel * Math.cos(platAng) + this.yVel * Math.sin(platAng);
      var rotYVel = -this.yVel * Math.cos(platAng) + this.xVel * Math.sin(platAng);
      var rotXImp;
      var rotYImp;
      rotYImp = -rotYVel * (1 + this.bouncy);
      if (Math.abs(this.angVel * this.r - rotXVel) / 3 < Math.abs(this.sfriction * rotYImp))
      {
        rotXImp = (this.angVel * this.r - rotXVel) / 3;
      }
      else
      {
        if (this.angVel * this.r > rotXVel)
        {
          rotXImp = Math.abs(this.kfriction * rotYImp);
        }
        else
        {
          rotXImp = -Math.abs(this.kfriction * rotYImp);
        }
      }
      this.angImp += -2/this.r * rotXImp/this.contactPoints;

      this.xImp += rotXImp * Math.cos(platAng) + rotYImp * Math.sin(platAng)/this.contactPoints;
      this.yImp += -rotYImp * Math.cos(platAng) + rotXImp * Math.sin(platAng)/this.contactPoints;
    }
    this.intersection = function(x1,y1,x2,y2)
    {
      var e1x = x2 - x1;
      var e1y = y2 - y1;
      var area = e1x * e1x + e1y * e1y;
      var e2x = this.x - x1;
      var e2y = this.y - y1;
      var val = e1x * e2x + e1y * e2y;
      var on =  (val > 0 && val < area);

      var lenE1 = Math.sqrt(e1x * e1x + e1y * e1y);
      var lenE2 = Math.sqrt(e2x * e2x + e2y * e2y);
      var cos = val/(lenE1 * lenE2);

      var projLen = cos * lenE2;
      var px = x1 + (projLen * e1x)/lenE1;
      var py = y1 + (projLen * e1y)/lenE1;
      var distance = Math.sqrt((px - this.x) * (px - this.x) + (py - this.y) * (py - this.y));
      return (on && distance < this.r);
    }
    this.intersectPoint = function(x,y)
    {
      var distance = Math.sqrt((x - this.x) * (x - this.x) + (y - this.y)*(y - this.y));
      return (distance < this.r);
    }
    this.doforces = function()
    {
      this.yImp +=gravity;
      this.yVel += this.yImp;
      this.xVel += this.xImp;
      this.angVel += this.angImp;
      this.dir += this.angVel;
      this.x += this.xVel;
      this.y += this.yVel;
      this.angVel *= 0.97;
    }
}
function terrain(arrY, dx)
{
  this.maxY = 0;
  this.scrollX = 0;
  this.scrollY = 0;
  this.arrY = arrY;
  this.dx = dx;
  this.y = 400;
  this.dy = 0;
  this.ddy = 0;
  this.difficulty = 100;
  this.startOffset = 0;
  this.startInd = 0;
  this.display = function(){
      ctx = myGameArea.context;
      ctx.fillStyle = '#69512e';
      ctx.beginPath();
      ctx.moveTo( this.startOffset * this.dx- this.scrollX,this.maxY + 2000 -this.scrollY);
      for (var i = this.startInd; i < arrY.length; i++)
      {
        ctx.lineTo((i+this.startOffset) * this.dx - this.scrollX, arrY[i] -this.scrollY);
        ctx.lineWidth = 8;
	      ctx.strokeStyle = '#268b07';
      }
      ctx.lineTo((arrY.length+this.startOffset)* this.dx - this.scrollX, this.maxY + 2000 -this.scrollY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
  }
  this.updateStartInd = function()
  {
    this.startInd = Math.floor(this.scrollX/this.dx -  this.startOffset) - 1;
  }
  this.point = function(x,y)
  {
    for (var i = this.startInd ; i < this.arrY.length - 1; i++)
    {
      var y1 = this.arrY[i];
      var x1 = (i+this.startOffset) * this.dx;
      var y2 = this.arrY[i+1];
      var x2 = (i+1+this.startOffset) * this.dx;
      var area = (x1*y2 + x2*y + x * y1 - x1 * y - x2 * y1 - x * y2)/2;
      if (area > 0 && x1 < x && x < x2)
      {
        return true;
      }
    }
    return false;
  }
  this.createInitialTerrain = function()
  {
    for (var i =0; i<12;i++)
    {
      this.arrY[i] = 400;
    }
    /*for (var i = 12; i <200; i++)
    {
      this.ddy += 20*(Math.random()-0.5)-this.dy/5 - this.ddy/10;
      this.dy+=this.ddy;
      this.y+=this.dy;
      this.arrY[i] = this.y;
      this.maxY = Math.max(this.maxY, this.y);
    }*/
    /*var temp = [400,400,400,400,400,400,400,400,400,400,400,400];
    for (var i = 12; i < 200; i++)
    {
      temp.push((Math.random()-0.5) *this.difficulty+ 400);

      this.difficulty+=1;
    }

    this.arrY.push(temp[0]);
    this.arrY.push(temp[1]);
    this.arrY.push(temp[2]);
    for (var i = 3; i < 197; i++)
    {
      this.arrY.push((temp[i-3]+6*temp[i-2] + 15*temp[i-1]+ 20 * temp[i] + 15*temp[i+1] + 6*temp[i+2] + temp[i+3])/64);
    }
    this.arrY.push(temp[198]);
    this.arrY.push(temp[199]);
    this.arrY.push(temp[200]);*/
  }
  this.makeNewTerrain = function()
  {
    while ((this.arrY.length + this.startOffset - 2)*this.dx- this.scrollX < 1200)
    {
      this.ddy += 20*(Math.random()-0.5)-this.dy/5 - this.ddy/10;
      this.dy+=this.ddy;
      this.y+=this.dy;
      this.arrY[this.arrY.length] = this.y;
      this.maxY = Math.max(this.maxY, this.y);
    }
  }

  this.updateScroll = function()
  {
    this.scrollX += (car1.x -300 - this.scrollX)/20;
    this.scrollY += (car1.y -350- this.scrollY)/20;
  }
  this.intersection = function(wheel1){

    var flat = false;

wheel1.contactPoints = 1;
    for (var i = this.startInd; i < this.arrY.length - 1; i++)
    {
      var inter = wheel1.intersection(this.dx * (i+this.startOffset),this.arrY[i], this.dx*(i + 1+this.startOffset), this.arrY[i+1]);
      if (inter)
      {
        this.resolveIntersection(wheel1, Math.atan((this.arrY[i+1] - this.arrY[i])/(this.dx)),i);
        flat = true;
      }
    }

    if (!flat)
    {
      wheel1.contactPoints = 1;
      for (var i = this.startInd; i < this.arrY.length; i++)
      {
        var inter = wheel1.intersectPoint(this.dx * (i+this.startOffset),this.arrY[i]);
        if (inter)
        {
          this.resolvePoint(wheel1, i);
        }
      }
    }
  }
  this.resolvePoint = function(wheel1, i)
  {
    var x = this.dx * (i+this.startOffset);
    var y = this.arrY[i];
    var dist = Math.sqrt((wheel1.x - x) * (wheel1.x - x) + (wheel1.y - y) * (wheel1.y - y) );
    var dx = wheel1.r / dist * (wheel1.x - x);
    var dy = wheel1.r / dist * (wheel1.y - y);
    wheel1.x = x + dx;
    wheel1.y = y + dy;
    wheel1.calculateImpulse(-Math.atan((wheel1.x - x)/(wheel1.y - y)));
  }
  this.resolveIntersection = function(wheel1, ang, i)
  {
    var x1 = this.dx * (i+this.startOffset);
    var x2 = this.dx * (i+1+this.startOffset);
    var y1 = this.arrY[i];
    var y2 = this.arrY[i+1];

    var e1x = x2 - x1;
    var e1y = y2 - y1;
    var area = e1x * e1x + e1y * e1y;
    var e2x = wheel1.x - x1;
    var e2y = wheel1.y - y1;
    var val = e1x * e2x + e1y * e2y;

    var lenE1 = Math.sqrt(e1x * e1x + e1y * e1y);
    var lenE2 = Math.sqrt(e2x * e2x + e2y * e2y);
    var cos = val/(lenE1 * lenE2);

    var projLen = cos * lenE2;
    var px = x1 + (projLen * e1x)/lenE1;
    var py = y1 + (projLen * e1y)/lenE1;

    wheel1.x = px + wheel1.r * Math.sin(ang);
    wheel1.y = py - wheel1.r * Math.cos(ang);
    wheel1.calculateImpulse(ang);
  }
}
function updateGameArea() {
    if (!car1.dead())
    {
      myGameArea.clear();
      terrain.updateStartInd();
      terrain.makeNewTerrain();
      car1.wheelAhead.resetImp();
      car1.wheelBehind.resetImp();
      car1.springForcesAll();
      terrain.intersection(wheelAhead);
      terrain.intersection(wheelBehind);


      car1.controls();
      wheelAhead.doforces();
      wheelBehind.doforces();

      car1.doForces();
      terrain.updateScroll();

      terrain.display();
      car1.displayScore();
      wheelAhead.display();
      wheelBehind.display();
      car1.display();
    }
    else {
      reset();
    }
}
