import {hashState} from './Utils.js';

export default class Node {
	constructor(id, level, parent){
		this.id = id;
		this.level = level;
		this.children = [];
		this.parents = [parent]; 
		this.score = 0;
	}
}