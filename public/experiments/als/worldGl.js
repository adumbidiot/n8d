class World {
	constructor(id){
		this.canvas = document.getElementById(id); //TODO: Check if valid, add option for dom node
		this.gl = this.canvas.getContext("webgl"); //TODO: Check if unavailable
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0); //TODO: Consider Green Background
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		
		const vsSource = `
    			attribute vec4 aVertexPosition;

    			uniform mat4 uModelViewMatrix;
    			uniform mat4 uProjectionMatrix;

    			void main() {
      				gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    			}
  		`;
		
		 const fsSource = `
    			void main() {
     	 			gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    			}
  		`;
		
		const shaderProgram = this.initShaderProgram(this.gl, vsSource, fsSource);
		
		const programInfo = {
    			program: shaderProgram,
    			attribLocations: {
      				vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    			},
    			uniformLocations: {
     		 		projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      				modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
   	 		},
  		};
		
		this.draw();
		
	}
	initShaderProgram(gl, vsSource, fsSource) { //From MDN
  		const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
  		const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  		const shaderProgram = gl.createProgram();
  		gl.attachShader(shaderProgram, vertexShader);
  		gl.attachShader(shaderProgram, fragmentShader);
  		gl.linkProgram(shaderProgram);

  		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
   			alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    			return null;
  		}

 	 	return shaderProgram;
	}
	loadShader(gl, type, source) {
  		const shader = gl.createShader(type);

  		gl.shaderSource(shader, source);

  		gl.compileShader(shader);

	  	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    			alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    			gl.deleteShader(shader);
    			return null;
  		}

  		return shader;
	}
	initBuffers(gl){
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		const positions = [
			1.0, 1.0,
			-1.0, 1.0,
			1.0, -1.0,
			-1.0, -1.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
		return {
			position: positionBuffer,
		};
	}
	draw(){
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0); //TODO: Move to construcotr
		this.gl.clearDepth(1.0); 
		this.gl.enable(this.gl.DEPTH_TEST); //Enable depth tesing
		this.gl.depthFunc(this.gl.LEQUAL); //Near blocks far
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);	
		const fieldOfView = 45 * Math.PI / 180;   // FOV
		const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
		const zNear = 0.1; //See only .1 units to 100.0 units from cam
  		const zFar = 100.0;
  		const projectionMatrix = mat4.create();
		
		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
		const modelViewMatrix = mat4.create();
		mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
		
		const numComponents = 2;  // pull out 2 values per iteration
    		const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    		const normalize = false;  // don't normalize
    		const stride = 0;         // how many bytes to get from one set of values to the next
                              // 0 = use type and numComponents above
    		const offset = 0;         // how many bytes inside the buffer to start from
	}
}