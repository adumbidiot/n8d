window.COINDESK = function(){

}

window.COINDESK.getRate = function(convert){
	return new Promise(function(resolve, reject){
		if(convert != 'btc_usd'){
			return reject('Unsupported');
		}
		var request = new XMLHttpRequest();
  		request.onreadystatechange = function() {
    			if (this.readyState == 4 && this.status == 200) {
				var out = JSON.parse(this.responseText);
				resolve(Number(out.bpi.USD.rate_float));
			}
  		};

  		request.open("GET", "http://api.coindesk.com/v1/bpi/currentprice/usd.json?cors=true", true);

  		request.send();
	});
}