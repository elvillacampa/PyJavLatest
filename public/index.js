/*1st NANO*/
const sio = io('http://172.29.203.237:8080');
sio.on('connect', () => {
    sio.emit('initiator', "zupcenter");
	console.log('connected');
});

sio.on('disconnect', () => {
	console.log('disconnected');
});

sio.on('mult', (data, cb) => {
	const result = data.numbers[0] * data.numbers[1];
	cb(result);
});

sio.on('client_count', (count) => {
	console.log("There are " + count + " connected client");
})

sio.on('framezupcenter', (data) => {
    if(data==="[]\n"){
        console.log("empty");
        return;        
    }
    tkn = (data.split("),"));
    for (var i = 0; i < tkn.length; i++) {
        if(i==0)
            tkn[i] = (tkn[i].split("(")[1]).split(",");
        else if(i==tkn.length-1){
            tkn[i] = tkn[i].split(")")[0];
            tkn[i] = (tkn[i].split("(")[1]).split(",");            
        }
        else{
            tkn[i] = (tkn[i].split("(")[1]).split(",");
        }

    }
	updateWorld(tkn);
});

skins=["sedan", "scrum", "motorcycle", "van", "truck", "ruscopickup", "pickup", "mini-van", "mini-truck", "hatchback", "coupe", "bus", "cuv", "garbage truck", "fuel truck", "fire truck", "dump truck", "box truck", "big truck", "ambulance", "backhoe" ];

var traffic_light = [], roadline = [], establishment = [];
var vehicles = [];
var context;
var vehicle_counter_display, crash_counter_display;
var crash = 0, vehicle_counter = 0;
var vehicle_classes=[
    ["SCRUM", 0,0,"#c0c3c3"],  
    ["SEDAN", 0,0,"#df1019"],  
    ["CUV", 120,60,"#cabfe9"],  
    ["SUV", 130, 70,"#5b4f5b"],  
    ["BUS", 0, 0,"#f6ea56"],  
    ["HATCHBACK", 0,0,"#56c7f2"],  
    ["RUSCOPICKUP", 0,0,"#fefeb1"],  
    ["PICKUP", 0,0,"#341800"],  
    ["VAN", 0,0,"#ffffff"],  
    ["COUPE", 0,0,"#990000"],  
    ["MINI-TRUCK", 0, 0,"#2471A3"],  
    ["MINI-VAN", 0,0,"#C39BD3"],  
    ["TRUCK", 0, 0,"#17202A"],  
    ["DUMP TRUCK", 0, 0,"#ABEBC6"],  
    ["BIG TRUCK", 0, 0,"#F4ECF7"],  
    ["FIRE TRUCK", 0, 0,"#40E0D0"],  
    ["AMBULANCE", 150, 90,"#e42491"],  
    ["FUEL TRUCK", 0, 0,"#ABB2B9"],  
    ["BOX TRUCK", 0, 0,"#FFD700"],  
    ["GARBAGE TRUCK", 0, 0,"#C31BE7"],  
    ["BACKHOE", 0, 0,"#6315FD"],  
    ["FLATBED", 0, 0,"#15FD1E"],  
    ["MOTORCYCLE", 80, 60,"#0000b3"],  
    ["ELECBUS", 0, 0,"#F9EBEA"],  
    ["LTRICYCLE", 0, 0,"#FFA500"],  
    ["BIKE", 0, 0,"#F39C12"],  
    ["SHUTTLE", 0,0,"#D98880"],  
    ["PUJ", 0,0,"#4A235A"],  
    ["CTRICYCLE",0,0,"#006700"],  
];

/*              COMPONENTS          */

function roadComponent(width, height, color, x, y, type, position) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.position = position;
    this.x = x;
    this.y = y;
    this.angle = 35;
    if(position=="right")    
        this.angle = 30;
    this.update = function () {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);


    }
}
function textComponents(width, height, color, x, y, type) {
    if (type == "vehicle") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.score = 0;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);

        // ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(30 * Math.PI / 180);
   
        ctx.font = this.width + " " + this.height;
        ctx.fillStyle = color;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();

    }
}
function vehicleComponent(track_id, width, height, image, color, speed, x, y, type, position, component_type) {
    this.component_type = component_type;
    if (component_type == "vehicle") {
        this.image = new Image();
        this.image.src = image;
    }
    this.track_id = track_id;
    this.speed = speed;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.color = color;
    this.position = position; //lane or not
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(30 * Math.PI / 180);
        ctx.drawImage(this.image,-this.width/2,-this.width/2);
        // ctx.fillStyle = color;
        // ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height); 
        ctx.restore();  
    }
}

