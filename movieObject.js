var colToNode = {}

function Movie(id,xData,yData){
	this.id=id;
	this.xData=xData;
	this.yData=yData;
	this.mainColor="gray"
	this.setMetaData=setMetaData;
	this.updateColor=updateColor;
	this.getX=getX;
	this.getY=getY;
	this.getName=getName;
	this.getYear=getYear;
	this.getImage=getImage;
	this.getGenre=getGenre;
	this.getDirector=getDirector;
	this.getSynopsis=getSynopsis;
}

function getX(){
	return this.xData;
}

function getY(){
	return this.yData;
}

function setMetaData(movieData){
	this.movieData=movieData;
	this.hiddenColor=genColor();
	colToNode[this.hiddenColor] = this;
}

function updateColor(){
	this.mainColor=color(this.getGenre());
}

function getName(){
	if(this.movieData==undefined){
		return;
	}
	return this.movieData["info"]["title"];
}

function getYear(){
	if(this.movieData==undefined){
		return;
	}
	return this.movieData["year"];
}

function getImage(){
	if(this.movieData==undefined){
		return;
	}
	return this.movieData["info"]["stills"]["medium"];
}

function getGenre(){
	if(this.movieData==undefined){
		return;
	}
	return this.movieData["genres"][0];
}

function getDirector(){
	if(this.movieData==undefined){
		return;
	}
	return this.movieData["director_list"][0];
}

function getSynopsis(){
	if(this.movieData==undefined){
		return;
	}
	return this.movieData["synopsis"];
}

function MovieList(){
	this.movieMap={};
	this.addMovie=addMovie;
	this.getMovie=getMovie;
	this.getXcord=getXcord;
	this.getYcord=getYcord;
	this.getMainColor=getMainColor;
	this.getHiddenColor=getHiddenColor;
	this.updateColors=updateColors;
}

function addMovie(movieID,movieObject){
	this.movieMap[movieID]=movieObject;
}

function getMovie(movieID){
	return this.movieMap[movieID];
}

function getXcord(movieID){
	return this.movieMap[movieID].getX();
}

function getYcord(movieID){
	return this.movieMap[movieID].getY();
}

function getMainColor(movieID){
	return this.movieMap[movieID].mainColor;
}

function getHiddenColor(movieID){
	return this.movieMap[movieID].hiddenColor;
}

function updateColors(){
	for(var i in this.movieMap){
		this.getMovie(i).updateColor();
	}
}

/*Credits to Yannick Assogba for the following function which is also available at https://bl.ocks.org/tafsiri/e9016e1b8d36bae56572*/
var nextCol = 1;
function genColor(){
	var ret = [];
    // via http://stackoverflow.com/a/15804183
    if(nextCol < 16777215){
      ret.push(nextCol & 0xff); // R
      ret.push((nextCol & 0xff00) >> 8); // G 
      ret.push((nextCol & 0xff0000) >> 16); // B

      nextCol += 100; // This is exagerated for this example and would ordinarily be 1.
  }
  var col = "rgb(" + ret.join(',') + ")";
  return col;
}

