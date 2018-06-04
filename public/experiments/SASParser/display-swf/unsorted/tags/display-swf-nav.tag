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
		.nav-item{
			height: 2rem;
			left: 0.5rem;
			top: 0.5rem;
			position: relative;
		}
		.nav-input{
			width: 12rem;
			border: 0px;
			border-top-right-radius: 1rem;
			border-bottom-right-radius: 1rem;
			outline: none;
		}
		.nav-button{
			background-color: green; 
			width: 6rem; 
			float:left;  
			display: flex;
			align-items: center;
			justify-content: center;
			user-select: none;
			border-top-left-radius: 1rem;
			border-bottom-left-radius: 1rem;
		}
		.nav-button:active{
			background-color: #00FF00;
		}
	</style>
	<div class="nav">
		<input type="text" value={value} class="nav-input nav-item" ref="input">
		<div class="nav-button nav-item" onclick={go}>
			<p style="color: #00FF00;">Go</p>
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