function bounds(width, height, color, x, y, type, position, angle) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.position = position;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.update = function () {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

    }
}
function roadLane(width, height, color, x, y, type, position, angle) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.position = position;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.update = function () {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(angle * Math.PI / 180);
        ctx.fillStyle = color;
        ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height); 
        ctx.restore();  

    }
}


/*              COMPONENTS          */

function instantiateRoadComponent() {
    establishment.push(new roadLane(400, 1000, "gray",350,100, "establishment", "area", -60));
    establishment.push(new roadLane(400, 1000, "gray",553,-250, "establishment", "area", -60));
    // establishment.push(new bounds(10, 1280, "green",0,0, "establishment", "area"));
    // establishment.push(new bounds(10, 1280, "green",1270,0, "establishment", "area"));
    // establishment.push(new bounds(1280, 10, "green",0,0, "establishment", "area"));
    // establishment.push(new bounds(1280, 10, "green",0,1270,"establishment", "area"));
}

function startGame() {
    // window.onmousemove = function (e) { handleMouseMove(); }
    // window.onscroll = function (e) { handleMouseMove(); }
    // window.onresize = function (e) { handleMouseMove(); }
    // drawAll();
    // vehicle_counter_display = new textComponents("30px", "Consolas", "white", 200, -20, "text");
    myGameArea.start();
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = 1280;
        this.canvas.height = 1280;
        this.context = this.canvas.getContext("2d");
        this.context.translate(640, 640);
        this.context.rotate(60 * Math.PI / 180);
        this.context.translate(-640, -640);
        document.getElementById("canvas1").appendChild(this.canvas);
        instantiateRoadComponent();
        this.frameNo = 0;
        for (i = 0; i < establishment.length; i++) {
            establishment[i].update();
        }


    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function updateWorld(frame) {

   vehicles = []; 
    var inframe="";
    var x, height, gap, minHeight, maxHeight, minGap, maxGap, temp, temp2;
    myGameArea.clear();
    myGameArea.frameNo += 1;
        for (i = 0; i < establishment.length; i++) {
            establishment[i].update();

        }
    for(i=0;i<frame.length;i++){
        // vehicles.push(new vehicleComponent("temp", vehicle_classes[parseInt(frame[i][2])][1], vehicle_classes[parseInt(frame[i][2])][2], "images/car.png", vehicle_classes[parseInt(frame[i][2])][3], 10, 
        //     parseInt(frame[i][0])-30, parseInt(frame[i][1])+300, 
        //     parseInt(frame[i][2]), frame[i][3], "vehicle"));
        vehicle_name = (vehicle_classes[parseInt(frame[i][2])][0]);
        // vehicle_name = "sedan";
        console.log(vehicle_name);
        if(skins.includes(vehicle_name.toLowerCase()))
            vehicles.push(new vehicleComponent("temp", 100, 200, "images/"+vehicle_name.toLowerCase()+".ico", vehicle_classes[parseInt(frame[i][2])][3], 10, 
                parseInt(frame[i][0])-20, parseInt(frame[i][1])+260, 
                parseInt(frame[i][2]), frame[i][3], "vehicle"));
        inframe+=" | "+vehicle_classes[parseInt(frame[i][2])][0]; 
    }
    // console.log(inframe);
    // update vehicles
    for (i = 0; i < vehicles.length; i++) {
            vehicles[i].update();
    }


    // vehicle_counter_display.text = "Vehicles > Inframe: " + vehicles.length + "\n" + ", All: " + vehicle_counter + "\n| Canvas > Width: " + myGameArea.canvas.width + " Height: " + myGameArea.canvas.height;
    // vehicle_counter_display.update();


}

function handleMouseMove(e) {
    var offsetX = myGameArea.canvas.offsetLeft;
    var offsetY = myGameArea.canvas.offsetTop;
    window.addEventListener('mousemove', function (e) {
        document.getElementById('text').textContent = "x: " + (e.clientX - offsetX) + " y: " + (e.clientY - offsetY) + " client-x: " + (e.clientX) + " client-y: " + (e.clientY) + " offset-x: " + (offsetX) + " offset-y: " + (offsetY);

    });
}


       /*==========================================2nd==========================*/
       /*==========================================2nd==========================*/
       /*==========================================2nd==========================*/
       /*==========================================2nd==========================*/
       /*==========================================2nd==========================*/




const sio2 = io('http://172.29.203.237:8080');
sio2.on('connect', () => {
    sio.emit('initiator', "zleft");
    console.log('connected');
});

sio2.on('disconnect', () => {
    
    console.log('disconnected');

});

sio2.on('mult', (data, cb) => {
    const result = data.numbers[0] * data.numbers[1];
    cb(result);
});

sio2.on('client_count', (count) => {
    console.log("There are " + count + " connected client");
})

sio2.on('framezleft', (data) => {
    if(data==="[]\n"){
        console.log("empty");
        return;        
    }
    tkn = (data.split("),"));
    for (var i = 0; i < tkn.length; i++) {
        if(i==0)
            tkn[i] = (tkn[i].split("(")[1]).split(",");
        else if(i==tkn.length-1){
            tkn[i] = tkn[i].split(")")[0];
            tkn[i] = (tkn[i].split("(")[1]).split(",");            
        }
        else{
            tkn[i] = (tkn[i].split("(")[1]).split(",");
        }

    }
    updateWorld2(tkn);
});

var traffic_light2 = [], roadline2 = [], establishment2 = [];
var vehicles2 = [];
var context2;
var vehicle_counter_display2, crash_counter_display2;
var crash2 = 0, vehicle_counter2 = 0;

/*              COMPONENTS          */

function roadComponent2(width, height, color, x, y, type, position) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.position = position;
    this.x = x;
    this.y = y;
    this.angle = 35;
    if(position=="right")    
        this.angle = 30;
    this.update = function () {
        ctx = myGameArea2.context2;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);


    }
}
function textComponents2(width, height, color, x, y, type) {
    if (type == "vehicle") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.score = 0;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = myGameArea2.context2;
        ctx.save();
        ctx.translate(this.x, this.y);

        // ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(30 * Math.PI / 180);
   
        ctx.font = this.width + " " + this.height;
        ctx.fillStyle = color;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();

    }
}
function vehicleComponent2(track_id, width, height, image, color, speed, x, y, type, position, component_type) {
    this.component_type = component_type;
    if (component_type == "vehicle") {
        this.image = new Image();
        this.image.src = image;
    }
    this.track_id = track_id;
    this.speed = speed;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.color = color;
    this.position = position; //lane or not
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = myGameArea2.context2;
        ctx.save();
        ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(30 * Math.PI / 180);
        // ctx.fillStyle = color;
        // ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height); 
        ctx.drawImage(this.image,-this.width/2,-this.width/2);
        ctx.restore();  
    }
}

