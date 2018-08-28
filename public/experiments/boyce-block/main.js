console.log("hi");

let hostTriggers = [
	"ads.pictela.net"
];

function replace(el){
	let img = new Image();
	img.src = 'images/jacob128.png';
	img.style.cssText = el.style.cssText;
	
	el.style.display = "none";
	console.log(el.parentNode, el, el.parentNode.children[0]);
	el.parentNode.insertBefore(el.parentNode.children[0], img);
}


window.addEventListener('load', function(){
	let iframes = document.getElementsByTagName("iframe");
	
	for(let i = 0; i != iframes.length; i++){
		console.log(iframes[i]);
		let url = new URL(iframes[i].src);
		if(hostTriggers.includes(url.host)){
			console.log("bad");
			replace(iframes[i]);
		} 
	}
});