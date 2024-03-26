import { initShaderProgram } from "./shader.js";
import { drawCircle, drawRectangle, drawTriangle, drawLineStrip } from "./shapes2d.js";
import { randomDouble } from "./random.js";
import { Maze} from "./maze.js";
import { Rat } from "./rat.js";

main();
async function main() {
	console.log('This is working');

	//
	// start gl
	// 
	const canvas = document.getElementById('glcanvas');
	const gl = canvas.getContext('webgl');
	if (!gl) {
		alert('Your browser does not support WebGL');
	}
	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//
	// Create shaders
	// 
	const vertexShaderText = await(await fetch("simple.vs")).text();
	const fragmentShaderText = await(await fetch("simple.fs")).text();
	const shaderProgram = initShaderProgram(gl, vertexShaderText, fragmentShaderText);

	//
	// Create content to display
	//
	const WIDTH = 10;
	const HEIGHT = 7;
	const m = new Maze(WIDTH, HEIGHT);
	const r = new Rat(.5, .5, 90, m);

	//
	// load a projection matrix onto the shader
	// 
	const margin = 0.5;
	let xlow = 0.0-margin;
	let xhigh = WIDTH+margin;
	let ylow = 0.0-margin;
	let yhigh = HEIGHT+margin;
	squareWorld();

	window.addEventListener('resize', squareWorld);

	function squareWorld(){
		const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
		const projectionMatrix = mat4.create();
		const aspect = canvas.clientWidth / canvas.clientHeight;
		const width = xhigh-xlow;
		const height = yhigh-ylow;
		if (aspect >= width/height){
			const newWidth = aspect*height;
			const xmid = (xlow+xhigh)/2;
			const xlowNew = xmid - newWidth/2;
			const xhighNew = xmid + newWidth/2;
			mat4.ortho(projectionMatrix, xlowNew, xhighNew, ylow, yhigh, -1, 1);
		}
		else{
			const newHeight = width/aspect;
			const ymid = (ylow+yhigh)/2;
			const ylowNew = ymid - newHeight/2;
			const yhighNew = ymid + newHeight/2;
			mat4.ortho(projectionMatrix, xlow, xhigh, ylowNew, yhighNew, -1, 1);
		}

		gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
	}


	let spinLeft = false;
	let spinRight = false;
	let scurryForward = false;
	let scurryBackwards = false;
	let strafeLeft = false;
	let strafeRight = false;
	let drawPath = false;
	window.addEventListener("keydown", keyDown);
	function keyDown(event){
		if (event.code == 'KeyQ'){
			spinLeft = true;
		}	
		if (event.code == 'KeyE'){
			spinRight = true;
		}	
		if (event.code == 'KeyW'){
			scurryForward = true;
		}
		if (event.code == 'KeyS'){
			scurryBackwards = true;
		}
		if (event.code == 'KeyA'){
			strafeLeft = true;
		}
		if (event.code == 'KeyD'){
			strafeRight = true;
		}
		if (event.code == 'KeyX'){
			drawPath = true;
		}
	}
	window.addEventListener("keyup", keyUp);
	function keyUp(event){
		if (event.code == 'KeyQ'){
			spinLeft = false;
		}
		if (event.code == 'KeyE'){
			spinRight = false;
		}	
		if (event.code == 'KeyW'){
			scurryForward = false;
		}
		if (event.code == 'KeyS'){
			scurryBackwards = false;
		}
		if (event.code == 'KeyA'){
			strafeLeft = false;
		}
		if (event.code == 'KeyD'){
			strafeRight = false;
		}
		if (event.code == 'KeyX'){
			drawPath = false;
		}
	}

	//
	// load a modelview matrix onto the shader
	// 
	const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
	const identityMatrix = mat4.create();
    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, identityMatrix);


	//
	// Register Listeners
	//
	addEventListener("click", click);
	function click(event) {
		console.log("click");
		const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
		const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
		// Do whatever you want here, in World Coordinates.
	}

	//
	// Main render loop
	//
	let previousTime = 0;
	function redraw(currentTime){
		currentTime *= .001; // milliseconds to seconds
		let DT = currentTime - previousTime;
		if(DT > .1)
			DT = .1;
		previousTime = currentTime;



		if(spinLeft){
			r.spinLeft(DT);
		}
		if(spinRight){
			r.spinRight(DT);
		}
		if(scurryForward){
			r.scurryForward(DT);
		}
		if(scurryBackwards){
			r.scurryBackwards(DT);
		}
		if(strafeLeft){
			r.strafeLeft(DT);
		}
		if(strafeRight){
			r.strafeRight(DT);
		}

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, identityMatrix);
		m.draw(gl, shaderProgram);

		if(drawPath){
			m.drawPath(gl, shaderProgram);
		}
		r.draw(gl, shaderProgram);
		
		requestAnimationFrame(redraw);
	}
	requestAnimationFrame(redraw);
};