function bounds2(width, height, color, x, y, type, position) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.position = position;
    this.x = x;
    this.y = y;
    this.angle = 30;
    this.update = function () {
        ctx = myGameArea2.context2;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

    }
}

function roadLane2(width, height, color, x, y, type, position, angle) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.position = position;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.update = function () {
        ctx = myGameArea2.context2;
        ctx.save();
        ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(angle * Math.PI / 180);
        ctx.fillStyle = color;
        ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height); 
        ctx.restore();  

    }
}

/*              COMPONENTS          */

function instantiateRoadComponent2() {
    establishment2.push(new roadLane2(400, 1000, "gray",350,100, "establishment2", "area", -60));
    establishment2.push(new roadLane2(400, 1000, "gray",553,-250, "establishment2", "area", -60));

    // establishment2.push(new bounds2(10, 1280, "red",0,0, "establishment2", "area"));
    // establishment2.push(new bounds2(10, 1280, "red",1270,0, "establishment2", "area"));
    // establishment2.push(new bounds2(1280, 10, "red",0,0, "establishment2", "area"));
    // establishment2.push(new bounds2(1280, 10, "red",0,1270,"establishment2", "area"));
}

function startGame2() {
    // window.onmousemove = function (e) { handleMouseMove2(); }
    // window.onscroll = function (e) { handleMouseMove2(); }
    // window.onresize = function (e) { handleMouseMove2(); }
    // drawAll();
    // vehicle_counter_display2 = new textComponents2("30px", "Consolas", "white", 200, -20, "text");
    myGameArea2.start();
}

