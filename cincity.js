var canvas = d3.select("#mainCanvas").attr("height",window.innerHeight/2 - 8).attr("width", halfWidth() - 8),
    mainContext = canvas.node().getContext("2d"),
    width = canvas.property("width"),
    height = canvas.property("height")

var HUD = d3.select("#HUD").style("height",window.innerHeight/2 - 19).style("width",halfWidth());

var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms, 2: mb

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.getElementById("canvasContainer").appendChild( stats.domElement );

var zoom = d3.zoom()
    .scaleExtent([1, 800])
    .on("zoom", zoomed);

zoom.on('end',function(){
  movieList.quadtreeReset();
  for (var i = 0, len = movieIDs.length; i < len; i++){
    var transPoints = transformedPoints(lastTransform,movieList.getMovie(movieIDs[i]).getX(),movieList.getMovie(movieIDs[i]).getY())
    movieList.quadtreeAdd([transPoints[0],transPoints[1],movieIDs[i]]); 
  }
});

function transformedPoints(transform,x,y){
  return transform.apply([x,y]);
}

var lastTransform = null;
var similarLines = [];
var similarNodeOrigin = null;

//runs when the canvas captures a zoom event, does some transforms and tells the canvas to redraw itself
function zoomed() {
  lastTransform = d3.zoomTransform(this);
}

canvas.call(zoom);

movieIDs = []
movieList = new MovieList();
var countryNames = null;
var countries = {};

var colorList = new LinkedList();
colorList.createList(["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"],"#D3D3D3");

d3.queue()
  .defer(d3.json, 'movie_user_tsne.json')
  .defer(d3.json, 'babyList.json')
  .await(makeList);

function makeList(error, movieJSON,metaJSON){
  movieJSON["movie_ids"].forEach(function(movieID, point){
    movieObject = new Movie(movieID, movieJSON["movie_tsne"][point][0], movieJSON["movie_tsne"][point][1]);
    movieIDs.push(movieID);
    movieList.addMovie(movieID, movieObject);
  });
  for(i in metaJSON){
    for(key in metaJSON[i]){
      movieList.getMovie(key).setMetaData(metaJSON[i][key]);
    }
  }
  countryNames = new Set(movieIDs.map(function(movieID){return movieList.getCountryName(movieID);}));
  countryNames.forEach(function(each){
    var tempCountry = new Image();
    tempCountry.name = each;
    tempCountry.src = "flags/"+each+".png";
    countries[tempCountry.name]=tempCountry;
  });

  d3.selectAll(".labelButton").selectAll(function(d,i){

    if(d3.select(this).attr("selected")=="true"){
      colorList.addGenre(d3.select(this).text());
      d3.select(this).style("background",colorList.getColor(d3.select(this).text()));
      movieList.updateColors();
    }

  });


  makeHUD();

  zoomed();
  zoom.translateBy(canvas, 150, 200);
  console.log("Done")
  window.requestAnimationFrame(drawPoints);
}
//canvas draws itself
function drawPoints() {
  stats.begin();

  mainContext.clearRect(0, 0, width, height);
  mainContext.beginPath();
  var option1 = document.getElementById("hideUnlabeled").checked;
  var option2 = document.getElementById("showCountries").checked;
  for (var i = 0, len = movieIDs.length; i < len; i++){
    drawPoint(movieIDs[i],lastTransform,option1,option2);
  }
  
  mainContext.fill();
  
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
  window.requestAnimationFrame(drawPoints);
}

function drawPoint(movieIndex,transform,labelCheckbox,flagCheckbox){
  var transformedPoints = transform.apply([movieList.getXcord(movieIndex),movieList.getYcord(movieIndex)]);
  if(transformedPoints[0]>width||transformedPoints[0]<0||transformedPoints[1]>height||transformedPoints[1]<0){
    return;
  }
  if(labelCheckbox&&movieList.getMainColor(movieIndex)=="#D3D3D3"&&notInSimilarLines(movieIndex)){
    return;
  }
  if(movieList.getMainColor(movieIndex)!=undefined){
    mainContext.fillStyle = movieList.getMainColor(movieIndex);
  }
  if(flagCheckbox){
    flag = countries[movieList.getCountryName(movieIndex)];
    mainContext.drawImage(flag,transformedPoints[0], transformedPoints[1],16,12);
  }
  else{
    mainContext.fillRect(transformedPoints[0],transformedPoints[1],8,8);
  }
}

function notInSimilarLines(movieIndex){

  for (var i = 0, len = similarLines.length; i < len; i++){

    if(similarLines[i].getID()==movieIndex){
      return false;
    }
  }
  return true;
}

