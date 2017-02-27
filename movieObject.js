var colToNode = {}

function Movie(id,xData,yData){
	this.id=id;
	this.xData=xData;
	this.yData=yData;
	this.mainColor="gray";
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

var genrePreferences = ["Commercial","Anthology","Music","TV Mini-series","Cult","History","Sport","Film noir","Gay & Lesbian","Erotica","War","TV Movie","Mystery","Family","Silent","Musical","Western"
,"Biography","Music Video", "Fantasy","Adventure","Sci-Fi","Romance","Thriller","Crime"
,"Avant-Garde","Horror","Action","Animation","Short","Documentary","Comedy","Drama"];

<!--/*Commercial': 4, 'Anthology': 17, 'Music': 36, 'TV Mini-series': 40,'Cult': 70, 'History': 104, 'Sport': 113,
<!--/*'Film noir': 119, Gay & Lesbian': 160, 'Erotica': 166, 'War': 204, 'TV Movie': 224, 'Mystery': 229, 'Family': 343,
<!--/*'Silent': 581, 'Musical': 594, 'Western': 705, 'Biography': 726, 'Music Video': 750, 'Fantasy': 765, 'Adventure':
<!--/*789, 'Sci-Fi': 849, 'Romance': 874, 'Thriller': 1773, 'Crime': 2348, 'Avant-Garde': 3250, 'Horror': 3975,
<!--/*'Action': 4715,'Animation': 4836, 'Short': 6057, 'Documentary': 9037,'Comedy': 13773,    'Drama': 24298,*/


function getGenre(){
	if(this.movieData==undefined){
		return;
	}
	tempHandle = this;
	for(let each of genrePreferences){
		if((tempHandle.movieData["genres"].indexOf(each)>=0)||(tempHandle.movieData["genres"].indexOf(" "+each)>=0)){
			return each;
		}
	}
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
