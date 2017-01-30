var canvas = d3.select("#mainCanvas"),
    mainContext = canvas.node().getContext("2d"),
    width = canvas.property("width"),
    height = canvas.property("height")

var hiddenCanvas = d3.select("#hiddenCanvas"),
    hiddenContext = hiddenCanvas.node().getContext("2d")

var stats = new Stats();
stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );

//x-Scale for Micha's image to Canvas conversion. [-50,200] was the x-range for Micha's image
var canvasScaleX = d3.scaleLinear()
    .domain([-100,500])
    .range([0, 1400]);

var canvasScaleY= d3.scaleLinear()
    .domain([-150,200])
    .range([0, 500]);

var zoom = d3.zoom()
    .scaleExtent([1 / 2, 8])
    .on("zoom", zoomed)

//runs when the canvas captures a zoom event, does some transforms and tells the canvas to redraw itself
function zoomed() {
  mainContext.save();
  hiddenContext.save();
  mainContext.clearRect(0, 0, width, height);
  hiddenContext.clearRect(0, 0, width, height);
  mainContext.translate(d3.event.transform.x, d3.event.transform.y);
  hiddenContext.translate(d3.event.transform.x, d3.event.transform.y);
  mainContext.scale(d3.event.transform.k, d3.event.transform.k);
  hiddenContext.scale(d3.event.transform.k, d3.event.transform.k);
  drawPoints(mainContext);
  drawPoints(hiddenContext);
  mainContext.restore();
  hiddenContext.restore();
}

canvas.call(zoom);

genreLabels=["Drama","Horror","Short","Action","Documentary","Thriller","Comedy","Avant-Garde","Animation","Romance","War","Western"]
var color = d3.scaleOrdinal(d3.schemePaired);
color.domain(genreLabels);
console.log(color("Short"))

function updateLegend(labelArray){
  labelArray.forEach(function(i,labelArray){
    d3.select('.legend').append("div").attr("class","legendColor").style('background-color', color(i));
    d3.select('.legend').append("p").attr("class","legendLabel").text(i);
  });
}

updateLegend(genreLabels);

moviePoints = null
movieData = []

//runs when data is loaded. Draws the initial points and sets up the canvas frame so that everything is centered and zoomed nicely
d3.json("movie_user_tsne.json",function(error,data){
  moviePoints=data;
  zoom.scaleTo(canvas, 1);
  zoom.translateBy(canvas, 00, 480);
  zoom.scaleTo(hiddenCanvas, 1);
  zoom.translateBy(hiddenCanvas, 00, 480);
});

d3.json("bigList.json",function(error,data){
    movieData = data;
    //drawPoints();
  });

//canvas draws itself
function drawPoints(theContext) {
  stats.begin();
  theContext.beginPath();
  moviePoints['movie_tsne'].forEach(function(point,index){drawPoint(point,moviePoints['movie_ids'][index],theContext)});
  theContext.fill();
  stats.end();
}

function drawPoint(point,movieIndex,theContext) {
  if(movieData.length!=0){
    if(movieData[movieIndex]!=null){ //some of the movie_ids are not in bigList (which is a bit weird), hence this fix
      if(genreLabels.includes(movieData[movieIndex]["genres"][0])){
        theContext.fillStyle = color(movieData[movieIndex]["genres"][0]);
      }
      else{
        return;
      }
    }
  }
  theContext.fillRect(canvasScaleX(point[0]), -canvasScaleY(point[1]),2,2);
  //hiddenContext.fillRect(250,250,30,30);
  //context.fillRect(Math.floor(canvasScaleX(point[0])), -Math.floor(canvasScaleY(point[1])),2,2);
}

document.getElementById("mainCanvas").addEventListener("click", function(e){
    
    var mouseX = e.layerX;
    var mouseY = e.layerY;
    drawPoints(hiddenContext);
    // Get the corresponding pixel color on the hidden canvas
    // and look up the node in our map.
    var col = mainContext.getImageData(mouseX, mouseY, 1, 1).data;

    console.log(col);
  });
