window.SHAPESHIFT = function(){
	this.loaded = false;
	this.lastRefresh = null;
}

window.SHAPESHIFT.getRate = function(convert){
	return new Promise(function(resolve, reject){
		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
    			if (this.readyState == 4 && this.status == 200) {
				resolve(JSON.parse(this.responseText).rate);
			}
  		};

		request.open("GET", "https://shapeshift.io/rate/" + convert, true);

  		request.send();
	});
}