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
  drawPoints();
  mainContext.restore();
  hiddenContext.restore();
}

canvas.call(zoom);

genreLabels=["Drama","Horror","Short","Action","Documentary","Thriller","Comedy","Avant-Garde","Animation","Romance","War","Western"]
var color = d3.scaleOrdinal(d3.schemePaired);
color.domain(genreLabels);

function updateLegend(labelArray){
  labelArray.forEach(function(i,labelArray){
    d3.select('.legend').append("div").attr("class","legendColor").style('background-color', color(i));
    d3.select('.legend').append("p").attr("class","legendLabel").text(i);
  });
}

updateLegend(genreLabels);

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
function drawPoints() {
  stats.begin();
  mainContext.beginPath();
  hiddenContext.beginPath();
  movieIDs.forEach(function(movieID){
    drawPoint(movieID);
  });
  mainContext.fill();
  hiddenContext.fill();
  stats.end();
}

function drawPoint(movieIndex){
  if(movieList.getMainColor(movieIndex)!=undefined){
    mainContext.fillStyle = movieList.getMainColor(movieIndex);
    hiddenContext.fillStyle = movieList.getHiddenColor(movieIndex); 
  }
  mainContext.fillRect(canvasScaleX(movieList.getXcord(movieIndex)), -canvasScaleY(movieList.getYcord(movieIndex)),2,2);
  hiddenContext.fillRect(canvasScaleX(movieList.getXcord(movieIndex)), -canvasScaleY(movieList.getYcord(movieIndex)),2,2);
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
    
      console.log(hoverNode);

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
