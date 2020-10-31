function startGame() {
    myGameArea.start();
}
var car1;
var terrain;
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
        makeCarTerrain();
    },
    clear : function() {
      this.context.fillStyle = "#87cefa";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
function makeCarTerrain()
{
  var points = [new Point(310,350,310,350,6,0.6,0.4,0.2),new Point(390,350,390,350,6,0.6,0.4,0.2)];
  var wheels = [new Wheel(270,390,270,390,1,25,0,0,1,0.8,0.1),new Wheel(430,390,430,390,1,25,0,0,1,0.8,0.1)];;
  car1 = new Car(points, wheels);
  terrain = new Terrain1([],100);
  var thing = [500];
  for (var i =0; i <200; i++)
  {
    thing[i] = 500+300*Math.random();
  }
  for (var i = 1; i< 200;i++)
  {
    terrain.arrY[i] =(6*thing[i] + 4*thing[i-1]+4*thing[i+1]+thing[i-2]+thing[i+2])/16;
  }
}
var Point = function(x,y,oldX,oldY,mass,sFriction,kFriction, bouncy)
{
  this.x = x;
  this.y = y;
  this.oldX = oldX;
  this.oldY = oldY;
  this.mass = mass;
  this.sFriction = sFriction;
  this.kFriction = kFriction;
  this.bouncy = bouncy;
  this.doStep = function()
  {
    var temp = this.x;
    this.x = 2*this.x - this.oldX;
    this.oldX = temp;

    temp = this.y;
    this.y = 2*this.y - this.oldY + 0.3;
    this.oldY = temp;
  }
  this.intersectionCheck = function(x1,y1,x2,y2)
  {
    var ang = Math.atan((y2-y1)/(x2-x1));
    var pointRot = (new Vector(this.x,this.y)).rotate(-ang);
    var pointRot1 = (new Vector(x1,y1)).rotate(-ang);
    var pointRot2 = (new Vector(x2,y2)).rotate(-ang);
    return (this.x >= x1 && this.x <= x2 && pointRot.y >= pointRot1.y);
  }
  this.intersectionResolve = function(x1,y1,x2,y2)
  {
    var ang = Math.atan((y2-y1)/(x2-x1));
    var pointRot = (new Vector(this.x,this.y)).rotate(-ang);
    var pointRot1 = (new Vector(x1,y1)).rotate(-ang);
    var pointRot2 = (new Vector(x2,y2)).rotate(-ang);

    var xVel = this.x - this.oldX;
    var yVel = this.y - this.oldY;

    var velRot = (new Vector(xVel,yVel)).rotate(-ang);
    var yImpRot = -velRot.y*(1+this.bouncy);
    var xImpRot;
    if (Math.abs(yImpRot*this.sFriction) > Math.abs(velRot.x))
    {
      xImpRot = - velRot.x;
    }
    else {
      if (velRot.x>0)
      {
        xImpRot = -Math.abs(yImpRot*this.kFriction);
      }
      else {
        xImpRot = Math.abs(yImpRot*this.kFriction);
      }
    }
    var newVel = (new Vector(velRot.x+xImpRot,velRot.y+yImpRot)).rotate(ang);
    this.pointBackOut(x1,y1,x2,y2);
    this.oldX = this.x - newVel.x;
    this.oldY = this.y - newVel.y;
  }
  this.pointBackOut = function(x1,y1,x2,y2)
  {
    var e1x = x2 - x1;
    var e1y = y2 - y1;
    var area = e1x * e1x + e1y * e1y;
    var e2x = this.x - x1;
    var e2y = this.y - y1;
    var val = e1x * e2x + e1y * e2y;

    var lenE1 = Math.sqrt(e1x * e1x + e1y * e1y);
    var lenE2 = Math.sqrt(e2x * e2x + e2y * e2y);
    var cos = val/(lenE1 * lenE2);

    var projLen = cos * lenE2;
    var px = x1 + (projLen * e1x)/lenE1;
    var py = y1 + (projLen * e1y)/lenE1;

    this.x = px;
    this.y = py;
  }
  this.pointIntersection = function()
  {
    for (var i = 0 ; i < terrain.arrY.length - 1; i++)
    {
      if (this.intersectionCheck(i*terrain.dx, terrain.arrY[i],(i+1)*terrain.dx, terrain.arrY[i+1]))
      {
        this.intersectionResolve(i*terrain.dx, terrain.arrY[i],(i+1)*terrain.dx, terrain.arrY[i+1]);
      }
    }
  }
}
var Wheel = function(x,y,oldX,oldY,mass,r,ang,angVel,sFriction, kFriction, bouncy)
{
  this.image = new Image();
  this.image.src = "wheel.png";

  this.x = x;
  this.y = y;
  this.oldX = oldX;
  this.oldY = oldY;
  this.mass = mass;
  this.r = r;
  this.ang = ang;
  this.angVel = angVel;
  this.sFriction = sFriction;
  this.kFriction = kFriction;
  this.bouncy = bouncy;
  this.display = function(){
      ctx = myGameArea.context;
      ctx.save();
      ctx.translate(this.x -terrain.scrollX, this.y-terrain.scrollY )
      ctx.rotate(this.ang);
      ctx.fillStyle = "wheel.png";
      ctx.drawImage(this.image, -this.r , -this.r, 2*this.r, 2*this.r);
      ctx.restore();
  }
  this.wheelIntersection = function()
  {
    for (var i = 0 ; i < terrain.arrY.length - 1; i++)
    {
      if (this.intersectionCheck(i*terrain.dx, terrain.arrY[i],(i+1)*terrain.dx, terrain.arrY[i+1]))
      {
        this.intersectionResolve(Math.atan((terrain.arrY[i+1]-terrain.arrY[i])/terrain.dx), false, i);
      }
      if (this.intersectionCheckPoint(i*terrain.dx,terrain.arrY[i]))
      {
        this.intersectionResolve(
          -Math.atan((this.x - i * terrain.dx)/(this.y-terrain.arrY[i])),
          true,i);
      }
    }
  }
  this.doStep = function()
  {
    var temp = this.x;
    this.x = 2*this.x - this.oldX;
    this.oldX = temp;

    temp = this.y;
    this.y = 2*this.y - this.oldY + 0.3;
    this.oldY = temp;

    this.ang += this.angVel;
  }
  this.intersectionCheck = function(x1,y1,x2,y2)
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
  this.intersectionCheckPoint = function(x1,y1)
  {
    var xDiff = x1-this.x;
    var yDiff = y1 - this.y;
    return (xDiff*xDiff + yDiff * yDiff <=this.r*this.r);
  }
  this.intersectBackOutPoint = function(i)
  {
    var x = terrain.dx * (i);
    var y = terrain.arrY[i];
    var dist = Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y) );
    var dx = this.r / dist * (this.x - x);
    var dy = this.r / dist * (this.y - y);
    this.x = x + dx;
    this.y = y + dy;
  }
  this.intersectBackOut = function(ang, i)
  {
    var x1 = terrain.dx * (i);
    var x2 = terrain.dx * (i+1);
    var y1 = terrain.arrY[i];
    var y2 = terrain.arrY[i+1];

    var e1x = x2 - x1;
    var e1y = y2 - y1;
    var area = e1x * e1x + e1y * e1y;
    var e2x = this.x - x1;
    var e2y = this.y - y1;
    var val = e1x * e2x + e1y * e2y;

    var lenE1 = Math.sqrt(e1x * e1x + e1y * e1y);
    var lenE2 = Math.sqrt(e2x * e2x + e2y * e2y);
    var cos = val/(lenE1 * lenE2);

    var projLen = cos * lenE2;
    var px = x1 + (projLen * e1x)/lenE1;
    var py = y1 + (projLen * e1y)/lenE1;

    this.x = px + this.r * Math.sin(ang);
    this.y = py - this.r * Math.cos(ang);
  }
  this.intersectionResolve = function(platAng, point,i)
  {
    var xVel = this.x-this.oldX;
    var yVel = this.y-this.oldY;
    var rotateVelVector = (new Vector(xVel, yVel)).rotate(-platAng);
    var rotateYImp = -rotateVelVector.y*(1+this.bouncy);
    var rotateXImp;
    if (Math.abs(this.angVel * this.r - rotateVelVector.x)/3 < Math.abs(this.sFriction*rotateYImp))
    {
      rotateXImp = (this.angVel * this.r - rotateVelVector.x)/3;
    }
    else {
      if (this.angVel * this.r > rotateVelVector.x)
      {
        rotateXImp = Math.abs(this.kFriction*rotateYImp);
      }
      else
      {
        rotateXImp = -Math.abs(this.kFriction*rotateYImp);
      }
    }
    this.angVel += -2/this.r * rotateXImp;
    var newVel = (new Vector(rotateVelVector.x + rotateXImp,rotateVelVector.y + rotateYImp)).rotate(platAng);
    if (point)
    {
      this.intersectBackOutPoint(i);
    }
    else {
      this.intersectBackOut(platAng,i);
    }
    this.oldX = this.x - newVel.x;
    this.oldY = this.y - newVel.y;
  }
}
var Car = function(points, wheels)
{
  this.points = points;
  this.wheels = wheels;
  this.display = function()
  {
    ctx = myGameArea.context;
    ctx.beginPath();
    ctx.moveTo(wheels[0].x-terrain.scrollX,wheels[0].y-terrain.scrollY);
    ctx.lineTo(points[0].x-terrain.scrollX,points[0].y-terrain.scrollY);
    ctx.lineTo(points[1].x-terrain.scrollX,points[1].y-terrain.scrollY);
    ctx.lineTo(wheels[1].x-terrain.scrollX,wheels[1].y-terrain.scrollY);
    ctx.stroke();
    wheels[0].display();
    wheels[1].display();
  }
  this.doStep = function()
  {
    points[0].doStep();
    points[1].doStep();
    wheels[0].doStep();
    wheels[1].doStep();

  }
  this.intersect = function()
  {
    wheels[0].wheelIntersection();
    wheels[1].wheelIntersection();
    points[0].pointIntersection();
    points[1].pointIntersection();
  }
  this.constrain = function(point1, point2, targetDist)
  {
    var xDiff = point1.x - point2.x;
    var yDiff = point1.y - point2.y;
    var distance = Math.sqrt(xDiff*xDiff + yDiff*yDiff);
    var xCOM = (point1.x*point1.mass+point2.x*point2.mass)/(point1.mass+point2.mass);
    var yCOM = (point1.y*point1.mass+point2.y*point2.mass)/(point1.mass+point2.mass);
    var scale = targetDist/distance;

    point1.x = xCOM + scale * (point1.x - xCOM);
    point1.y = yCOM + scale * (point1.y - yCOM);

    point2.x = xCOM + scale * (point2.x - xCOM);
    point2.y = yCOM + scale * (point2.y - yCOM);
  }
  this.constrainAll = function()
  {
    this.constrain(points[0],wheels[0],40*Math.sqrt(2));
    this.constrain(points[1],wheels[1],40*Math.sqrt(2));

    this.constrain(points[0],wheels[1],40*Math.sqrt(10));
    this.constrain(points[1],wheels[0],40*Math.sqrt(10));

    this.constrain(points[0],points[1],80);
    this.constrain(wheels[0],wheels[1],160);
  }
  this.controls = function()
  {
    if (myGameArea.keys && myGameArea.keys[39] || (myGameArea.x && myGameArea.y && myGameArea.x > 600))
    {
      this.wheels[0].angVel += 0.1;
    }
    if (myGameArea.keys && myGameArea.keys[37] || (myGameArea.x && myGameArea.y && myGameArea.x < 600))
    {
      this.wheels[0].angVel -= 0.1;
    }
  }
}
var Terrain1 = function(arrY, dx)
{
  this.scrollX = 0;
  this.scrollY = 0;
  this.arrY = arrY;
  this.dx = dx;
  this.display = function()
  {
    ctx = myGameArea.context;
    ctx.beginPath();
    ctx.moveTo(-this.scrollX,this.arrY[0]-this.scrollY);
    for (var i = 1 ; i< this.arrY.length; i++)
    {
      ctx.lineTo(i*this.dx-this.scrollX, this.arrY[i]-this.scrollY);
    }
    ctx.stroke();
  }
  this.updateScroll = function()
  {
    this.scrollX += (-this.scrollX+car1.wheels[0].x-350)/10;
    this.scrollY += (-this.scrollY+car1.wheels[0].y-350)/10;
  }
}
var Vector = function(x,y)
{
  this.x = x;
  this.y = y;
  this.rotate = function(theta)
  {
    return new Vector(x*Math.cos(theta)-y*Math.sin(theta), y*Math.cos(theta) + x*Math.sin(theta));
  }
}
function updateGameArea() {

    myGameArea.clear();



    car1.doStep();

    car1.intersect();
    car1.constrainAll();
    car1.intersect();
    car1.constrainAll();
    car1.intersect();
    car1.constrainAll();
    car1.intersect();
    car1.constrainAll();
    car1.intersect();
    car1.constrainAll();
    car1.intersect();
    car1.constrainAll();
    car1.intersect();
    car1.constrainAll();
    car1.intersect();
    car1.constrainAll();
    car1.intersect();
    car1.constrainAll();
    car1.intersect();
    car1.constrainAll();
    car1.intersect();
    car1.constrainAll();
    car1.intersect();
    car1.constrainAll();


    car1.controls();
    terrain.updateScroll();
    car1.display();
    terrain.display();
}
