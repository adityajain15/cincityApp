function MovieList(){
	this.movieMap={};
	this.addMovie=addMovie;
	this.getMovie=getMovie;
	this.getXcord=getXcord;
	this.getYcord=getYcord;
	this.getMainColor=getMainColor;
	this.getHiddenColor=getHiddenColor;
	this.updateColors=updateColors;
	this.getSimilarMovies=getSimilarMovies;
	this.getCountryName=getCountryName;
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

function getCountryName(movieID){
	return this.movieMap[movieID].getCountry();
}


function getSimilarMovies(clickedMovie){
	var result = [];
	for(var i in this.movieMap){
		if((this.getMovie(i).getDirector()==clickedMovie.getDirector())&&(this.getMovie(i).getName()!=clickedMovie.getName())){
			result.push(this.getMovie(i));
		}
	}
	return result;
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

