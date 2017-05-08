// Initialize Firebase
var config = {
    apiKey: "AIzaSyAsXzwMeQpaZYf2KZsMBM0WdXDz0xWfug8",
    authDomain: "occuserver.firebaseapp.com",
    databaseURL: "https://occuserver.firebaseio.com",
    storageBucket: "occuserver.appspot.com",
    messagingSenderId: "334611600995"
  };
  firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database(); 
           
var sensorDropdown = document.getElementById('sensor_dropdown');        
        
var sensorRef = database.ref('sensors/');
var sensorDropdownUpdate = function(){
    sensorRef.on("value", function(snapshot){
        sensorDropdown.innerHTML = "";
        snapshot.forEach(function(childSnapshot){
            var opt = document.createElement("option");
            opt.value = childSnapshot.key;
            opt.innerHTML = "Sensor "+childSnapshot.key;
            sensorDropdown.appendChild(opt);
        });
    });
};
sensorDropdownUpdate();
    
var roomDropdown = document.getElementById('room_dropdown');        
        
var roomRef = database.ref('rooms/');
var roomDropdownUpdate = function(){
    roomRef.on("value", function(snapshot){
        roomDropdown.innerHTML = "";
        snapshot.forEach(function(childSnapshot){
            var opt = document.createElement("option");
            opt.value = childSnapshot.key;
            opt.innerHTML = "Room "+childSnapshot.key;
            roomDropdown.appendChild(opt);
        });
    });
};
roomDropdownUpdate();
     
$(document).ready(function(){
    console.log("document ready");

    $("#room_submit").on("click", function () {
         var roomname = document.getElementById('room_name').value;   
         var maxOcc = document.getElementById('max_occupancy').value;
         roomRef.child(roomname).set({'max_occupancy':maxOcc});
         document.getElementById('room_create_close').click();
         roomDropdownUpdate();
     });
    
    $("#sensor_submit").on("click", function () {            
        var sensorname = sensorDropdown.options[sensorDropdown.selectedIndex].value;
        var roomname = roomDropdown.options[roomDropdown.selectedIndex].value;
        var currentOcc = document.getElementById('current_occupancy').value;
        roomRef.child(roomname).set({'sensor_id':sensorname});
        //send to page
        sensorDropdownUpdate();
    });
});