window.twitchWidget = function(userName){
	var self = this;
	this.userName = userName;
	
	this.getUserData();

	this.onload = function(){};
};

window.twitchWidget.prototype.getUserData = function(){
	var xhttp = new XMLHttpRequest();
	var self = this;

	xhttp.onreadystatechange = function() {
		if(this.readyState == 4){
     			self.userData = JSON.parse(this.responseText);
			self.generateElement();
			self.onload();
		}
  	};

  	xhttp.open("GET", "https://api.twitch.tv/kraken/users/" + this.userName, true);
	xhttp.setRequestHeader("client-id", "jzkbprff40iqj646a697cyrvl0zt2m6");
  	xhttp.send();
};

window.twitchWidget.prototype.generateElement = function(){
	this.element = document.createElement('div');
	this.element.style.cssText = 'width:300px; height:300px;border-radius: 25px;text-align:center;';
	this.element.style.backgroundColor = '#885EAD';
	
	var header = document.createElement('h1');
	header.style.cssText = 'color: #ffffff;';
	header.innerText = this.userData.display_name;
	
	this.element.appendChild(header);
	
	var img = document.createElement('img');
	img.src = this.userData.logo;
	img.style.cssText = 'width: 75px; height:75px;';

	this.element.appendChild(img);

	this.element.appendChild(document.createElement('br'));
	this.element.appendChild(document.createElement('br'));

	var bio = document.createElement('div');
	bio.style.width = '300px';
	bio.style.fontSize = '12px';
	bio.innerText = this.userData.bio;
	bio.style.color = '#ffffff';
	
	this.element.appendChild(bio);

	//var pp = document.createElement('p');
	//pp.innerText = JSON.stringify(this.userData);
	
	//this.element.appendChild(pp);
};