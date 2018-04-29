import * as Library from '../../Library.js';
import {Tag} from './Tag';

export class ScriptLimitsTag extends Tag{
	static get code(){
		return 65;
	}
	parse(buffer, offset){
		offset += this.recordHeader.size;
		this.MaxRecursionDepth = Library.get('uint16').parse(buffer, offset);
		offset += this.MaxRecursionDepth.size;
		this.ScriptTimeoutSeconds = Library.get('uint16').parse(buffer, offset);
		return this;
	}
}

Library.defineTag(ScriptLimitsTag.code, ScriptLimitsTag);