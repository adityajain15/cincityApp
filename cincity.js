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
    .scaleExtent([1, 400])
    .on("zoom", zoomed)

var squareZoomSize = d3.scaleLog()
    .base(1)
    .domain([1, 20])
    .range([2, 0.04])
    .clamp(true);


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
  //console.log("Zoom is: "+d3.event.transform.k+" Square size is:"+squareZoomSize(d3.event.transform.k));
  drawPoints(d3.event.transform.k);
  mainContext.restore();
  hiddenContext.restore();
  //window.requestAnimationFrame(zoomed);
  //console.log(zoom.scale(), zoom.translate());
}

canvas.call(zoom);

movieIDs = []
movieList = new MovieList();


//runs when data is loaded. Draws the initial points and sets up the canvas frame so that everything is centered and zoomed nicely
d3.json("movie_user_tsne.json",function(error,data){
  data["movie_ids"].forEach(function(movieID, point){
    movieObject = new Movie(movieID, data["movie_tsne"][point][0], data["movie_tsne"][point][1]);
    movieIDs.push(movieID);
    movieList.addMovie(movieID, movieObject);
  });
  zoom.scaleTo(canvas, 1);
  zoom.translateBy(canvas, 00, 480);
  zoom.scaleTo(hiddenCanvas, 1);
  zoom.translateBy(hiddenCanvas, 00, 480);
});

d3.json("bigList.json",function(error,data){
    data.forEach(function(piece){      
      if(movieList.getMovie(piece["info"]["id"])!=null){
        movieList.getMovie(piece["info"]["id"]).setMetaData(piece);
      }
    });
  });

//canvas draws itself
function drawPoints(zoomLevel) {
  stats.begin();
  mainContext.beginPath();
  hiddenContext.beginPath();
  movieIDs.forEach(function(movieID){
    drawPoint(movieID,zoomLevel);
  });
  mainContext.fill();
  hiddenContext.fill();
  stats.end();
  
}

function drawPoint(movieIndex,zoomLevel){
  if(movieList.getMainColor(movieIndex)!=undefined){
    mainContext.fillStyle = movieList.getMainColor(movieIndex);
    hiddenContext.fillStyle = movieList.getHiddenColor(movieIndex); 
  }

  mainContext.fillRect(canvasScaleX(movieList.getXcord(movieIndex)), -canvasScaleY(movieList.getYcord(movieIndex)),squareZoomSize(zoomLevel),squareZoomSize(zoomLevel));
  hiddenContext.fillRect(canvasScaleX(movieList.getXcord(movieIndex)), -canvasScaleY(movieList.getYcord(movieIndex)),squareZoomSize(zoomLevel),squareZoomSize(zoomLevel));
}

document.getElementById("mainCanvas").addEventListener("mousemove", function(e){
    
    var mouseX = e.layerX;
    var mouseY = e.layerY;

    
    // Get the corresponding pixel color on the hidden canvas
    // and look up the node in our map.
    var col = hiddenContext.getImageData(mouseX, mouseY, 1, 1).data;
    var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
    hoverNode=colToNode[colString];
    if(hoverNode){
      d3.select(".tooltip")
      .style("top",(mouseY)+"px")
      .style("left",(20+mouseX)+"px")
      .style("display","block");
    
      //console.log(hoverNode.movieData.genres);

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

/*
[#a6cee3,#1f78b4,#b2df8a,#33a02c,#fb9a99,#e31a1c,#fdbf6f,#ff7f00,#cab2d6,#6a3d9a,#ffff99,#b15928]
*/

var colorList = new LinkedList();
colorList.createList(["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"],"gray");

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

//window.requestAnimationFrame(zoomed);

