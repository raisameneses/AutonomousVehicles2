


//used for vehicles starting position 
function randomInt(n) {
  return Math.floor(Math.random() * n);
}
/***********************************************************************
 * Vector
 **********************************************************************/
var Vector = function (x, y) {
    this.vectorX = x,
    this.vectorY = y
}
Vector.prototype.addVector = function (v2) {
  this.vectorX += v2.vectorX;
  this.vectorY += v2.vectorY;
}

Vector.prototype.addValue = function (value) {
  this.vectorX += value;
  this.vectorY += value;
}
Vector.prototype.subtractVector = function (v2) {
  this.vectorX -= v2.vectorX;
  this.vectorY -= v2.vectorY;
}
//Multiplies vector by another vector
Vector.prototype.MultiplyVector = function (v2) {
  this.vectorX *= v2.vectorX;
  this.vectorY *= v2.vectorY;
}
//Multiplies vector by a number, not another vector
Vector.prototype.Multiply = function (value) {
  this.vectorX *= value;
  this.vectorY *= value;
}
//Distance formula
Vector.prototype.distance = function (v2) {
  var pow1 = Math.pow((this.vectorX - v2.vectorX), 2);
  var pow2 = Math.pow((this.vectorY - v2.vectorY), 2);
  return Math.sqrt(pow1 + pow2);
}

//Vector's magnitude, used to normalize vector
Vector.prototype.magnitude = function(){
  return Math.sqrt((this.vectorX * this.vectorX) + (this.vectorY * this.vectorY)); 
}

Vector.prototype.Sqmg = function(){
  return (this.vectorX * this.vectorX) + (this.vectorY * this.vectorY); 
}
Vector.prototype.Limit = function(max){
  if(this.Sqmg > max * max){
    this.normalize();
    this.Multiply(max); 
  }
}

Vector.prototype.normalize = function (){
  var mag = this.magnitude();
  if(mag > 0){
    this.vectorX = (this.vectorX / mag); 
    this.vectorY = (this.vectorY / mag); 
  }
}

/***********************************************************************
 * Circle
 **********************************************************************/
var Circle = function (centerX, centerY, circleRadius) {
  this.center = new Vector(centerX, centerY);
  this.radius = circleRadius;
  this.mass = 10;  //Test different numbers.. this can be passed. TO IMPROVE. 
  this.momentOfInertia = this.getCenterOfInertia();
}
//sum of Mass * r^2 calculated based on moment of inertia for a circle
//used if we wat the vehicles to slow down. 
Circle.prototype.getCenterOfInertia = function () {
  var mInertia = this.mass * (Math.pow(this.radius, 2));
  return mInertia;
}

/***********************************************************************
 * Light
 **********************************************************************/
var LightSource = function(game){  
  this.ctx = game.ctx;
  this.radius = 40;
  this.lightLocation = new Vector((game.ctx.canvas.width / 2), (game.ctx.canvas.height / 2));
  this.luminosity = 10; //Constant used to calculate light brightness with respect to each wheel.
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



/***********************************************************************
 * Vehicle
 **********************************************************************/
var AutonomousVehicle = function (game, light) {  
  this.game = game;     
  this.ctx = game.ctx; 
  this.lightSource = light;
  let x = randomInt(800); 
  let y = randomInt(800);   
  this.angle = 90;  
  this.radius  = ((game.ctx.canvas.height) / 50);
  this.position = new Circle(x, y, this.radius );  //Update the circle in every iteration
  this.rightSensor = this.PointInVehicle(60);  
  this.leftSensor = this.PointInVehicle(120);
  this.direction = this.PointInVehicle(this.angle); //Start position = going north. Adapt line draing using this value
  this.rightWheel = 0.0;
  this.leftWheel = 0.0; 
  this.acceleration = 2;
  this.force = 0.0;
  this.torque = 0.0; //rotation angle in radians  
}

//Right sensor = 60 degrees 
//Left Sensor = 120 degrees 
//Position calculated using the parametric equetion 
// x = cx + r * cos(a)
// y = cy + r * sin(a)
AutonomousVehicle.prototype.PointInVehicle = function (SensorAngle){
    var x = this.position.center.vectorX + (this.radius * Math.sin(SensorAngle));
    var y = this.position.center.vectorY + (this.radius * Math.cos(SensorAngle)); 
    return new Vector(x, y); 
}
//Normalize formula: https://stats.stackexchange.com/questions/70801/how-to-normalize-data-to-0-1-range 
// 1) Calculating the intensity of light on each sensor as (constant)/(distance)^2 normalized to a value between 0 and 1.
AutonomousVehicle.prototype.LightIntensity = function(sensor){
  var sensorDistance = sensor.distance(this.lightSource.lightLocation) 
  //var intensity = this.lightSource.luminosity / Math.pow(sensorDistance, 2);  
  var intensity = this.lightSource.luminosity /sensorDistance;  
  //Normalize  
  var normalizedIntensity = (intensity / 1);
  return normalizedIntensity; 
  //return intensity; 
}

AutonomousVehicle.prototype.update = function () { 
  this.PointInVehicle();   
  var rightIntensity = this.LightIntensity(this.rightSensor); 
  var leftIntensity = this.LightIntensity(this.leftSensor);   
 //Apply this to the force on each of the opposite wheels.
  this.rightWheel = leftIntensity; 
  this.leftWheel = rightIntensity;   
//Calculate the force and torque based on these two values.
  if(this.rightWheel > this.leftWheel){
      this.force = (this.rightWheel * this.acceleration);
      this.torque = this.leftWheel;
  } else {
    this.force = (this.leftWheel  * this.acceleration);
    this.torque = this.rightWheel;
  }

  console.log("Force: " +  this.force);
  console.log("Torque: " +  this.torque);

  //Update the position and direction of the vehicle. 
  this.position.center.addValue(this.force); 

  //add torque to the angle, then calculate new direction
  this.angle += this.torque;
  this.direction = this.PointInVehicle(this.angle);
 // console.log("New Position: " + this.position.center.vectorX + " - " +  this.position.center.vectorY)  
}

AutonomousVehicle.prototype.draw = function () {  
  this.ctx.lineWidth = 3;
  this.makeCircle(this.position.center.vectorX, this.position.center.vectorY, this.radius, 'red');
  this.ctx.moveTo(this.position.center.vectorX, this.position.center.vectorY);
  //this.ctx.lineTo(this.position.center.vectorX, this.position.center.vectorY + (-this.radius ));
  this.ctx.lineTo( this.direction.vectorX, this.direction.vectorY); 
  this.ctx.stroke();
}
AutonomousVehicle.prototype.makeCircle = function(x, y, size, color) {
  this.ctx.beginPath();
  this.ctx.arc(x, y, size, 0, 2 * Math.PI)
  this.ctx.closePath();
  this.ctx.fillStyle = color;
  this.ctx.fill();
}
/***********************************************************************
 * Main code
 **********************************************************************/
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
