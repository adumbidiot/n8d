export let components = {};

export function define(str, classPrototype){
	components[str] = classPrototype;
}

export function get(str){
	if(!components[str]){
		return null;
	}
	return new components[str]();
}

export function getLibrary(){
	return components;
}