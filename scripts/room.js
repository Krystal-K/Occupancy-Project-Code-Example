var bar = new ProgressBar.Circle(occupancyProgress, {
  strokeWidth: 6,
  easing: 'easeInOut',
  duration: 1400,
  color: '#7aced6',
  trailColor: '#eee',
  trailWidth: 1,
  svgStyle: null
});

bar.animate(1.0);
    
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
var numppl;
var maxOcc;
var sensorId;
var currentOcc;
var room;
var roomRef;
var resetRef = database.ref('reset');
var todayHours = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var yesterdayHours = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var todayHoursToAvg = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
var yesterdayHoursToAvg = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
var lastOcc = 0;
var today = new Date();
today = DateFormat.format.date(today, "dd-MM-yyyy");
var chartDatePicked = today;
var datePickedHours = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var datePickedHoursToAvg = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
var firstroomRef = database.ref('rooms/');
var roomDropdown = document.getElementById('room_dropdown');
var roomDropdownUpdate = function(){
    firstroomRef.on("value", function(snapshot){
        roomDropdown.innerHTML = "";
        snapshot.forEach(function(childSnapshot){
            var opt = document.createElement("option");
            opt.value = childSnapshot.key;
            opt.innerHTML = "Room "+childSnapshot.key;
            roomDropdown.appendChild(opt);                
            PageRefresh();            
        });
    });
};
roomDropdownUpdate();

// Update the historical data graph with specified date
function ChartRefresh() {
    var chartData;
    if(chartDatePicked == today){
        chartData = todayHours;
    } else {
        chartData = datePickedHours;
    }
    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["12:00 AM","1:00 AM","2:00 AM","3:00 AM","4:00 AM","5:00 AM","6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM","9:00 PM","10:00 PM","11:00 PM"],
            datasets: [{
                label: 'avg # of occupants',
                data: chartData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
};

function formatIndex(index) {
    if(index == '00'){
        return index = 0;
    } else if(index == '01'){
        return index = 1;
    } else if(index == '02'){
        return index = 2;
    } else if(index == '03'){
        return index = 3;
    } else if(index == '04'){
        return index = 4;
    } else if(index == '05'){
        return index = 5;
    } else if(index == '06'){
        return index = 6;
    } else if(index == '07'){
        return index = 7;
    } else if(index == '08'){
        return index = 8;
    } else if(index == '09'){
        return index = 9;
    }
}

// Get today's occupancy information
var todayRefresh = function() {
    var tempRef = database.ref(today);
    var todayCurr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var index;
     
    tempRef.on('value', function(snapshot) {
        currentOcc = lastOcc;
        todayCurr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        todayHours = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        todayHoursToAvg = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            //Check if sensorId matches current room
            if(sensorId == childData['sensor_id']){
                index = childData['time'].substring(0,2);
                index = formatIndex(index);
                currentOcc = currentOcc + childData['value'];
                todayCurr[index] = currentOcc;
                
                todayHoursToAvg[index].push(todayCurr[index]);
            }
            
            bar.animate(currentOcc/maxOcc);
            document.getElementById('occupancyPercentage').innerHTML = ((currentOcc/maxOcc)*100).toFixed(1) + '%';
            document.getElementById('currentOccupancy').innerHTML = currentOcc;
        });
        for(var i=0; i<todayHours.length; i++){
            var sum = 0;
            for(var j=0; j<todayHoursToAvg[i].length; j++){
                sum += todayHoursToAvg[i][j];
            }
            if(sum == 0){
                todayHours[i] = 0;
            } else {
                todayHours[i] = (sum/(todayHoursToAvg[i].length)).toFixed(2);
            }
        }
        ChartRefresh();
    });
}

