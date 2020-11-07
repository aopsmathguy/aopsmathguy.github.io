function startGame() {
    myGameArea.start();
}
var bridge;
var terrain;
var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
      //make the canvas and stuff.
        this.canvas.width = 1000;
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
        makeBridgeTerrain();
    },
    clear : function() {
      this.context.fillStyle = "#000000";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
function makeBridgeTerrain()
{
  var points = [
    new Point(200,350,100000,true),
    new Point(300,350,1,false),
    new Point(400,350,1,false),
    new Point(500,350,1,false),
    new Point(600,350,1,false),
    new Point(700,350,1,false),
    new Point(800,350,100000,true),

    new Point(250,305,1,false),
    new Point(350,260,1,false),
    new Point(450,240,1,false),

    new Point(550,240,1,false),
    new Point(650,260,1,false),
    new Point(750,305,1,false),

    new Point(500,450,150,false),

  ];
  var connections = [
    new Connection(3,13,points),

    new Connection(0,1,points),
    new Connection(1,2,points),
    new Connection(2,3,points),
    new Connection(3,4,points),
    new Connection(4,5,points),
    new Connection(5,6,points),

    new Connection(0,7,points),
    new Connection(1,7,points),
    //new Connection(1,8,points),
    new Connection(2,8,points),
    new Connection(2,9,points),
    new Connection(3,9,points),
    new Connection(3,10,points),
    new Connection(4,10,points),
    new Connection(4,11,points),
    //new Connection(5,11,points),
    new Connection(5,12,points),
    new Connection(6,12,points),

    new Connection(7,8,points),
    new Connection(8,9,points),
    new Connection(9,10,points),
    new Connection(10,11,points),
    new Connection(11,12,points),
  ];
  connections[0].maxTension = 100;
  bridge = new Bridge(points, connections);
  terrain = new Terrain1([],50);
  for (var i = 0; i < 5; i++)
  {
    terrain.arrY[i] = 350;
  }
  for (var i = 5; i < 16; i++)
  {
    terrain.arrY[i] = 1000;
  }
  for (var i = 16; i < 22; i++)
  {
    terrain.arrY[i] = 350;
  }
}
var Point = function(x,y,mass,pinned)
{
  this.x = x;
  this.y = y;
  this.oldX = x;
  this.oldY = y;
  this.mass = mass;
  this.sFriction = 0.6;
  this.kFriction = 0.4;
  this.bouncy = 0.2;

  this.pinned = pinned;
  this.xSum = 0;
  this.ySum = 0;

  this.numConnections = 0;

  this.doStep = function()
  {
    if (!this.pinned)
    {
      var temp = this.x;
      this.x = 2*this.x - this.oldX;
      this.oldX = temp;

      temp = this.y;
      this.y = 2*this.y - this.oldY + 0.1;
      this.oldY = temp;
    }
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
    var ang = Math.atan((y2-y1)/(x2-x1));
    var pointRot = (new Vector(this.x,this.y)).rotate(-ang);
    var pointRot1 = (new Vector(x1,y1)).rotate(-ang);
    var pointRot2 = (new Vector(x2,y2)).rotate(-ang);
    var set = (new Vector(pointRot.x, pointRot1.y)).rotate(ang);
    this.x = set.x;
    this.y = set.y;
  }
  this.pointIntersection = function()
  {
    if (pinned)
    {
      return;
    }
    for (var i = terrain.collisionLow; i < terrain.collisionHigh; i++)
    {
      if (this.intersectionCheck(i*terrain.dx, terrain.arrY[i],(i+1)*terrain.dx, terrain.arrY[i+1]))
      {
        this.intersectionResolve(i*terrain.dx, terrain.arrY[i],(i+1)*terrain.dx, terrain.arrY[i+1]);
      }
    }
  }
}
var Connection = function(idx1, idx2,points)
{
  this.idx1 = idx1;
  this.idx2 = idx2;
  var xDiff = points[idx1].x - points[idx2].x;
  var yDiff = points[idx1].y - points[idx2].y;
  this.targetLength = Math.sqrt(xDiff*xDiff + yDiff * yDiff);
  this.broken = false;
  this.tension = 0;
  this.maxTension = 0.05;
  this.k = 2;
  this.color = function()
  {
    var red = Math.floor(-127 * Math.cos(Math.PI*this.tension/this.maxTension)+128).toString(16);
    var green = Math.floor(127 * Math.cos(Math.PI*this.tension/this.maxTension)+128).toString(16);
    if (red.length ==1)
      red = "0" + red;
    if (green.length ==1)
      green = "0" + green;
    return red + green + "00";
  }
}
var Bridge = function(points, connections)
{

  this.points = points;
  this.connections = connections;
  this.numIterations = 10;
  this.maxStress=0;
  this.display = function()
  {
    ctx = myGameArea.context;
    this.maxStress=0;
    for (var i = 0 ; i < connections.length; i++)
    {
      var connection = connections[i];
      if (connection.broken)
      {
        continue;
      }
      ctx.strokeStyle = "#" + connection.color();
      ctx.beginPath();
      ctx.lineTo(points[connection.idx1].x-terrain.scrollX,points[connection.idx1].y-terrain.scrollY);
      ctx.lineTo(points[connection.idx2].x-terrain.scrollX,points[connection.idx2].y-terrain.scrollY);
      ctx.stroke();

      this.maxStress = Math.max(this.maxStress, Math.floor(100*connection.tension/connection.maxTension));
    }
    ctx.save();
    ctx.translate(this.points[13].x -terrain.scrollX, this.points[13].y-terrain.scrollY )
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect( -20 , -20, 2*20, 2*20);
    ctx.restore();

    ctx.font = "30px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(this.maxStress + "%", 30, 50);
  }
  this.doStep = function()
  {
    for (var i = 0; i < this.points.length; i++)
    {
      this.points[i].doStep();
    }
  }
  this.iterations = function()
  {
    for (var i = 0; i < this.points.length; i++)
    {
      this.points[i].pointIntersection();
    }
    for (var i = 0 ; i < this.numIterations; i++)
    {

      bridge.constrainAll();
    }
  }
  this.constrain = function(connectionsIdx)
  {
    var connection = this.connections[connectionsIdx];
    if (connection.broken)
    {
      return;
    }
    var point1 = this.points[connection.idx1];
    var point2 = this.points[connection.idx2];

    var xDiff = point1.x - point2.x;
    var yDiff = point1.y - point2.y;
    var distance = Math.sqrt(xDiff*xDiff + yDiff*yDiff);
    var xCOM = (point1.x*point1.mass+point2.x*point2.mass)/(point1.mass+point2.mass);
    var yCOM = (point1.y*point1.mass+point2.y*point2.mass)/(point1.mass+point2.mass);
    var scale = connection.targetLength/distance;
    connection.tension = Math.abs(scale - 1);
    if (Math.abs(connection.tension) > connection.maxTension)
    {
      connections[connectionsIdx].broken = true;
    }
    var newScale = Math.sqrt(connection.k*(point1.mass+point2.mass)/(point1.mass*point2.mass));
    point1.xSum += xCOM + Math.pow(scale,newScale) * (point1.x - xCOM);
    point1.ySum += yCOM + Math.pow(scale,newScale) * (point1.y - yCOM);
    point1.numConnections ++;

    point2.xSum += xCOM + Math.pow(scale,newScale) * (point2.x - xCOM);
    point2.ySum += yCOM + Math.pow(scale,newScale) * (point2.y - yCOM);
    point2.numConnections ++;
  }
  this.constrainAll = function()
  {
    for (var i = 0; i < this.points.length; i++)
    {
      points[i].xSum =0;
      points[i].ySum =0;
      points[i].numConnections =0;
    }
    for (var i = 0; i < this.connections.length; i++)
    {
      this.constrain(i);
    }
    for (var i = 0; i < this.points.length; i++)
    {
      if(points[i].numConnections != 0&& !points[i].pinned)
      {
        points[i].x = points[i].xSum/points[i].numConnections;
        points[i].y = points[i].ySum/points[i].numConnections;
      }
    }
  }
  this.controls = function()
  {
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
    this.renderLow = 0;
    this.renderHigh = this.arrY.length;
    this.collisionLow = 0;
    this.collisionHigh= this.arrY.length;

    ctx = myGameArea.context;
    ctx.fillStyle = '#69512e';
    ctx.beginPath();
    ctx.moveTo( - this.scrollX,2000 -this.scrollY);
    for (var i = this.renderLow; i < this.renderHigh; i++)
    {
      ctx.lineTo((i) * this.dx - this.scrollX, this.arrY[i] -this.scrollY);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#268b07';
    }
    ctx.lineTo((this.arrY.length)* this.dx - this.scrollX, 2000 -this.scrollY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
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
    bridge.doStep();
    bridge.iterations();
    terrain.display();
    bridge.display();
}
