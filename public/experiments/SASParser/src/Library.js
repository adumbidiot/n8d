export let components = {};
export let tagComponents = [];

export function define(str, classPrototype){
	components[str.toLowerCase()] = classPrototype;
}

export function get(str){
	str = str.toLowerCase();
	if(!components[str]){
		return null;
	}
	return new components[str]();
}

export function defineTag(id, classPrototype){
	tagComponents[id] = classPrototype;
}

export function getTag(recordHeader){
	if(!tagComponents[recordHeader.code]){
		return new tagComponents[-1](recordHeader);
	}
	return new tagComponents[recordHeader.code](recordHeader);
}

export function getComponents(){
	return components;
}
export function getTagComponents(){
	return tagComponents;
}