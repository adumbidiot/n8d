<display-swf-nav onnav={onnav} data-value={value}>
	<style>
		.nav{
			width: 100%; 
			height: 3rem; 
			background-color: grey;
			position: static;
			float: right;
			display: inline;
			
		}
		.nav-input{
			position: relative;
			height: 2rem;
			left: 0.5rem;
			top: 0.5rem;
		}
		.nav-button{
			position: relative; 
			background-color: green; 
			width: 3rem; 
			float:left; 
			height: 2rem; 
			left: 0.5rem; 
			top: 0.5rem;
		}
	</style>
	<div class="nav">
		<input type="text" value={value} class="nav-input" ref="input">
		<div class="nav-button" onclick={go}>
			<p style="width: 100%; text-align: center; position: absolute; top: 0rem; height: 1rem;">Go</p>
		</div>
	</div>
	<script>
		let self = this;
		this.value = opts.dataValue;
		this.go = function(e){
			this.update({value: this.refs.input.value});
			self.opts.onnav(this.value);
		}
	</script>
</display-swf-nav>