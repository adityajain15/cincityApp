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

var zoom = d3.zoom()
    .scaleExtent([1, 800])
    .on("zoom", zoomed);

var lastTransform = null;
var similarLines = [];
var similarNodeOrigin = null;

//runs when the canvas captures a zoom event, does some transforms and tells the canvas to redraw itself
function zoomed() {
  var transform = d3.zoomTransform(this);
  lastTransform = transform;
}

canvas.call(zoom);

movieIDs = []
movieList = new MovieList();

var colorList = new LinkedList();
colorList.createList(["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"],"gray");

d3.queue()
  .defer(d3.json, 'movie_user_tsne.json')
  .defer(d3.json, 'bigList.json')
  .await(makeList);

function makeList(error, movieJSON,metaJSON){
  movieJSON["movie_ids"].forEach(function(movieID, point){
      movieObject = new Movie(movieID, movieJSON["movie_tsne"][point][0], movieJSON["movie_tsne"][point][1]);
      movieIDs.push(movieID);
      movieList.addMovie(movieID, movieObject);
    });
  metaJSON.forEach(function(piece){      
      if(movieList.getMovie(piece["info"]["id"])!=null){
        movieList.getMovie(piece["info"]["id"]).setMetaData(piece);
      }
    });

  zoomed();
  zoom.translateBy(canvas, 400, 250);
  zoom.translateBy(hiddenCanvas, 400, 250);

}

var numPoints = 0;

//canvas draws itself
function drawPoints() {
  stats.begin();
  mainContext.clearRect(0, 0, width, height);
  hiddenContext.clearRect(0, 0, width, height);
  mainContext.beginPath();
  hiddenContext.beginPath();
  movieIDs.forEach(function(movieID){
    drawPoint(movieID,lastTransform);
  });
  mainContext.fill();
  hiddenContext.fill();
  if(similarNodeOrigin!=null){
    mainContext.beginPath();
    var transformedOrigin = lastTransform.apply([similarNodeOrigin.getX(),similarNodeOrigin.getY()]);
    similarLines.forEach(function(movieObject){
      mainContext.moveTo(transformedOrigin[0],transformedOrigin[1]);
      var transformedDestination = lastTransform.apply([movieObject.getX(),movieObject.getY()]);
      mainContext.lineTo(transformedDestination[0],transformedDestination[1]);
    });
    mainContext.stroke();
  }
  stats.end();
  numPoints = 0;
  window.requestAnimationFrame(drawPoints);
}

function drawPoint(movieIndex,transform){
  var transformedPoints = transform.apply([movieList.getXcord(movieIndex),movieList.getYcord(movieIndex)]);
  if(transformedPoints[0]>900||transformedPoints[0]<0||transformedPoints[1]>500||transformedPoints[1]<0){
    return;
  }
  if(movieList.getMainColor(movieIndex)!=undefined){
    mainContext.fillStyle = movieList.getMainColor(movieIndex);
    hiddenContext.fillStyle = movieList.getHiddenColor(movieIndex); 
  }  
  mainContext.fillRect(transformedPoints[0],transformedPoints[1],8,8);
  mainContext.stroke();
  hiddenContext.fillRect(transformedPoints[0],transformedPoints[1],8,8);
  numPoints = numPoints + 1;
}

document.getElementById("mainCanvas").addEventListener("mousemove", function(e){
    //d3.select("#mainCanvas").style("cursor","move");
    var mouseX = e.layerX;
    var mouseY = e.layerY;

    
    // Get the corresponding pixel color on the hidden canvas
    // and look up the node in our map.
    var col = hiddenContext.getImageData(mouseX, mouseY, 1, 1).data;
    var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
    hoverNode=colToNode[colString];
    if(hoverNode){
      //d3.select("#mainCanvas").style("cursor","pointer");
      console.log(hoverNode.getCountry());
      d3.select(".tooltip")
      .style("top",(mouseY)+"px")
      .style("left",(20+mouseX)+"px")
      .style("display","block");
    
      d3.select(".tooltipImage")
        .attr("src",hoverNode.getImage())
        .style("width","250px")
        .style("height","125px");

      d3.select(".tooltipName")
        .text(hoverNode.getName());

      d3.select(".tooltipYear")
        .text(hoverNode.getYear());

      d3.select(".tooltipGenre")
        .text(hoverNode.getGenre());

      d3.select(".tooltipDirector")
        .text("Directed by "+hoverNode.getDirector());

      d3.select(".tooltipSynopsis")
        .text(hoverNode.getSynopsis());
      
      
     
    }
    else{
      d3.select(".tooltip")
      .style("display","none");
    }
});

document.getElementById("mainCanvas").addEventListener("click", function(e){
  var mouseX = e.layerX;
  var mouseY = e.layerY;
  var col = hiddenContext.getImageData(mouseX, mouseY, 1, 1).data;
  var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
  hoverNode=colToNode[colString];
  if(hoverNode){
    similarLines = movieList.getSimilarMovies(hoverNode);
    similarNodeOrigin = hoverNode;
  }
});
/*
[#a6cee3,#1f78b4,#b2df8a,#33a02c,#fb9a99,#e31a1c,#fdbf6f,#ff7f00,#cab2d6,#6a3d9a,#ffff99,#b15928]
*/

d3.selectAll(".labelButton").on("click",function(e){ 
  if(d3.select(this).attr("selected")==="false"){
    if(colorList.addGenre(d3.select(this).text())){
      d3.select(this).attr("selected","true");
      d3.select(this).style("background",colorList.getColor(d3.select(this).text()));
      movieList.updateColors();
      //drawPoints();
    }
    else{
      //when over 12 elements
    }  
  }
  else{
    d3.select(this).attr("selected","false");
    d3.select(this).style("background","white");
    colorList.removeGenre(d3.select(this).text());
    movieList.updateColors();
    //drawPoints();
  }
});

window.requestAnimationFrame(drawPoints);

