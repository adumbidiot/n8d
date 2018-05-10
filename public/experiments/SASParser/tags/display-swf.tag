<display-swf src={src}>
	<style>
		.main{
			width: 100%;
			height: 100%;
			background-color: black;
			position: relative;
		}
		.output{
			color: green; 
			overflow: auto; 
			overflow-y: scroll; 
			position: absolute; 
			width: 100%; 
			top: 3rem; 
			bottom: 0rem;
		}
	</style>
	<div class="main">
		<display-swf-nav onnav={navhandler} data-value={opts.src}></display-swf-nav>
		<div class="output" ref="output"></div>
	</div>
	<script>
		this.navhandler = function(data){
			self.update({src: data});
			SWFTools.fetchAndParse(self.parser, self.src);
		}
		
		let self = this;
		this.src = opts.src;
		
		this.startTime = null;
		this.endTime = null;
		
		function startup(){
			self.startTime = new Date();
			let data = '';
			data += '[ START ]<br>';
			data += '[ SWFTools Version: ' + SWFTools.VERSION + ' ]<br>';
			data += '[ SWFParser Version: ' + SWFTools.SWFParser.VERSION + ' ]<br>';
			data += '[ Time: ' + self.startTime + ' ]<br>';
			data += '[ Epoch Time:' + self.startTime.getTime() + 'ms ]<br>';
			return data;
		}
		
		this.parser = new SWFTools.SWFParser();
		
		this.parser.on('start', () => {
			self.refs.output.innerHTML = startup();
			self.update();
		});
		
		this.parser.on('header', function(header){
			console.log(header);
		});
		
		this.parser.on('tag', function(tag){
			self.refs.output.innerHTML += '<details>' + 
											'<summary>' + 
												tag.name + '    (code=' + tag.recordHeader.code + ')' +
											'</summary>' + 
											'<p>' + 'a' + '</p>' +
										'</details>';
			if(tag.name !== 'UnknownTag'){
				console.log(tag);
			}
			if(tag.recordHeader.code == 82){
				document.getElementById('dump').innerHTML = dump(tag.data, 0, tag.size);
			}
			self.update();
		});
		
		this.parser.on('end', function(i){
			self.endTime = new Date();
			setTimeout(function(){
				let time = (self.endTime.getTime() - self.startTime.getTime());
				let tps = (i / time).toFixed(2);
				self.refs.output.innerHTML += '<b>' + i + ' tags parsed in ' + time + ' ms (' + tps + ' tags per millisecond)' +'</b><br>';
				self.startTime = null;
				self.endTime = null;
			}, 50);
		});
		
	</script>
</display-swf>