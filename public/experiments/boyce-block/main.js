console.log("hi");

let hostTriggers = [
	"ads.pictela.net",
	"rcm-na.amazon-adsystem.com",
	"googleads.g.doubleclick.net",
	"tpc.googlesyndication.com",
	"s0.2mdn.net"
];

let titleTriggers = [
	"Ad"
];

let classTriggers = [
	"outeradcontainer",
	"adsbygoogle"
];

function replace(el){
	let img = new Image();
	img.src = chrome.extension.getURL('/images/jacob128.png');
	img.style.cssText = el.style.cssText;
	if(el.width){
		img.width = el.width;
	}
	
	if(el.height){
		img.height = el.height;
	}
	
	el.style.display = "none";
	el.before(img);
}


window.addEventListener('load', removeAds);

function removeAds(){
	let iframes = document.getElementsByTagName("iframe");
	console.log(iframes);
	
	for(let i = 0; i != iframes.length; i++){
		if(iframes[i].src){
			let url = new URL(iframes[i].src);
			console.log(url.host);
			if(hostTriggers.includes(url.host)){
				console.log("bad host", iframes[i]);
				replace(iframes[i]);
			} 
		}
		
		if(iframes[i].title){
			if(titleTriggers.includes(iframes[i].title)){
				console.log("Bad title");
				replace(iframes[i]);
			}
		}
		
		if(iframes[i].class){
			if(classTriggers.includes(iframes[i].class)){
				console.log("Bad title");
				replace(iframes[i]);
			}
		}
		
		//setTimeout(removeAds, 5000);
	}
	let ins = document.getElementsByTagName("ins");
	console.log(ins);
	for(let i = 0; i != ins.length; i++){
		console.log(ins[i].className);
		if(ins[i].className && scanElementbyClass(ins[i], classTriggers)){
			console.log("bad class");
			replace(ins[i]);
		}
	}
	
	setTimeout(removeAds, 5000);
}

function scanElementbyClass(el, blacklist){
	for(let i = 0; i != el.classList.length; i++){
		if(blacklist.includes(el.classList[i])){
			return true;
		}
	}
	return false;
}