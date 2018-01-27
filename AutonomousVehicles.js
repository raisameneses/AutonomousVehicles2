
//used for vehicles starting position 
function randomInt(n) {
  return Math.floor(Math.random() * n);
}
//a Vector directs vehicle's movements and direction 
//as well as the target's location.  
var Vector = function (x, y) {
  this.vectorX = x,
    this.vectorY = y
}
Vector.prototype.addVector = function (v2) {
  this.x += v2.x;
  this.y += v2.y;
}
Vector.prototype.subtractVector = function (v2) {
  this.x -= v2.x;
  this.y -= v2.y;
}
//Calculates the distance between vectors
Vector.prototype.distance = function (v2) {
  var pow1 = Math.pow((this.x - v2.x), 2);
  var pow2 = Math.pow((this.y - v2.y), 2);
  return Math.sqrt(pow1 + pow2);
}

//Blueprint for a vehicle. Contains all the body information
var Circle = function (centerX, centerY, circleRadius) {
  this.center = new Vector(centerX, centerY);
  this.radius = circleRadius;
  this.mass - 10;  //Test different numbers.. this can be passed. TO IMPROVE. 
  this.momentOfInertia = this.getCenterOfInertia();
}
//sum of Mass * r^2 calculated based on moment of inertia for a circle
//used if we wat the vehicles to slow down. 
Circle.prototype.getCenterOfInertia = function () {
  var mInertia = this.mass * (Math.pow(this.radius, 2));
  return mInertia;
}

var LightSource = function(game){  
  this.ctx = game.ctx;
  this.radius = 40;
  this.lightLocation = new Vector((game.ctx.canvas.width / 2), (game.ctx.canvas.height / 2));
}

LightSource.prototype.draw = function() {
  this.ctx.beginPath();
  this.ctx.arc(this.lightLocation.vectorX, this.lightLocation.vectorY, this.radius, 0, 2 * Math.PI);
  this.ctx.fillStyle = "rgb(233, 189, 21)";
  this.ctx.fillStyle = "#FFFFFF";
  this.ctx.fill();
}

LightSource.prototype.update = function() {
 //Do nothing, values are stable. 
}

LightSource.prototype.getLocation = function(){
  return this.lightLocation;
}

//Vehicle. Uses phenotype of a circle. Makes decisions based on physics laws. 
var AutonomousVehicle = function (game, light) {
  this.ctx = game.ctx;
  this.locationGoal = light.getLocation();
  this.direction = this.whereAmIGoing(); 
  let x = randomInt(800); 
  let y = randomInt(800); 
  this.game = game;
  this.radius  = ((game.ctx.canvas.height) / 50);
  this.circle = new Circle(x, y, this.radius );  //Update the circle in every iteration
  this.speed = 5;
  const angle = 90;
  this.torque = 0.0; //rotation angle in radians 
  this.direction = (this.circle.center.vectorY + (-this.radius ));   //Starts going to the up
  
}

//returns true if the right sensor is false, left otherwise
AutonomousVehicle.prototype.CloserSensorToLight = function () {
  // var leftSensor = new Vector((this.circle.center.vectorX -  this.radius), this.circle.center.vectorY);
  // console.log("Left Sensor " + leftSensor.center)
  // var left =  leftSensor.distance(this.locationGoal);
  // console.log(left)

  // var rightSensor = new Vector((this.circle.center.vectorX +  this.radius), this.circle.center.vectorY);
  // console.log("right Sensor " + rightSensor.center)
  // var right = rightSensor.distance(this.locationGoal);
  // console.log(right)
  // if (left < right) {
  //   return true;
  //   console.log(true)
  // }
  // return false;
  // console.log(false)
}

//Vehicle direction 
AutonomousVehicle.prototype.whereAmIGoing = function () {
  // return this.radius += this.circle.center.vectorX;
}
//Difference in vector distance = force for torque
AutonomousVehicle.prototype.SensorDifference = function () {
  let leftSensor = new Vector(this.circle.center.vectorX -  this.radius, this.circle.center.vectorY);
  let left = leftSensor.distance(this.locationGoal);
  //console.log(left)

  var rightSensor = new Vector(this.circle.center.vectorX +  this.radius, this.circle.center.vectorY);
  let right = rightSensor.distance(this.locationGoal);
  //console.log(right)
  //console.log( Math.abs(left - right));
  return Math.abs(left - right);
}

AutonomousVehicle.prototype.update = function () {
  //let torqueForce = this.SensorDifference(); //Torque
  var distance = this.speed * this.game.clockTick; 
  var newPosition = new Vector(distance, distance);
  newX =  this.circle.center.getX += distance;
  this.circle.center.vectorX += distance;
  this.circle.center.vectorY += distance;
  //this.direction = (this.circle.center.vectorY + (-this.radius )); 
  this.torque = torqueForce * this.radius * Math.sin(this.angle); // radius.x * force.y - radius.y * force.x;
  //try to get closer to the light .. longer sensor? 
}
//Passing the Canvas width and height to adapt the vehicles
// dimensions. 
AutonomousVehicle.prototype.draw = function () {
  this.makeCircle(this.circle.center.vectorX, this.circle.center.vectorY, this.radius, 'red');
  this.ctx.moveTo(this.circle.center.vectorX, this.circle.center.vectorY);
  this.ctx.lineWidth = 3;
  this.ctx.lineTo(this.circle.center.vectorX, this.circle.center.vectorY + (-this.radius ));
  this.ctx.stroke();
}
AutonomousVehicle.prototype.makeCircle = function(x, y, size, color) {
  this.ctx.beginPath();
  this.ctx.arc(x, y, size, 0, 2 * Math.PI)
  this.ctx.closePath();
  this.ctx.fillStyle = color;
  this.ctx.fill();
}
// the "main" code begins here
var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");

ASSET_MANAGER.downloadAll(function () {
  console.log("Asser Manager and Game.");
  var canvas = document.getElementById('gameWorld');
  var ctx = canvas.getContext('2d');
  var gameEngine = new GameEngine();   
  gameEngine.init(ctx); 
  var light = new LightSource(gameEngine);  
  var vehicle = new AutonomousVehicle(gameEngine, light);
  gameEngine.addEntity(vehicle);
  gameEngine.addEntity(light);
  gameEngine.start();
});