var yesterdayRefresh = function() {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = DateFormat.format.date(yesterday,"dd-MM-yyyy");
    var index;
    
    var tempRefYest = database.ref(yesterday);
    tempRefYest.on('value', function(snapshot) {
        var yesterdayCurr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        yesterdayHours = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        yesterdayHoursToAvg = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
        snapshot.forEach(function(childSnapshot) {
            if(Number.isInteger(childSnapshot.val())){
                lastOcc = childSnapshot.val();
                todayRefresh();
            }
            var childData = childSnapshot.val();
            // Check if sensorId matches current room
            if(sensorId == childData['sensor_id']){
                index = childData['time'].substring(0,2);
                index = formatIndex(index);                
                yesterdayCurr[index] = yesterdayCurr[index] + childData['value'];
                yesterdayHours[index] = yesterdayHours[index] + childData['value'];
                
                if(yesterdayHoursToAvg[index] == undefined){
                    yesterdayHoursToAvg[index] = [];
                }
                yesterdayHoursToAvg[index].push(yesterdayCurr[index]);
            }
        });
        // If there is no lastOcc, push one to database and refresh today's data
        if(lastOcc == 0 && snapshot.pop != undefined){
            lastOcc = currentOcc;
            tempRefYest.on("value", function(snapshot){
                tempRefYest.update({"last_occupancy":lastOcc});
            });
            todayRefresh();
        }
        if(snapshot.pop == undefined){
            lastOcc = 0;
            todayRefresh();
        }
    });
}
       
// Pull occupancy data from selected date to display in historical graph
var chartDatePickedRefresh = function() {
    var yestDatePicked = new Date();
    yestDatePicked.setDate(yestDatePicked.getDate() - 1);
    yestDatePicked = DateFormat.format.date(yestDatePicked,"dd-MM-yyyy");
    var tempDatePicked = database.ref(chartDatePicked);
    var index;
    tempDatePicked.on('value', function(snapshot) {
        var datePickedCurr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        datePickedHours = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        datePickedHoursToAvg = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
        var lastOccPicked = 0;
        var yestTempDatePicked = database.ref(yestDatePicked);
        yestTempDatePicked.on('value', function(snapshot2) {
            snapshot2.forEach(function(childSnapshot) {
                if(Number.isInteger(childSnapshot.val())){
                    lastOccPicked = childSnapshot.val();
                }
            });
        });
        var datePickedCurrentOcc = lastOccPicked;
        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            // Check if sensorId matches current room
            if(sensorId == childData['sensor_id']){
                index = childData['time'].substring(0,2);
                index = formatIndex(index);
                datePickedCurrentOcc = datePickedCurrentOcc + childData['value'];
                datePickedCurr[index] = datePickedCurrentOcc;
                datePickedHours[index] = datePickedCurrentOcc;
                
                if(datePickedHoursToAvg[index] == undefined){
                    datePickedHoursToAvg[index] = [];
                }
                datePickedHoursToAvg[index].push(datePickedCurr[index]);
            }
        });
        for(var i=0; i<datePickedHours.length; i++){
            var sum = 0;
            for(var j=0; j<datePickedHoursToAvg[i].length; j++){
                sum += datePickedHoursToAvg[i][j];
            }
            if(sum == 0){
                datePickedHours[i] = 0;
            } else {
                datePickedHours[i] = (sum/(datePickedHoursToAvg[i].length)).toFixed(2);
            }
        }
        ChartRefresh();
        });
};

// Pull the current room's sensorId and maxOcc
var PageRefresh = function() {
    room = roomDropdown.options[roomDropdown.selectedIndex].value;
    roomRef = database.ref('rooms/'+room);
    roomRef.on("value", function(snapshot){
        var data = snapshot.val();
        sensorId = data['sensor_id'];
        document.getElementById('sensor_id').innerHTML = sensorId;
            sensorUpdate();
            maxOcc = data['max_occupancy'];
        document.getElementById('maxOccupancy').innerHTML = maxOcc;
    });
        resetRef.on('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
        });
    });
    yesterdayRefresh();
};

