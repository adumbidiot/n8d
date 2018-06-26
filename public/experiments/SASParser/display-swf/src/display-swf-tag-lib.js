const readableLib = new Array(100);
readableLib[69] = function(tag){
	//Incomplete
	return `
		Size: ${tag.size} bytes<br>
		Actionscript 3: ${tag.actionScript3 ? 'Yes' : 'No'}<br>
		Metadata: ${tag.hasMetadata ? 'Yes' : 'No'}<br>
	`;
}

readableLib[82] = function(tag){
	console.log(tag);
	return `
		Size: ${tag.size} bytes<br>
		Script Name: "${tag.scriptName.value}"<br>
		Flags: ${tag.flags.value}<br>
	`;
}

export function getReadable(tag){
	const store = readableLib[tag.recordHeader.code];
	if(store){
		return store(tag);
	}else{
		return -1;
	}
}