SASParser.Parsable = class {
	constructor(){
		this.size = 0;
	}
	parse(buf, n){
		throw "Unimplemented member of Parsable class: Parse";
	}
}
//////////////////////////////////////////////////////////
//	Parseable Interface									//
//		*Must Have a "parse" function member defined	//
//		*Must return parse data through return function	//
//		*Must return size in bytes of tags as 'size'	//
//////////////////////////////////////////////////////////