// Updates sensor's toggle information based on database
function sensorUpdate(){
    var sensorRef = database.ref('sensors/'+sensorId);
    sensorRef.on("value", function(snapshot){
        var data = snapshot.val();
        if(data['on'] == 1){
            // Sensor is on
            $('#sensor_checkbox').bootstrapToggle('on');
            //sensorOn = true;
        } else if(data['on'] == 0){
            // Sensor is off
            $('#sensor_checkbox').bootstrapToggle('off');
            //sensorOn = false;
        }
    });
};
    
$(document).ready(function(){
    var date_input=$('input[name="date"]'); //our date input has the name "date"
    var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
    var options={
        format: 'mm/dd/yyyy',
        container: container,
        todayHighlight: true,
        autoclose: true,
    };
    date_input.datepicker(options);
     
    // When historical date is selected, updates graph
    $("#dateButton").on("click", function () {
        var temp = document.getElementById('date').value;
        //Format the Date to MM/dd/YYYY
        chartDatePicked = temp[3]+temp[4]+'-'+temp[0]+temp[1]+'-'+temp[6]+temp[7]+temp[8]+temp[9];
        chartDatePickedRefresh();
     });     
    
    // When current occupancy is modified, updates page and database
    $("#current_occupancy_edit_confirm").on("click", function () {
        var today = new Date();
        today = DateFormat.format.date(today, "dd-MM-yyyy");
        var time = new Date();
        time = DateFormat.format.date(time, "HH:mm:ss");
        var occToPush = -currentOcc+Number(document.getElementById('current_occupancy_edit').value);
        var tempRef = database.ref(today);
        tempRef.push({'time':time,'value':occToPush,'sensor_id':sensorId});
         
        currentOcc = document.getElementById('current_occupancy_edit').value;
         
        bar.animate(currentOcc/maxOcc);
        document.getElementById('occupancyPercentage').innerHTML = ((currentOcc/maxOcc)*100).toFixed(1) + '%';
        document.getElementById('current_occupancy_edit').value = "";
        document.getElementById('current_close_modal').click();
     });
     
    // When max occupancy is modified, updates page and database
    $("#max_occupancy_edit_confirm").on("click", function () {
        maxOcc = document.getElementById('max_occupancy_edit').value;
        roomRef.on("value", function(snapshot){
            roomRef.update({"max_occupancy":maxOcc});
        });
        bar.animate(currentOcc/maxOcc);
        document.getElementById('occupancyPercentage').innerHTML = ((currentOcc/maxOcc)*100).toFixed(1) + '%';
        document.getElementById('max_occupancy_edit').value = "";
        document.getElementById('max_close_modal').click();
      });
     
    $("#record_edit_confirm").on("click", function () {
        var recordTime = document.getElementById('record_time').value;
        if(recordTime == "" || recordTime == 0 || recordTime == null || recordTime == undefined){
             
        } else {
            var sensorRef = database.ref('sensors/'+sensorId);
            sensorRef.once("value", function(snapshot){
                sensorRef.update({"record_time":recordTime, "record":1});
            });
            document.getElementById('record_close_modal').click();   
        }
      });
    
    // When sensor's toggle buttons are clicked, update database and toggle display
    $(".sensor_checkbox_on").on("click", function () { 
        var on;
        var sensorRef = database.ref('sensors/'+sensorId);
        sensorRef.on("value", function(snapshot){
            var data = snapshot.val();
            if(data['on'] == 1){
                on = true;
            } else if(data['on'] == 0) {
                on = false;
            }
        })
        
        // If database value is different than checked value, then change the database value
        if(on != !$('#sensor_checkbox').prop('checked')){
            if(!$('#sensor_checkbox').prop('checked') == true){
                sensorRef.once('value', function(snapshot) {
                    sensorRef.update({"on": 1});
                });
                $('#sensor_checkbox').bootstrapToggle('off');
            }
            else if(!$('#sensor_checkbox').prop('checked') == false){
                sensorRef.once('value', function(snapshot) {
                    sensorRef.update({"on": 0});
                });
                $('#sensor_checkbox').bootstrapToggle('on');
            }
        }
    });
});