var myGameArea2 = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = 1280;
        this.canvas.height = 1280;
        this.context2 = this.canvas.getContext("2d");
        this.context2.translate(640, 640);
        this.context2.rotate(-30 * Math.PI / 180);
        this.context2.translate(-640, -640);
        document.getElementById("canvas2").appendChild(this.canvas);
        instantiateRoadComponent2();
        this.frameNo = 0;
        for (i = 0; i < establishment2.length; i++) {
            establishment2[i].update();
        }


    },
    clear: function () {
        this.context2.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function updateWorld2(frame) {

   vehicles2 = []; 
   vehicle_name="";
    var inframe="";
    var x, height, gap, minHeight, maxHeight, minGap, maxGap, temp, temp2;
    myGameArea2.clear();
    myGameArea2.frameNo += 1;
        for (i = 0; i < establishment2.length; i++) {
            establishment2[i].update();

        }
    for(i=0;i<frame.length;i++){
        // vehicles2.push(new vehicleComponent2("temp", vehicle_classes[parseInt(frame[i][2])][1], vehicle_classes[parseInt(frame[i][2])][2], "triangleR.png", vehicle_classes[parseInt(frame[i][2])][3], 10, 
        //     parseInt(frame[i][0])-30, parseInt(frame[i][1])+300, 
        //     parseInt(frame[i][2]), frame[i][3], "vehicle"));
        vehicle_name = (vehicle_classes[parseInt(frame[i][2])][0]);
        // vehicle_name = "sedan";
        console.log(vehicle_name);

        if(skins.includes(vehicle_name.toLowerCase()))
            vehicles2.push(new vehicleComponent2("temp", 1, 2, "images/"+vehicle_name.toLowerCase()+".ico", vehicle_classes[parseInt(frame[i][2])][3], 10, 
                parseInt(frame[i][0])-20, parseInt(frame[i][1])+260, 
                parseInt(frame[i][2]), frame[i][3], "vehicle"));

        inframe+=" | "+vehicle_classes[parseInt(frame[i][2])][0]; 
    }
    // console.log(inframe);
    // update vehicles2
    for (i = 0; i < vehicles2.length; i++) {
            vehicles2[i].update();
    }


    // vehicle_counter_display2.text = "Vehicles2 > Inframe: " + vehicles2.length + "\n" + ", All: " + vehicle_counter2 + "\n| Canvas > Width: " + myGameArea2.canvas.width + " Height: " + myGameArea2.canvas.height;
    // vehicle_counter_display2.update();


}

function handleMouseMove2(e) {
    var offsetX = myGameArea2.canvas.offsetLeft;
    var offsetY = myGameArea2.canvas.offsetTop;
    window.addEventListener('mousemove', function (e) {
        document.getElementById('text').textContent = "x: " + (e.clientX - offsetX) + " y: " + (e.clientY - offsetY) + " client-x: " + (e.clientX) + " client-y: " + (e.clientY) + " offset-x: " + (offsetX) + " offset-y: " + (offsetY);

    });
}


       /*==========================================3rd==========================*/
       /*==========================================3rd==========================*/
       /*==========================================3rd==========================*/
       /*==========================================3rd==========================*/
       /*==========================================3rd==========================*/

const sio3 = io('http://172.29.203.237:8080');
sio3.on('connect', () => {
    sio.emit('initiator', "zright");
    console.log('connected');
});

sio3.on('disconnect', () => {
    
    console.log('disconnected');

});

sio3.on('mult', (data, cb) => {
    const result = data.numbers[0] * data.numbers[1];
    cb(result);
});

sio3.on('client_count', (count) => {
    console.log("There are " + count + " connected client");
})

sio3.on('framezright', (data) => {
    if(data==="[]\n"){
        console.log("empty");
        return;        
    }
    tkn = (data.split("),"));
    for (var i = 0; i < tkn.length; i++) {
        if(i==0)
            tkn[i] = (tkn[i].split("(")[1]).split(",");
        else if(i==tkn.length-1){
            tkn[i] = tkn[i].split(")")[0];
            tkn[i] = (tkn[i].split("(")[1]).split(",");            
        }
        else{
            tkn[i] = (tkn[i].split("(")[1]).split(",");
        }

    }
    updateWorld3(tkn);
});

var traffic_light3 = [], roadline3 = [], establishment3 = [];
var vehicles3 = [];
var context3;
var vehicle_counter_display3, crash_counter_display3;
var crash3 = 0, vehicle_counter3 = 0;

/*              COMPONENTS          */

function roadComponent3(width, height, color, x, y, type, position) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.position = position;
    this.x = x;
    this.y = y;
    this.angle = 35;
    if(position=="right")    
        this.angle = 30;
    this.update = function () {
        ctx = myGameArea3.context3;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);


    }
}
function textComponents3(width, height, color, x, y, type) {
    if (type == "vehicle") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.score = 0;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = myGameArea3.context3;
        ctx.save();
        ctx.translate(this.x, this.y);

        // ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(30 * Math.PI / 180);
   
        ctx.font = this.width + " " + this.height;
        ctx.fillStyle = color;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();

    }
}
function vehicleComponent3(track_id, width, height, image, color, speed, x, y, type, position, component_type) {
    this.component_type = component_type;
    if (component_type == "vehicle") {
        this.image = new Image();
        this.image.src = image;
    }
    this.track_id = track_id;
    this.speed = speed;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.color = color;
    this.position = position; //lane or not
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = myGameArea3.context3;
        ctx.save();
        ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(30 * Math.PI / 180);
        // ctx.fillStyle = color;
        // ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height); 
        ctx.drawImage(this.image,-this.width/2,-this.width/2);
        ctx.restore();  
    }
}

