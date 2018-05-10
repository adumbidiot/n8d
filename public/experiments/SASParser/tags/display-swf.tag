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
	<div>
	<div class="main">
		<display-swf-nav onnav={navhandler} data-value={opts.src}></display-swf-nav>
		<div show={displayStartInfo} style="color:green; top: 3rem; position: absolute; overflow-y: scroll; width: 100%; bottom: 0rem;">
			<div><b>[ STATS ]</b></div>
			<div>SWFTools Version {SWFTools.VERSION}</div>
			<div>SWFParser Version {SWFTools.SWFParser.VERSION}</div>
			<div>Start Time: {startTime}</div>
			<div>End Time: {endTime}</div>
			<div>Start Epoch Time: {startTime.getTime()}ms</div>
			<div>End Epoch Time: {endTime.getTime()}ms</div>
			<div>Parse Time: {parseTime}ms</div>
			<div>Tags Per Millisecond: {tps} tags/ms</div>
			<div>Tags Parsed: {tagsParsed} tags</div>
			<div><b>[ /STATS ]</b></div>
			<br>
			<div><b>[ BODY ]</b></div>
			<virtual each={swfTags}>
				<details>
					<summary>
						{name} (code={recordHeader.code})
					</summary>
					<p>WIP</p>
				</details>
			</virtual>
			<div><b>[ /BODY ]</b></div>
			<div ref="output"></div>
		</div>
	</div>
	</div>
	<script>
		let self = this;
		this.src = opts.src;
		this.startTime = new Date();
		this.endTime = new Date();
		this.displayStartInfo = false;
		this.parser = new SWFTools.SWFParser();
		this.swfTags = [];
		this.tagsParsed = 0;
		this.parseTime = 0;
		this.tps = 0;
		
		this.navhandler = function(data){
			self.update({src: data});
			SWFTools.fetchAndParse(self.parser, self.src);
		}
		
		this.parser.on('start', () => {
			this.swfTags.length = 0;
			
			self.startTime = new Date();
			self.displayStartInfo = true;
		});
		
		this.parser.on('header', function(header){
			//console.log(header);
		});
		
		this.parser.on('tag', function(tag){
			self.swfTags.push(tag);
			if(tag.name !== 'UnknownTag'){
				//console.log(tag);
			}
			if(tag.recordHeader.code == 82){
				document.getElementById('dump').innerHTML = dump(tag.data, 0, tag.size);
			}
		});
		
		this.parser.on('end', function(i){
			self.endTime = new Date();
			self.parseTime = (self.endTime.getTime() - self.startTime.getTime());
			self.tps = (i / self.parseTime).toFixed(2);
			self.tagsParsed = i;
			setTimeout(function(){
				this.update();
			}.bind(self), 50);
		});
		
		if(opts.autorun){
			//this.navhandler();
		}
	</script>
</display-swf>