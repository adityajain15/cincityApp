var canvas = d3.select("#mainCanvas").attr("height",window.innerHeight/2).attr("width",window.innerWidth/2),
    mainContext = canvas.node().getContext("2d"),
    width = canvas.property("width"),
    height = canvas.property("height")

var hiddenCanvas = d3.select("#hiddenCanvas").attr("height",window.innerHeight/2).attr("width",window.innerWidth/2),
    hiddenContext = hiddenCanvas.node().getContext("2d")

var HUD = d3.select("#HUD").style("height",window.innerHeight/1.98).style("width",window.innerWidth/2.1);

var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms, 2: mb

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.getElementById("canvasContainer").appendChild( stats.domElement );

//x-Scale for Micha's image to Canvas conversion. [-50,200] was the x-range for Micha's image

var zoom = d3.zoom()
    .scaleExtent([1, 800])
    .on("zoom", zoomed);

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
  zoom.translateBy(hiddenCanvas, 150, 200);
  window.requestAnimationFrame(drawPoints);
}

//canvas draws itself
function drawPoints() {
  stats.begin();
  mainContext.clearRect(0, 0, width, height);
  hiddenContext.clearRect(0, 0, width, height);
  //drawVoronoi();
  mainContext.beginPath();
  hiddenContext.beginPath();
  movieIDs.forEach(function(movieID){
    drawPoint(movieID,lastTransform,document.getElementById("hideUnlabeled").checked,document.getElementById("showCountries").checked);
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
  window.requestAnimationFrame(drawPoints);
}

function drawPoint(movieIndex,transform,labelCheckbox,flagCheckbox){
  var transformedPoints = transform.apply([movieList.getXcord(movieIndex),movieList.getYcord(movieIndex)]);
  if(transformedPoints[0]>width||transformedPoints[0]<0||transformedPoints[1]>height||transformedPoints[1]<0){
    return;
  }
  if(labelCheckbox&&movieList.getMainColor(movieIndex)=="#D3D3D3"){
    return;
  }
  if(movieList.getMainColor(movieIndex)!=undefined){
    mainContext.fillStyle = movieList.getMainColor(movieIndex);
    hiddenContext.fillStyle = movieList.getHiddenColor(movieIndex); 
  }
  if(flagCheckbox){
    flag = countries[movieList.getCountryName(movieIndex)];
    //if(flag==undefined){ flag = countries.find(function(e){return e.name=="undefined"});}
    mainContext.drawImage(flag,transformedPoints[0], transformedPoints[1],16,12);
    hiddenContext.fillRect(transformedPoints[0],transformedPoints[1],16,12);
  }
  else{
    mainContext.fillRect(transformedPoints[0],transformedPoints[1],8,8);
    hiddenContext.fillRect(transformedPoints[0],transformedPoints[1],13,13);
  }

}
var mouseX;
var mouseY;

document.getElementById("mainCanvas").addEventListener("mousemove", function(e){
    //d3.select("#mainCanvas").style("cursor","move");
    mouseX = e.layerX;
    mouseY = e.layerY-document.body.scrollTop;

    //console.log(mouseX+","+mouseY);

    // Get the corresponding pixel color on the hidden canvas
    // and look up the node in our map.
    var col = hiddenContext.getImageData(mouseX, mouseY, 1, 1).data;
    var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
    hoverNode=colToNode[colString];
    if(hoverNode){
      //console.log(hoverNode);
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
    else{
      d3.select(".tooltip")
      .style("display","none");
    }
});

document.getElementById("mainCanvas").addEventListener("click", function(e){
  var mouseX = e.layerX;
  var mouseY = e.layerY-document.body.scrollTop;;
  var col = hiddenContext.getImageData(mouseX, mouseY, 1, 1).data;
  var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
  hoverNode=colToNode[colString];
  if(hoverNode){
    getInfo(hoverNode.getID(),false);
  }
});

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
  }
});

function makeHUD(){
  divNames = [];
  for(let each of movieIDs){
    if(movieList.getMovie(each).getName()!=undefined){
      divNames.push([each,movieList.getMovie(each).getName().trim()]);
    }
  }
  divNames.sort(function(a,b){
    if(a[1]>b[1]){return 1;}
    else if(a[1]<b[1]){return -1;}
    else return 0;
  });
  for(let each of divNames){
    d3.select("#HUDcontent").append("div").text(each[1]).attr("movieid",each[0]).attr("class","movieOption")
    .on("click",function(){
      getInfo(d3.select(this).attr("movieid"),true);
    });
  }
}

d3.select("#closebutton").on("click",function(){
  d3.select("#movieInfo").style("display","none");
  d3.select("#HUDcontent").style("display","block");
});

function zoomToNode(){
  canvas.transition().duration(2500).call(zoom.transform, d3.zoomIdentity
    .translate(width / 2, height / 2)
    .scale(500)
    .translate(-movieNode.getX(),-movieNode.getY()));
}

function getInfo(movieID,zoomFlag){
  
  var movieNode = movieList.getMovie(movieID);
  
  if(zoomFlag){
    zoomToNode(movieNode);
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

function makeResponsive(){
  d3.select("#mainCanvas").attr("height",window.innerHeight/2).attr("width",window.innerWidth/2);
  d3.select("#hiddenCanvas").attr("height",window.innerHeight/2).attr("width",window.innerWidth/2);
  d3.select("#HUD").style("height",window.innerHeight/1.98).style("width",window.innerWidth/2.1);
  width = canvas.property("width");
  height = canvas.property("height");
} 

document.getElementById("searchBar").addEventListener("input", logEvent, true);

var waypoint = new Waypoint({
  element: document.getElementById('helloThere'),
  handler: function(direction) {
    console.log('Scrolled to waypoint!')
  }
})

function logEvent(){
  d3.selectAll(".movieOption").selectAll(function(){
    if((d3.select(this).text()).includes(document.getElementById("searchBar").value))
    {
      d3.select(this).style("display","block");
    }
    else{
      d3.select(this).style("display","none");
    }
  })
}
