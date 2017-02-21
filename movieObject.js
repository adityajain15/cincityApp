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
	this.getCountry=getCountry;
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
	this.mainColor=colorList.getColor(this.getGenre());
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

function getCountry(){
	if(this.movieData==undefined){
		return;
	}
	return this.movieData["country"];
}