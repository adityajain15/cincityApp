document.getElementById("searchBar").addEventListener("input", logEvent, true);


var divNames;
var filtered_divNames;
var divHeight;

function logEvent(){
  var searchValue = document.getElementById("searchBar").value.toLowerCase();
  filtered_divNames = [];
  if(searchValue!=""){
    for(var i=0;i<divNames.length;i++){
      if(divNames[i][1].toLowerCase().includes(searchValue)){
        filtered_divNames.push(divNames[i]);
      }
    }
  }
  makeOptiondivs_wrapper();
}

function makeHUD(){
  divNames = [];
  for(var i=0;i<movieIDs.length;i++){
    if(movieList.getMovie(movieIDs[i]).getName()!=undefined){
      divNames.push([movieIDs[i],movieList.getMovie(movieIDs[i]).getName().trim()]);
    }
  }
  divNames.sort(function(a,b){
    if(a[1]>b[1]){return 1;}
    else if(a[1]<b[1]){return -1;}
    else return 0;
  });
  for(var i=0;i<15;i++){
    d3.select("#HUDcontent").append("div").text(divNames[i][1]).attr("movieid",divNames[i][0]).attr("class","movieOption")
    
  }
  divHeight = document.getElementsByClassName('movieOption')[0].clientHeight;
  d3.selectAll(".movieOption").on("click",function(){
      getInfo(d3.select(this).attr("movieid"),true);
  });
}

document.getElementById('HUD').addEventListener('scroll', function(e) {
  makeOptiondivs_wrapper();
});

function makeOptiondivs_wrapper(){
  if(document.getElementById("searchBar").value==""){
    makeOptiondivs(divNames);
  }
  else{
    makeOptiondivs(filtered_divNames);
  }
}

function makeOptiondivs(theArray){
  var HUDcontent = document.getElementById('HUDcontent');
  var start = Math.floor(document.getElementById('HUD').scrollTop/divHeight);
  while (HUDcontent.hasChildNodes()) {
    HUDcontent.removeChild(HUDcontent.lastChild);
  }
  d3.select("#HUDcontent").append("div").attr("id","fillerOption1").style("height",divHeight*start+"px");
  d3.select("#HUDcontent").append("div").attr("id","fillerOption2").style("height",divHeight*(theArray.length-(start+15)));

  for(var i=0;(i<15)&&(start<theArray.length);i++){
      var newNode = document.createElement("div");
      newNode.className='movieOption';
      newNode.innerHTML=theArray[start][1];      
      newNode.setAttribute('movieid',theArray[start][0]);
      document.getElementById('HUDcontent').insertBefore(newNode, document.getElementById('fillerOption2'));
      start+=1;
    }
  d3.selectAll(".movieOption").on("click",function(){
      getInfo(d3.select(this).attr("movieid"),true);
    });
}

d3.select("#closebutton").on("click",function(){
  d3.select("#movieInfo").style("display","none");
  d3.select("#HUDcontent").style("display","block");
  //makeOptiondivs_wrapper();
});

d3.selectAll(".labelButton").on("click",function(e){ 
  if(d3.select(this).attr("selected")==="false"){
    if(colorList.addGenre(d3.select(this).text())){
      movieList.updateColors();
      d3.select(this).attr("selected","true");
      d3.select(this).style("background",colorList.getColor(d3.select(this).text()));
    }
    else{
      d3.select("#warning").style("display","block");
    }  
  }
  else{
    d3.select("#warning").style("display","none");
    d3.select(this).attr("selected","false");
    colorList.removeGenre(d3.select(this).text());
    movieList.updateColors();
    d3.select(this).style("background",colorList.getColor(d3.select(this).text()));
  }
});

function resetGenres(){
  d3.selectAll(".labelButton").selectAll(function(d,i){
    d3.select(this).attr("selected","false");
    colorList.removeGenre(d3.select(this).text());
    if(d3.select(this).text()==="Animation"||d3.select(this).text()==="Action"||d3.select(this).text()==="Adventure"||d3.select(this).text()==="Avant-Garde"||d3.select(this).text()==="Crime"||d3.select(this).text()==="Documentary"||d3.select(this).text()==="Music Video"||d3.select(this).text()==="Romance"||d3.select(this).text()==="Short"||d3.select(this).text()==="Thriller"){
      d3.select(this).attr("selected","true");
      colorList.addGenre(d3.select(this).text());
    }
    d3.select(this).style("background",colorList.getColor(d3.select(this).text()));
  });
  movieList.updateColors();
}

var scrollOffset = window.innerHeight / 5; 

