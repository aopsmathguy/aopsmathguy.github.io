function startGame() {
    myGameArea.start();
}
var bridge;
var terrain;
var state = "make";
var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
      //make the canvas and stuff.
        this.canvas.width = 1000;
        this.canvas.height = 700;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        myGameArea.keys = [];
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
        const rect = this.canvas.getBoundingClientRect();
        window.addEventListener('mousemove', function (e) {
          myGameArea.x = e.clientX - rect.left;
          myGameArea.y = e.clientY - rect.top;
          myGameArea.xRounded = round(e.clientX - rect.left);
          myGameArea.yRounded = round(e.clientY - rect.top);
        });
        myGameArea.click = false;
        myGameArea.up = false;
        window.addEventListener('mousedown', function (e) {
          myGameArea.mouseDown = true;
          myGameArea.click = true;
        })
        window.addEventListener('mouseup', function (e) {
          myGameArea.mouseDown = false;
          myGameArea.up = true;
        })
        window.addEventListener("keydown", function(e) {
    // space, page up, page down and arrow keys:
          if([32, 33, 34, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
          }
        }, false);

        makeBridgeTerrain();
        this.interval = setInterval(updateGameArea, 17);
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
    new Point(800,350,100000,true),
    new Point(500,400,1,false),
    new Point(500,350,1,false)
  ];
  var connections = [
    new Connection(2,3,points),

    /*new Connection(0,1,points),
    new Connection(1,2,points),
    new Connection(2,3,points),
    new Connection(3,4,points),
    new Connection(4,5,points),
    new Connection(5,6,points),

    new Connection(0,7,points),
    new Connection(1,7,points),
    new Connection(1,8,points),
    new Connection(2,8,points),
    new Connection(2,9,points),
    new Connection(3,9,points),
    new Connection(3,10,points),
    new Connection(4,10,points),
    new Connection(4,11,points),
    new Connection(5,11,points),
    new Connection(5,12,points),
    new Connection(6,12,points),

    new Connection(7,8,points),
    new Connection(8,9,points),
    new Connection(9,10,points),
    new Connection(10,11,points),
    new Connection(11,12,points)*/
  ];
  points[2].connectable = false;
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

  this.dragging = false;

  this.xSum = 0;
  this.ySum = 0;

  this.connectable = true;

  this.numConnections = 0;
  this.distanceToMouse = function()
  {
    return Math.sqrt((this.x - myGameArea.x)*(this.x - myGameArea.x)+(this.y - myGameArea.y)*(this.y - myGameArea.y));;
  }
  this.doStep = function()
  {
    if (!this.pinned)
    {
      var temp = this.x;
      this.x = 2*this.x - this.oldX;
      this.oldX = temp;

      temp = this.y;
      this.y = 2*this.y - this.oldY + 0.1/(bridge.numIterations*bridge.numIterations);
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
  this.targetLength = 0;
  this.broken = false;
  this.tension = 0;
  this.maxTension = 0.02;
  this.k = 0.05;
  this.setTargetLength = function()
  {
    var xDiff = bridge.points[idx1].x - bridge.points[idx2].x;
    var yDiff = bridge.points[idx1].y - bridge.points[idx2].y;
    this.targetLength = Math.sqrt(xDiff*xDiff + yDiff * yDiff);
  }
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
  this.numIterations = 40;
  this.maxStress=0;

  this.tool = "build";

  this.lastPointClick = -1;
  this.activeIdx = -1;
  this.beamLength = 100;

  this.mouseXActive;
  this.mouseYActive;
  this.display = function()
  {
    ctx = myGameArea.context;
    ctx.save();
    ctx.translate(this.points[2].x -terrain.scrollX, this.points[2].y-terrain.scrollY )
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect( -20 , -20, 2*20, 2*20);
    ctx.restore();
    this.maxStress=0;
    for (var i = 0 ; i < this.connections.length; i++)
    {
      var connection = this.connections[i];
      if (connection.broken)
      {
        continue;
      }
      ctx.strokeStyle = "#" + connection.color();
      ctx.beginPath();
      ctx.moveTo(this.points[connection.idx1].x-terrain.scrollX,this.points[connection.idx1].y-terrain.scrollY);
      ctx.lineTo(this.points[connection.idx2].x-terrain.scrollX,this.points[connection.idx2].y-terrain.scrollY);
      ctx.stroke();

      this.maxStress = Math.max(this.maxStress, Math.floor(100*connection.tension/connection.maxTension));
    }
    if(state == "make" && this.tool == "build")
    {
      if(myGameArea.mouseDown)
      {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = "#00FF00";
        ctx.beginPath();
        ctx.moveTo(this.points[this.lastPointClick].x - terrain.scrollX,this.points[this.lastPointClick].y - terrain.scrollY);
        ctx.lineTo(this.buildX - terrain.scrollX,this.buildY-terrain.scrollY);
        ctx.stroke();
        ctx.restore();
      }
    }


    for (var i = 0; i < this.points.length; i++)
    {
      ctx.beginPath();
      if (!this.points[i].connectable)
      {
        continue;
      }
      ctx.arc(this.points[i].x, this.points[i].y, 7.5, 0, 2 * Math.PI, false);
      if (state == "make" && i == this.lastPointClick)
      {
        ctx.fillStyle = 'blue';
      }
      else if (!this.points[i].pinned)
      {
        ctx.fillStyle = 'yellow';
      }
      else {
        ctx.fillStyle = 'red';
      }
      ctx.fill();
    }
    if (state=="make")
    {
      for(var i = 0; i < 1000; i+= 12.5)
      {
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = "#FFFFFF";
        if (i%50 == 0)
        {
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(i - terrain.scrollX,700 - terrain.scrollY);
          ctx.lineTo(i - terrain.scrollX,0-terrain.scrollY);
          ctx.stroke();

        }
        else {
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(i - terrain.scrollX,700 - terrain.scrollY);
          ctx.lineTo(i - terrain.scrollX,0-terrain.scrollY);
          ctx.stroke();
        }
        ctx.restore();
      }
      for(var j = 0; j < 700; j+= 12.5)
      {
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = "#FFFFFF";
        if (j%50 == 0)
        {
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0 - terrain.scrollX,j - terrain.scrollY);
          ctx.lineTo(1000 - terrain.scrollX,j-terrain.scrollY);
          ctx.stroke();

        }
        else {
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0 - terrain.scrollX,j - terrain.scrollY);
          ctx.lineTo(1000 - terrain.scrollX,j-terrain.scrollY);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
    ctx.font = "30px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(this.maxStress + "%", 30, 50);
    ctx.fillText(this.tool, 30, 80);
    ctx.fillText("mass: " + Math.floor(this.points[2].mass), 30, 110);
    if(state == "run")
    {
      this.points[2].mass +=.2;
    }
    for(var i = 0; i < this.connections.length;i ++)
    {
      this.connections[i].tension = 0;
    }
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
    for (var i = 0 ; i < this.numIterations; i++)
    {
      this.doStep();
      this.constrainAll();
      for (var j = 0; j < this.points.length; j++)
      {
        this.points[j].pointIntersection();
      }
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
    connection.tension = Math.max(Math.abs(scale - 1),connection.tension);
    if (Math.abs(connection.tension) > connection.maxTension)
    {
      connections[connectionsIdx].broken = true;
    }
    var newScale = connection.k*(point1.mass+point2.mass)/(point1.mass*point2.mass)*100/connection.targetLength;
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
      if(points[i].numConnections != 0 && !points[i].pinned)
      {
        points[i].x = points[i].xSum/points[i].numConnections;
        points[i].y = points[i].ySum/points[i].numConnections;
      }
    }
  }
  this.getIdxMousePoint = function()
  {
    var minDist = 20;
    var idxNewPoint = -1;
    if (this.activeIdx == -1)
    {
      this.mouseXActive = round(myGameArea.x);
      this.mouseYActive = round(myGameArea.y);
      for(var i = 0 ; i < this.points.length; i++)
      {
        var pointToMouse = this.points[i].distanceToMouse();
        if (minDist > pointToMouse)
        {
          minDist = pointToMouse;
          idxNewPoint = i;
        }
      }
    }
    else {
      var dist = this.points[this.activeIdx].distanceToMouse();
      var effX;
      var effY;
      if (dist <= this.beamLength)
      {
        effX = myGameArea.x;
        effY = myGameArea.y;

      }
      else {
        effX = this.points[this.activeIdx].x + this.beamLength*(myGameArea.x - this.points[this.activeIdx].x)/dist;
        effY = this.points[this.activeIdx].y + this.beamLength*(myGameArea.y - this.points[this.activeIdx].y)/dist;
      }
      this.mouseXActive = round(effX);
      this.mouseYActive = round(effY);

      for(var i = 0 ; i < this.points.length; i++)
      {
        var pointToMouse = Math.sqrt((effX - this.points[i].x)*(effX - this.points[i].x) + (effY - this.points[i].y)*(effY - this.points[i].y));

        if (minDist > pointToMouse)
        {
          var xDiffSmall = Math.min(Math.abs(this.points[i].x - this.points[this.activeIdx].x+ 0.5*12.5),Math.abs(this.points[i].x- this.points[this.activeIdx].x- 0.5*12.5));
          console.log(xDiffSmall/12.5);

          var yDiffSmall = Math.min(Math.abs(this.points[i].y - this.points[this.activeIdx].y+ 0.5*12.5),Math.abs(this.points[i].y- this.points[this.activeIdx].y- 0.5*12.5));
          //console.log(yDiff/12.5);
          var previousPointToEff = Math.sqrt(xDiffSmall*xDiffSmall +yDiffSmall * yDiffSmall);
          if (previousPointToEff <= this.beamLength)
          {
            minDist = pointToMouse;
            idxNewPoint = i;
          }
          //console.log(previousPointToEff);
        }
      }
    }
    return idxNewPoint;
  }
  this.controls = function()
  {
    if(!this.qBefore && myGameArea.keys[81])
    {
      this.qBefore = true;
      if (this.tool == "move"){
        this.tool = "build";
      }
      else{
        this.tool = "move";
      }
    }
    else if (!myGameArea.keys[81]){
      this.qBefore = false;
    }
    if(myGameArea.click)
    {
      this.activeIdx = -1;
      var idxNewPoint = this.getIdxMousePoint();
      this.activeIdx = idxNewPoint;
      if(this.tool == "build")
      {
          if (idxNewPoint == -1){
            this.points.push(new Point(myGameArea.xRounded, myGameArea.yRounded,1,false));
            this.lastPointClick = this.points.length - 1;
            this.activeIdx = this.points.length - 1;
          }
          else {
            this.lastPointClick = idxNewPoint;
          }
      }

      myGameArea.click = false;
    }
    else if (myGameArea.up){
      //create new point
      var idxNewPoint = this.getIdxMousePoint();
      this.activeIdx = -1;
      if(this.tool == "build")
      {
        if (idxNewPoint == -1){
          this.points.push(new Point(this.buildX,this.buildY,1,false));
          this.connections.push(new Connection(this.lastPointClick, this.points.length - 1));
          this.lastPointClick = this.points.length - 1;
        }
        else if(this.lastPointClick != idxNewPoint){
          var duplicate = false;
          for (var i = 0; i < this.connections.length; i++)
          {
            duplicate = (duplicate || (this.connections[i].idx1 == this.lastPointClick && this.connections[i].idx2 == idxNewPoint) || (this.connections[i].idx2 == this.lastPointClick && this.connections[i].idx1 == idxNewPoint))
          }
          if (!duplicate)
          {
            this.connections.push(new Connection(this.lastPointClick, idxNewPoint));
            this.lastPointClick = idxNewPoint;
          }
        }

      }
      myGameArea.up = false;
    }
    else if (myGameArea.mouseDown)
    {
      var idxNewPoint = this.getIdxMousePoint();
      if (idxNewPoint == -1)
      {
        this.buildX = this.mouseXActive;

        this.buildY = this.mouseYActive;
      }
      else {
        this.buildX = this.points[idxNewPoint].x;
        this.buildY = this.points[idxNewPoint].y;
      }
    }


//space to start
    if (myGameArea.keys.length >=32 && myGameArea.keys[32])
    {
      if (state == "make")
      {
        for (var i = 0 ; i < this.connections.length; i++)
        {
          this.connections[i].setTargetLength();
        }
        state = "run";
      }
      else {
        state = "make";
      }
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
    this.renderLow = 0;
    this.renderHigh = this.arrY.length;
    this.collisionLow = 0;
    this.collisionHigh= this.arrY.length;

    ctx = myGameArea.context;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo( - this.scrollX,2000 -this.scrollY);
    for (var i = this.renderLow; i < this.renderHigh; i++)
    {
      ctx.lineTo((i) * this.dx - this.scrollX, this.arrY[i] -this.scrollY);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#268b07';
    }
    ctx.lineTo((this.arrY.length)* this.dx - this.scrollX, 2000 -this.scrollY);
    ctx.closePath();
    ctx.fill();
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
var round = function(num)
{
  return Math.floor(0.5 + num/12.5)*12.5;
}
function updateGameArea() {
  if (state ==  "run")
  {
    myGameArea.clear();
    bridge.iterations();
    terrain.display();
    bridge.display();
  }
  else {
    myGameArea.clear();
    bridge.controls();
    terrain.display();
    bridge.display();
    //console.log(bridge.points[0].);
  }
}
