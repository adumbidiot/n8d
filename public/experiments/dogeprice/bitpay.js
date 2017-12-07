window.BITPAY = function(){

}

window.BITPAY.getRate = function(convert){
	return new Promise(function(resolve, reject){
		if(convert != 'btc_usd'){
			return reject('Unsupported');
		}
		var request = new XMLHttpRequest();
  		request.onreadystatechange = function() {
    			if (this.readyState == 4 && this.status == 200) {
				console.log(this.responseText);
				var out = JSON.parse(this.responseText).data;
				resolve(Number(out.rate));
			}
  		};

  		request.open("GET", "https://bitpay.com/rates/usd", true);

  		request.send();
	});
}