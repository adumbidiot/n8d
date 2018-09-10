import "../tttjs/dist/tttjs.js";
//import * as _internals2 from "../tttjs/dist-es6/tttjs.js";


let _internals = window.TTT;
window.TTT = undefined;

let AI = _internals.AI;
let Compiler = _internals.Compiler;

let ready = false;
let promise = null;

export function init(path){
	promise = _internals(path);
	promise.then(() => {
		ready = true;
	});
	return promise;
}

export function isReady(){
	return ready;
}

export function getPromise(){
	return promise;
}

export {AI, Compiler};