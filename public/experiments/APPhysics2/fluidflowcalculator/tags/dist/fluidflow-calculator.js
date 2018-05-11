riot.tag2('fluidflow-calculator', '<div style="width: 100%; height: 100%; background-color: grey; text-align: center;"> <p>Fluid Flow Calculator</p> <div style="height: 3rem; "> <div style="float: left; display: inline-block; width: 100%;"> <div class="input-wrapper" style="position: absolute; left: 0 rem;"> (<input class="input" type="text" riot-value="{opts.M1}" placeholder="A1" onchange="{change}" ref="A1"> m^2) (<input class="input" type="text" riot-value="{opts.V1}" placeholder="V1" onchange="{change}" ref="V1"> m/s) </div> <div style="width: 2%; margin: auto; text-align: center; position: absolute;left: 49%;" class="input-wrapper"> = </div> <div class="input-wrapper" style="position: absolute; right: 0rem;"> (<input class="input" type="text" riot-value="{opts.M2}" placeholder="A2" onchange="{change}" ref="A2"> m^2) (<input class="input" type="text" riot-value="{opts.V2}" placeholder="V2" onchange="{change}" ref="V2"> m/s) </div> </div> </div> <div> <div onclick="{calculate}" style="user-select: none; background-color: white; width: 4rem; margin: auto;">Calculate</div> </div> <div>{error}</div> </div>', 'fluidflow-calculator input,[data-is="fluidflow-calculator"] input{ width: 5rem; } fluidflow-calculator .input-wrapper,[data-is="fluidflow-calculator"] .input-wrapper{ width: 20rem; }', '', function(opts) {
		let self = this;
		this.error = '';

		this.isValidInput = function(arr, i){
			return Number(arr[i].value);
		}

		this.verifyData = function(){
			let arr = Object.values(this.inputs);
			let invalidFound = false;
			let invalidIndex = -1;
			for(let i = 0; i != arr.length; i++){
				if(!this.isValidInput(arr, i)){
					if(invalidFound){
						return {valid: false, reason: 'REPEAT', index: i};
					}
					invalidFound = true;
					invalidIndex = i;
				}
			}
			if(invalidFound){
				return {valid: true, index: invalidIndex};
			}
			return {valid: false, reason: 'NOEMPTY'}
		}

		this.calculate = function(){
			let verify = this.verifyData();
			if(verify.valid){
				this.error = '';
				let keys = Object.keys(this.inputs);
				let answer = this.calculateFromIndex(verify.index);
				this.inputs[keys[verify.index]].value = answer;
				console.log();
			}else{
				if(verify.reason === 'NOEMPTY'){
					this.error = 'Cannot find value to calculate. Did you leave an empty spot open?';
				}else if(verify.reason === 'REPEAT'){
					this.error = 'The equation requires 3 known variables in order to operate. Did you forget one?';
				}
			}
		}

		this.calculateFromIndex = function(i){
			let arr = Object.values(this.inputs);
			switch(i){
					case 0:
						return arr[2].value * arr[3].value / arr[1].value;
					case 1:
						return arr[2].value * arr[3].value / arr[0].value;
					case 2:
						return arr[0].value * arr[1].value / arr[3].value;
					case 3:
						return arr[0].value * arr[1].value / arr[2].value;
				}
		}

		this.on('mount', function(){
			this.inputs = {
				A1: this.refs.A1,
				V1: this.refs.V1,
				A2: this.refs.A2,
				V2: this.refs.V2
			};
		});
});