function bounds3(width, height, color, x, y, type, position) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.position = position;
    this.x = x;
    this.y = y;
    this.angle = 30;
    this.update = function () {
        ctx = myGameArea3.context3;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

    }
}

function roadLane3(width, height, color, x, y, type, position, angle) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.position = position;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.update = function () {
        ctx = myGameArea3.context3;
        ctx.save();
        ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(angle * Math.PI / 180);
        ctx.fillStyle = color;
        ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height); 
        ctx.restore();  

    }
}

/*              COMPONENTS          */

function instantiateRoadComponent3() {
    establishment3.push(new roadLane3(400, 1000, "gray",350,100, "establishment3", "area", -60));
    establishment3.push(new roadLane3(400, 1000, "gray",553,-250, "establishment3", "area", -60));

    // establishment3.push(new bounds3(10, 1280, "yellow",0,0, "establishment3", "area"));
    // establishment3.push(new bounds3(10, 1280, "yellow",1270,0, "establishment3", "area"));
    // establishment3.push(new bounds3(1280, 10, "yellow",0,0, "establishment3", "area"));
    // establishment3.push(new bounds3(1280, 10, "yellow",0,1270,"establishment3", "area"));
}

function startGame3() {
    // window.onmousemove = function (e) { handleMouseMove3(); }
    // window.onscroll = function (e) { handleMouseMove3(); }
    // window.onresize = function (e) { handleMouseMove3(); }
    // drawAll();
    // vehicle_counter_display3 = new textComponents3("30px", "Consolas", "white", 200, -20, "text");
    myGameArea3.start();
}

