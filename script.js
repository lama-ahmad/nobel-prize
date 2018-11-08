
var xStep; //determine the size of the gap between two points on the x axis
var yStep; //determine the size of the gap between two points on the y axis

var positions = []; //an array of positions where we will store each of our Vectors
var medal;

var femaleWinners;
var maleWinners;

var dataPoints = [];

// create arrays for each nobel prize cateogry
var economics_winners = [];
var peace_winners = [];
var chemistry_winners = [];
var medicine_winners = [];
var literature_winners = [];
var physics_winners = [];

// array of names (string) for each nobel prize category
var categories = ["economics", "peace", "chemistry", "medicine", "literature", "physics"];

//get current value of selected button
var currentCategoryIndex; 

$(".btn").click(function() {
    currentCategoryIndex= parseInt($(this).val());
    resetSketch();
});  

// array of nobel prize category arrays
var category_arrays = [economics_winners, peace_winners, chemistry_winners,
                        medicine_winners, literature_winners, physics_winners];

//loop through all categories in the outer loop
for (var category = 0; category < categories.length; category++) {
    //loop through nobel prize winners in inner loop
    for (var i = 0; i < nobel_winners.length; i ++) {
        //check if nobel prize winner is in current category and push it to array 
        if (nobel_winners[i].category == categories[category]) {
            category_arrays[category].push(nobel_winners[i]);
        }
    }
}

function preload() {
    medal = loadImage('images/nobel_medal.png');
 }

function setup(){
    createCanvas(windowWidth/2, 800).parent('my-canvas');
}

function resetSketch() {
    $('#category-info').html("");
    clear();
    draw();
}

function currentCategorySetup() {

    $('#winner-info').html("");
    countGender(category_arrays[currentCategoryIndex]);

    createP("There are " + femaleWinners + " female Nobel Prize Winners in " + categories[currentCategoryIndex]).class('gender-stats').id('female-stat').parent('#winner-info');
    createP("There are " + maleWinners + " male Nobel Prize Winners in " + categories[currentCategoryIndex]).class('gender-stats').id('male-stat').parent('#winner-info');


    dataPoints = [];
      
    xStep = 40; //xSpacing
    yStep = 40; //ySpacing
    
      
      for(var x = 20; x < 900; x += xStep){ //start at the first column, where x = 0
      
        for(var y = 30; y < 600; y += yStep){ //go through all the rows (y = 0, y = yStep * 1, y  = yStep * 2, etc.)
        
          var p = createVector(x, y); //we create a vector at this location
          
          positions.push(p); // and then we put the vector into the array
          
        }
        //at the end of the inner for loop, we go back to the first loop, and we increment x
        //now our column is going to be x = xStep*1, and we populate all the rows with the inner for loop
        //and again, and again until x > width
      }
    
      //create the datapoint objects based on the current selected category
      for (var i = 0; i < category_arrays[currentCategoryIndex].length; i++) {
        var posX = positions[i].x;
        var posY = positions[i].y;
        var imgH = 30;
        var imgW = 30;
        var winnerObj = category_arrays[currentCategoryIndex][i];
    
        var aDataPoint = new dataPoint(posX, posY, imgH, imgW, winnerObj);
        dataPoints.push(aDataPoint);
      }

}

function countGender(category) {

    //reassign the values to 0 to reset
    femaleWinners = 0;
    maleWinners = 0;

    //loop through the winners in the category array and adjust counts for gender
    for (var i = 0; i < category.length; i ++) {
        if(category[i].gender == "female") {
            femaleWinners += 1;
        } else {
            maleWinners += 1;
        }
    }

}


function draw(){
    if (currentCategoryIndex != undefined) {
        currentCategorySetup();

        for (var i = 0; i < dataPoints.length; i ++) 
        {
            dataPoints[i].draw();
        }
        noLoop();
    } 
}

//Attaching the mouse click event to each medal
function mousePressed() {
    $("#winner-info").html("");
    for (var i = 0; i < dataPoints.length; i ++) {
        dataPoints[i].clicked();
    }
}

//Creating the dataPoint Class, where each dataPoint is a Nobel Prize winner with various parameters 
function dataPoint(posX, posY, imgH, imgW, winnerObj) {
    this.posX = posX;
    this.posY = posY;
    this.imgH = imgH;
    this.imgW = imgW;
    this.winnerObj = winnerObj;

    //
    this.draw = function() {      
        if (this.winnerObj.gender == "male") {
            tint(153, 255, 153);
            image(medal, this.posX, this.posY, imgH, imgW);
        }
        else {
            tint(255, 153, 153);
            image(medal, this.posX, this.posY, imgH, imgW);
        }
    };

    //If you click on a medal, you will get the information about the winner associated with that medal
    this.clicked = function() {
        if ( mouseX >= posX && mouseX <= posX + imgW &&
            mouseY >= posY && mouseY <= posY + imgH ) {
                createP(this.winnerObj.firstname + " " + this.winnerObj.surname + ", " + this.winnerObj.year).id('winner-nameyr').parent('winner-info');
                if ((this.winnerObj.motivation).length > 0) {
                    createP("Awarded " + this.winnerObj.motivation).parent('winner-info');
                }
                createP("Loading Image...").id("loading").parent('winner-info');
                getWikipediaImage(winnerObj);
            }
    };

}

//Ajax Request to Query the Wikipedia API and get thumbnail images of Winners

$(document).ready(function () {
    $(document).ajaxStart(function () {
        console.log('loading...');
        $("#loading").show();
    }).ajaxStop(function () {
        $("#loading").hide();
    });
});

function getWikipediaImage(winnerObj) {

    console.log("About to make Wiki Request 2 ...");
    //Make Wikipedia AJAX request
    var winnerName = encodeURI(winnerObj.firstname + " " + winnerObj.surname);
    var thumbnailURL = "https://en.wikipedia.org/w/api.php?action=query&titles=" + winnerName + "&prop=pageimages&format=json&pithumbsize=300";
    var queryURL = "https://cors-anywhere.herokuapp.com/" + thumbnailURL;
    console.log(winnerName);
    console.log(thumbnailURL);

    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "json",
        // this headers section is necessary for CORS-anywhere
        headers: {
          "x-requested-with": "xhr" 
        }
      }).done(function(data) {
        console.log('CORS anywhere response', data);
        thisKey = Object.keys(data.query.pages)[0];
        thisKey = parseInt(thisKey);
        
        var theImage;
        if ((data.query.pages[thisKey]).thumbnail != undefined) {
            theImage = data.query.pages[thisKey].thumbnail.source;
        } else {
            theImage = "images/nobel_medal.png";
        }
        createImg(theImage).parent('winner-info');

      }).fail(function(jqXHR, textStatus) { 
        console.error(textStatus);
      });

}
