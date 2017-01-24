var canvas = d3.select("canvas"),
    context = canvas.node().getContext("2d"),
    width = canvas.property("width"),
    height = canvas.property("height"),
    radius = 2.5;

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
    .scaleExtent([1 / 2, 4])
    .on("zoom", zoomed)

canvas.call(zoom);

movieData=null


//runs when data is loaded. Draws the initial points and sets up the canvas frame so that everything is centered and zoomed nicely
d3.json("movie_user_tsne.json",function(error,data){
  movieData=data;
  drawPoints();
  zoom.scaleTo(canvas, 1);
  zoom.translateBy(canvas, 00, 480)
});

//runs when the canvas captures a zoom event, does some transforms and tells the canvas to redraw itself
function zoomed() {
  context.save();
  context.clearRect(0, 0, width, height);
  context.translate(d3.event.transform.x, d3.event.transform.y);
  context.scale(d3.event.transform.k, d3.event.transform.k);
  drawPoints();
  context.restore();
}

//canvas draws itself
function drawPoints() {
  stats.begin();
  context.beginPath();
  movieData['movie_tsne'].forEach(drawPoint);
  context.fill();
  stats.end();
}

function drawPoint(point) {
  context.fillRect(canvasScaleX(point[0]), -canvasScaleY(point[1]),2,2);
  //context.moveTo(canvasScaleX(point[0]),-canvasScaleY(point[1]));
  //context.arc(canvasScaleX(point[0]), -canvasScaleY(point[1]), radius, 0, 2 * Math.PI);  
}