document.getElementById("mainCanvas").addEventListener("mousemove", function(e){
  var mouseX = e.layerX;
  if(d3.select("#canvasContainer").style('position')==='fixed'){
    var mouseY = e.layerY-document.body.scrollTop;;
  }
  else{
    var mouseY = e.layerY;
  }
  searchNode = movieList.quadtree.find(mouseX-8,mouseY-8,8);
  if(searchNode!=undefined){
    hoverNode=movieList.getMovie(searchNode[2]);
    console.log(hoverNode);
    if(!(document.getElementById("hideUnlabeled").checked&&movieList.getMainColor(searchNode[2])==="#D3D3D3"&&notInSimilarLines(searchNode[2]))){
      d3.select(".tooltip")
      .style("top",(mouseY)+"px")
      .style("left",(20+mouseX)+"px")
      .style("display","block");

      d3.select(".tooltipName")
      .text(hoverNode.getName());

      d3.select(".tooltipYear")
      .text(hoverNode.getYear());

      d3.select(".tooltipGenre")
      .text(hoverNode.getGenre());

      d3.select(".tooltipDirector")
      .text("Directed by "+hoverNode.getDirector());

      d3.select(".tooltipAlert")
      .text("Click for details");
    }
  }
  else{
    d3.select(".tooltip")
    .style("display","none");
  }
});

document.getElementById("mainCanvas").addEventListener("click", function(e){
  var mouseX = e.layerX;
  if(d3.select("#canvasContainer").style('position')==='fixed'){
    var mouseY = e.layerY-document.body.scrollTop;;
  }
  else{
    var mouseY = e.layerY;
  }
  searchNode = movieList.quadtree.find(mouseX-8,mouseY-8,8);
  if(searchNode!=undefined){
    hoverNode=movieList.getMovie(searchNode[2]);
    if(!(document.getElementById("hideUnlabeled").checked&&movieList.getMainColor(searchNode[2])==="#D3D3D3")){
      getInfo(hoverNode.getID(),false);
    }
  }
});

function zoomToNode(movieNode,zoomLevel){
  canvas.transition().duration(2500).call(zoom.transform, d3.zoomIdentity
    .translate(width / 2, height / 2)
    .scale(zoomLevel)
    .translate(-movieNode.getX(),-movieNode.getY()));
}

function guidedZoom(movieNodes,zoomLevels,description,labels,similarNodes=[],current=0){
  if(current<movieNodes.length){

    canvas.transition().duration(3500).call(zoom.transform, d3.zoomIdentity
    .translate(width / 2, height / 2)
    .scale(zoomLevels[current])
    .translate(-movieNodes[current].getX(),-movieNodes[current].getY()));

    if(!(similarNodes.length==0)){
      similarNodeOrigin = similarNodes[current];
      similarLines = movieList.getSimilarMovies(similarNodes[current]);
    }

    d3.select("#canvasLabel")
      .transition()
      .duration(500)
      .style("opacity",0)
      .ease(d3.easeLinear)
      .on("end",function(){
        d3.select(this)
        .text(description+labels[current])
        .transition()
        .duration(3500)
        .style("opacity",1)
        .ease(d3.easeLinear)
        .on("end",function(){guidedZoom(movieNodes,zoomLevels,description,labels,similarNodes,current+1)});
      });
  }
}

function stopZoom(){
  canvas.transition();
}

function getInfo(movieID,zoomFlag){
  
  var movieNode = movieList.getMovie(movieID);
  
  if(zoomFlag){
    zoomToNode(movieNode,500);
  }

  similarLines = movieList.getSimilarMovies(movieNode);
  similarNodeOrigin = movieNode;

  d3.select("#HUDcontent").style("display","none");
  d3.select("#movieImage").attr("src",movieNode.getImage());
  d3.select("#movieTitle").text(movieNode.getName());
  d3.select("#movieYear").text(movieNode.getYear());
  d3.select("#movieDirector").text("Directed by "+movieNode.getDirector());
  d3.select("#movieAverage").text(movieNode.getAverage());
  d3.select("#movieTime").text(movieNode.getTime());
  d3.select("#movieTotal").text(movieNode.getTotal());

  if(movieNode.getGenre()!=undefined){
    d3.select("#movieGenre").text(movieNode.getGenre());
  }
  else{
    d3.select("#movieGenre").text("NA");
  }
  if(movieNode.getSynopsis()!=undefined){
    d3.select("#movieSynopsis").text(movieNode.getSynopsis());
  }
  else{
    d3.select("#movieSynopsis").text("Synopsis not available");
  }
  if(movieList.getCountryName(movieID)!=undefined){
    d3.select("#HUDflag").attr("src","flags/"+movieList.getCountryName(movieID)+".png");
  }
  else{
    d3.select("#HUDflag").attr("src","flags/undefined.png");
  }
  d3.select("#movieInfo").style("display","block");
}

window.onresize = makeResponsive;

function halfWidth() {
  var width = (window.innerWidth/2) - 20;
  return width;
}

function makeResponsive(){
  d3.select("#mainCanvas").attr("height",window.innerHeight/2 - 8).attr("width",halfWidth() - 8);
  d3.select("#HUD").style("height",window.innerHeight/2 - 19).style("width",halfWidth());
  width = canvas.property("width");
  height = canvas.property("height");
  d3.select("#dreduction").style('top',document.getElementById('helloThere').getBoundingClientRect().top+document.body.scrollTop);
  d3.select("#mubi").style('top',document.getElementById('mubiHeadline').getBoundingClientRect().top+document.body.scrollTop);
  d3.select("#graph").style('top',document.getElementById('graphpara').getBoundingClientRect().top+document.body.scrollTop);
  d3.select("#admatrix").style('top',document.getElementById('process').getBoundingClientRect().top+document.body.scrollTop);
} 