var myGameArea3 = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = 1280;
        this.canvas.height = 1280;
        this.context3 = this.canvas.getContext("2d");
        this.context3.translate(640, 640);
        this.context3.rotate(150 * Math.PI / 180);
        this.context3.translate(-640, -640);
        document.getElementById("canvas3").appendChild(this.canvas);
        instantiateRoadComponent3();
        this.frameNo = 0;
        for (i = 0; i < establishment3.length; i++) {
            establishment3[i].update();
        }


    },
    clear: function () {
        this.context3.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function updateWorld3(frame) {

   vehicles3 = []; 
    var inframe="";
    var x, height, gap, minHeight, maxHeight, minGap, maxGap, temp, temp2;
    myGameArea3.clear();
    myGameArea3.frameNo += 1;
        for (i = 0; i < establishment3.length; i++) {
            establishment3[i].update();

        }
    for(i=0;i<frame.length;i++){
        // vehicles3.push(new vehicleComponent3("temp", vehicle_classes[parseInt(frame[i][2])][1], vehicle_classes[parseInt(frame[i][2])][2], "triangleR.png", vehicle_classes[parseInt(frame[i][2])][3], 10, 
        //     parseInt(frame[i][0])-30, parseInt(frame[i][1])+300, 
        //     parseInt(frame[i][2]), frame[i][3], "vehicle"));
        vehicle_name = (vehicle_classes[parseInt(frame[i][2])][0]);
        // vehicle_name = "sedan";
        if(skins.includes(vehicle_name.toLowerCase()))
            vehicles3.push(new vehicleComponent3("temp", 1, 2, "images/"+vehicle_name.toLowerCase()+".ico", vehicle_classes[parseInt(frame[i][2])][3], 10, 
                parseInt(frame[i][0])-20, parseInt(frame[i][1])+260, 
                parseInt(frame[i][2]), frame[i][3], "vehicle"));

        inframe+=" | "+vehicle_classes[parseInt(frame[i][2])][0]; 
    }
    // console.log(inframe);
    // update vehicles3
    for (i = 0; i < vehicles3.length; i++) {
            vehicles3[i].update();
    }


    // vehicle_counter_display3.text = "Vehicles3 > Inframe: " + vehicles3.length + "\n" + ", All: " + vehicle_counter3 + "\n| Canvas > Width: " + myGameArea3.canvas.width + " Height: " + myGameArea3.canvas.height;
    // vehicle_counter_display3.update();


}

function handleMouseMove3(e) {
    var offsetX = myGameArea3.canvas.offsetLeft;
    var offsetY = myGameArea3.canvas.offsetTop;
    window.addEventListener('mousemove', function (e) {
        document.getElementById('text').textContent = "x: " + (e.clientX - offsetX) + " y: " + (e.clientY - offsetY) + " client-x: " + (e.clientX) + " client-y: " + (e.clientY) + " offset-x: " + (offsetX) + " offset-y: " + (offsetY);

    });
}







       /*==========================================4th==========================*/
       /*==========================================4th==========================*/
       /*==========================================4th==========================*/
       /*==========================================4th==========================*/
       /*==========================================4th==========================*/

const sio4 = io('http://172.29.203.237:8080');
sio4.on('connect', () => {
    sio.emit('initiator', "zdowncenter");
    
    console.log('connected');
});

sio4.on('disconnect', () => {
    
    console.log('disconnected');

});

sio4.on('mult', (data, cb) => {
    const result = data.numbers[0] * data.numbers[1];
    cb(result);
});

sio4.on('client_count', (count) => {
    console.log("There are " + count + " connected client");
})

sio4.on('framezdowncenter', (data) => {
    if(data==="[]\n"){
        console.log("empty");
        return;        
    }
    tkn = (data.split("),"));
    for (var i = 0; i < tkn.length; i++) {
        if(i==0)
            tkn[i] = (tkn[i].split("(")[1]).split(",");
        else if(i==tkn.length-1){
            tkn[i] = tkn[i].split(")")[0];
            tkn[i] = (tkn[i].split("(")[1]).split(",");            
        }
        else{
            tkn[i] = (tkn[i].split("(")[1]).split(",");
        }

    }
    updateWorld4(tkn);
});

var traffic_light4 = [], roadline4 = [], establishment4 = [];
var vehicles4 = [];
var context4;
var vehicle_counter_display4, crash_counter_display4;
var crash4 = 0, vehicle_counter4 = 0;

/*              COMPONENTS          */

function roadComponent4(width, height, color, x, y, type, position) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.position = position;
    this.x = x;
    this.y = y;
    this.angle = 35;
    if(position=="right")    
        this.angle = 30;
    this.update = function () {
        ctx = myGameArea4.context4;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);


    }
}
function textComponents4(width, height, color, x, y, type) {
    if (type == "vehicle") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.score = 0;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = myGameArea4.context4;
        ctx.save();
        ctx.translate(this.x, this.y);

        // ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(30 * Math.PI / 180);
   
        ctx.font = this.width + " " + this.height;
        ctx.fillStyle = color;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();

    }
}
function vehicleComponent4(track_id, width, height, image, color, speed, x, y, type, position, component_type) {
    this.component_type = component_type;
    if (component_type == "vehicle") {
        this.image = new Image();
        this.image.src = image;
    }
    this.track_id = track_id;
    this.speed = speed;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.color = color;
    this.position = position; //lane or not
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = myGameArea4.context4;
        ctx.save();
        ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(30 * Math.PI / 180);
        // ctx.fillStyle = color;
        // ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height); 
        ctx.drawImage(this.image,-this.width/2,-this.width/2);
        ctx.restore();  
    }
}

function bounds4(width, height, color, x, y, type, position) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.position = position;
    this.x = x;
    this.y = y;
    this.angle = 30;
    this.update = function () {
        ctx = myGameArea4.context4;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

    }
}