window.onload = function(){
  d3.select("#canvasContainer").style('display','block');
  d3.select("#canvasLabel").style('width',document.getElementById('mainCanvas').width);
  d3.select("#canvasContainer").style('top',document.getElementById('guidedHandle').getBoundingClientRect().top+document.body.scrollTop);
  d3.select("#dreduction").style('top',document.getElementById('helloThere').getBoundingClientRect().top+document.body.scrollTop);
  d3.select("#mubi").style('top',document.getElementById('mubiHeadline').getBoundingClientRect().top+document.body.scrollTop);
  d3.select("#graph").style('top',document.getElementById('graphpara').getBoundingClientRect().top+document.body.scrollTop);
  d3.select("#admatrix").style('top',document.getElementById('process').getBoundingClientRect().top+document.body.scrollTop);

  var canvasTop = new Waypoint({
    element: document.getElementById('guidedHandle'),
    handler: function(direction) {
      if(direction==='down'){
        d3.select("#canvasContainer").style('position','fixed');
        d3.select("#canvasContainer").style('top',scrollOffset+"px");
      }
      else if(direction==='up'){
        d3.select("#tour1").style("border-right","none");
        stopZoom();
        d3.select("#canvasLabel").transition();
        d3.select("#canvasLabel").text("");
        zoomToNode(movieList.getMovie(505),1);
        d3.select("#canvasContainer").style('position','absolute');
        d3.select("#canvasContainer").style('top',document.getElementById('guidedHandle').getBoundingClientRect().top+document.body.scrollTop);
        
      }
    },
    offset: scrollOffset 
  })

  var canvasBottom = new Waypoint({
    element: document.getElementById('outerHUD'),
    handler: function(direction) {
      if(direction==='down'){
        d3.select("#canvasLabel").transition();
        d3.select("#canvasLabel").text("");
        d3.select("#canvasLabel").style("display","none");
        similarLines = [];
        similarNodeOrigin = null;
        d3.select("#canvasContainer").style('position','absolute');
        d3.select("#canvasContainer").style('top',document.getElementById('outerHUD').getBoundingClientRect().bottom+document.body.scrollTop-document.getElementById('canvasContainer').clientHeight);
        d3.select(".tooltipAlert").style("display","block");
        enableZoom();
      }
      else if(direction==='up'){
        d3.select("#canvasContainer").style('position','fixed');
        d3.select("#canvasContainer").style('top',scrollOffset+"px");
      }
    },
    offset: function(){
      return document.getElementById('canvasContainer').clientHeight+scrollOffset-this.element.clientHeight;
    }
  })

  var tour1pointdown = new Waypoint({
    element: document.getElementById('tour1'),
    handler: function(direction){
      if(direction==="down"){
        d3.select("#tour1").style("border-right","3px solid #00dcec");
        guidedZoom([movieList.getMovie(45068),movieList.getMovie(111345)],[500,589],"Showing a strong cluster of ",["Animation movies","Music videos"])
      }
    },
    offset: ((document.getElementById('canvasContainer').clientHeight*0.5)+scrollOffset)
  })

  var tour1pointup = new Waypoint({
    element: document.getElementById('tour1'),
    handler: function(direction){
      if(direction==="up"){
        d3.select("#tour1").style("border-right","3px solid #00dcec");
        d3.select("#tour2").style("border-right","none");
        d3.select("#canvasLabel").text("");
        document.getElementById("showCountries").checked = false;
        document.getElementById("hideUnlabeled").checked = true;
        stopZoom();
        guidedZoom([movieList.getMovie(45068),movieList.getMovie(111345)],[500,589],"Showing a strong cluster of ",["Animation movies","Music videos"])

      }
    },
    offset: ((document.getElementById('canvasContainer').clientHeight*0.5)+scrollOffset)-document.getElementById('tour1').clientHeight
  })

  var tour2pointdown = new Waypoint({
    element: document.getElementById('tour2'),
    handler: function(direction){
      if(direction==="down"){
        guidedZoom([movieList.getMovie(48254),movieList.getMovie(120394),movieList.getMovie(13255),movieList.getMovie(87498),movieList.getMovie(106257),movieList.getMovie(41317)],[338,281,436,629,504,800],"Showing a strong cluster of movies from ",["Poland","Turkey","India and South Korea","Japan and Lithuania","France, Mexico and Portugal","Iran"]);
        d3.select("#tour1").style("border-right","none");
        d3.select("#tour2").style("border-right","3px solid #00dcec");
        document.getElementById("showCountries").checked = true;
        document.getElementById("hideUnlabeled").checked = false;
      }
    },
    offset: ((document.getElementById('canvasContainer').clientHeight*0.5)+scrollOffset)
  })

  var tour2pointup = new Waypoint({
    element: document.getElementById('tour2'),
    handler: function(direction){
      if(direction==="up"){
        d3.select("#tour2").style("border-right","3px solid #00dcec");
        d3.select("#tour3").style("border-right","none");
        document.getElementById("showCountries").checked = true;
        document.getElementById("hideUnlabeled").checked = false;
        stopZoom();
        guidedZoom([movieList.getMovie(48254),movieList.getMovie(120394),movieList.getMovie(13255),movieList.getMovie(87498),movieList.getMovie(106257),movieList.getMovie(41317)],[338,281,436,629,504,800],"Showing a strong cluster of movies from ",["Poland","Turkey","India and South Korea","Japan and Lithuania","France, Mexico and Portugal","Iran"]);

      }
    },
    offset: ((document.getElementById('canvasContainer').clientHeight*0.5)+scrollOffset)-document.getElementById('tour2').clientHeight
  })

  var tour3pointdown = new Waypoint({
    element: document.getElementById('tour3'),
    handler: function(direction){
      if(direction==="down"){
        d3.select("#tour2").style("border-right","none");
        d3.select("#tour3").style("border-right","3px solid #00dcec");
        document.getElementById("showCountries").checked = false;
        document.getElementById("hideUnlabeled").checked = true;
        guidedZoom([movieList.getMovie(93081)],[800],"Showing a strong cluster of short movies from the early 20th century",[""]);
      }
    },
    offset: ((document.getElementById('canvasContainer').clientHeight*0.5)+scrollOffset)
  })

  var tour3pointup = new Waypoint({
    element: document.getElementById('tour3'),
    handler: function(direction){
      if(direction==="up"){
        d3.select("#tour3").style("border-right","3px solid #00dcec");
        d3.select("#tour4").style("border-right","none");
        stopZoom();
        guidedZoom([movieList.getMovie(93081)],[800],"Showing a strong cluster of short movies from the early 20th century",[""]);
        similarLines = [];
        similarNodeOrigin = null;
      }
    },
    offset: ((document.getElementById('canvasContainer').clientHeight*0.5)+scrollOffset)-document.getElementById('tour3').clientHeight
  })

  var tour4pointdown = new Waypoint({
    element: document.getElementById('tour4'),
    handler: function(direction){
      if(direction==="down"){
        d3.select("#tour3").style("border-right","none");
        d3.select("#tour4").style("border-right","3px solid #00dcec");
        guidedZoom([movieList.getMovie(505),movieList.getMovie(505)],[1,1],"",["Stanley Kubrick's filmography denoted by a web of lines","Quentin Tarantino's filmography denoted by a web of lines. His most well known work, Pulp Fiction, is found at the extreme right of the visualization"],[movieList.getMovie(322),movieList.getMovie(161)]);
      }
    },
    offset: ((document.getElementById('canvasContainer').clientHeight*0.5)+scrollOffset)
  })

  var tour4pointup = new Waypoint({
    element: document.getElementById('tour4'),
    handler: function(direction){
      if(direction==="up"){
        d3.select("#canvasLabel").style("display","block");
        d3.select("#tour4").style("border-right","3px solid #00dcec");
        guidedZoom([movieList.getMovie(505),movieList.getMovie(505)],[1,1],"",["Stanley Kubrick's filmography denoted by a web of lines","Quentin Tarantino's filmography denoted by a web of lines. His most well known work, Pulp Fiction, is found at the extreme right of the visualization"],[movieList.getMovie(322),movieList.getMovie(161)]);
        d3.select(".tooltipAlert").style("display","none");
        disableZoom();
      }
    },
    offset: ((document.getElementById('canvasContainer').clientHeight*0.5)+scrollOffset)-document.getElementById('tour4').clientHeight
  })

  var sandbox = new Waypoint({
    element: document.getElementById('sandbox'),
    handler: function(direction){
      if(direction==="down"){
        d3.select("#tour4").style("border-right","none");
        d3.select("#canvasLabel").transition();
        d3.select("#canvasLabel").text("");
        d3.select("#canvasLabel").style("display","none");
        similarLines = [];
        similarNodeOrigin = null;
        d3.select(".tooltipAlert").style("display","block");
        enableZoom();
      }
      else{
        resetGenres();
      }
    },
    offset: ((document.getElementById('canvasContainer').clientHeight*0.5)+scrollOffset)
  })
}




