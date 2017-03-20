document.getElementById("searchBar").addEventListener("input", logEvent, true);

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

d3.select("#canvasContainer").style('top',document.getElementById('helloThere').getBoundingClientRect().top+document.body.scrollTop);

var waypoint = new Waypoint({
  element: document.getElementById('helloThere'),
  handler: function(direction) {
    if(direction==='down'){
      d3.select("#canvasContainer").style('position','fixed');
      d3.select("#canvasContainer").style('top','20px');
      //zoomToNode(movieList.getMovie(45068),500);
    }
    else if(direction==='up'){
      d3.select("#canvasContainer").style('position','absolute');
      d3.select("#canvasContainer").style('top',document.getElementById('helloThere').getBoundingClientRect().top+document.body.scrollTop);
    }
  },
  offset: 20 
})



var awful = new Waypoint({
  element: document.getElementById('outerHUD'),
  handler: function(direction) {
    if(direction==='down'){
      d3.select("#canvasContainer").style('position','absolute');
      d3.select("#canvasContainer").style('top',document.getElementById('outerHUD').getBoundingClientRect().bottom+document.body.scrollTop-document.getElementById('canvasContainer').clientHeight);
      
    }
    else if(direction==='up'){
      d3.select("#canvasContainer").style('position','fixed');
      d3.select("#canvasContainer").style('top','20px');
    }
  },
  offset: function(){
    return document.getElementById('canvasContainer').clientHeight+20-this.element.clientHeight;
  }
})