function roadLane4(width, height, color, x, y, type, position, angle) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.position = position;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.update = function () {
        ctx = myGameArea4.context4;
        ctx.save();
        ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.rotate(angle * Math.PI / 180);
        ctx.fillStyle = color;
        ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height); 
        ctx.restore();  

    }
}
/*              COMPONENTS          */

function instantiateRoadComponent4() {
    establishment4.push(new roadLane4(400, 1000, "gray",350,100, "establishment4", "area", -60));
    establishment4.push(new roadLane4(400, 1000, "gray",553,-250, "establishment4", "area", -60));

    // establishment4.push(new bounds4(10, 1280, "blue",0,0, "establishment4", "area"));
    // establishment4.push(new bounds4(10, 1280, "blue",1270,0, "establishment4", "area"));
    // establishment4.push(new bounds4(1280, 10, "blue",0,0, "establishment4", "area"));
    // establishment4.push(new bounds4(1280, 10, "blue",0,1270,"establishment4", "area"));
}

function startGame4() {
    // window.onmousemove = function (e) { handleMouseMove2(); }
    // window.onscroll = function (e) { handleMouseMove2(); }
    // window.onresize = function (e) { handleMouseMove2(); }
    // drawAll();
    // vehicle_counter_display4 = new textComponents4("30px", "Consolas", "white", 200, -20, "text");
    myGameArea4.start();
}

var myGameArea4 = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = 1280;
        this.canvas.height = 1280;
        this.context4 = this.canvas.getContext("2d");
        this.context4.translate(640, 640);
        this.context4.rotate(-120 * Math.PI / 180);
        this.context4.translate(-640, -640);
        document.getElementById("canvas4").appendChild(this.canvas);
        instantiateRoadComponent4();
        this.frameNo = 0;
        for (i = 0; i < establishment4.length; i++) {
            establishment4[i].update();
        }


    },
    clear: function () {
        this.context4.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function updateWorld4(frame) {

   vehicles4 = []; 
    var inframe="";
    var x, height, gap, minHeight, maxHeight, minGap, maxGap, temp, temp2;
    myGameArea4.clear();
    myGameArea4.frameNo += 1;
        for (i = 0; i < establishment4.length; i++) {
            establishment4[i].update();

        }
    for(i=0;i<frame.length;i++){
        // vehicles4.push(new vehicleComponent4("temp", vehicle_classes[parseInt(frame[i][2])][1], vehicle_classes[parseInt(frame[i][2])][2], "triangleR.png", vehicle_classes[parseInt(frame[i][2])][3], 10, 
        //     parseInt(frame[i][0])-30, parseInt(frame[i][1])+300, 
        //     parseInt(frame[i][2]), frame[i][3], "vehicle"));
        vehicle_name = (vehicle_classes[parseInt(frame[i][2])][0]);
        // vehicle_name = "sedan";
        if(skins.includes(vehicle_name.toLowerCase()))
            vehicles4.push(new vehicleComponent4("temp", 1, 2, "images/"+vehicle_name.toLowerCase()+".ico", vehicle_classes[parseInt(frame[i][2])][3], 10, 
                parseInt(frame[i][0])-20, parseInt(frame[i][1])+260, 
                parseInt(frame[i][2]), frame[i][3], "vehicle"));

        inframe+=" | "+vehicle_classes[parseInt(frame[i][2])][0]; 
    }
    // console.log(inframe);
    // update vehicles4
    for (i = 0; i < vehicles4.length; i++) {
            vehicles4[i].update();
    }


    // vehicle_counter_display4.text = "Vehicles4 > Inframe: " + vehicles4.length + "\n" + ", All: " + vehicle_counter4 + "\n| Canvas > Width: " + myGameArea4.canvas.width + " Height: " + myGameArea4.canvas.height;
    // vehicle_counter_display4.update();


}

function handleMouseMove4(e) {
    var offsetX = myGameArea4.canvas.offsetLeft;
    var offsetY = myGameArea4.canvas.offsetTop;
    window.addEventListener('mousemove', function (e) {
        document.getElementById('text').textContent = "x: " + (e.clientX - offsetX) + " y: " + (e.clientY - offsetY) + " client-x: " + (e.clientX) + " client-y: " + (e.clientY) + " offset-x: " + (offsetX) + " offset-y: " + (offsetY);

    });
}
