export const TokenTypeComment = "comment";
export const TokenTypePreprocessor = "preprocessor";
export const TokenTypeError = "error";
export const TokenTypeKeyword = "keyword";
export const TokenTypeNumber = "number";

export const PreprocessorChar = '#';

export enum zsObjectType {
	FUNCTION,
	CLASS,
	VARIABLE
}


export interface zsScopable {
	getObjectType(): zsObjectType;
}

export interface zsScope {
	addToScope(obj: zsScopable, type: zsObjectType): void;
}

export class zsVariable implements zsScopable {
	getObjectType(): zsObjectType {
		return zsObjectType.VARIABLE;
	}
}

export class zsOperator implements zsScopable {
	getObjectType(): zsObjectType {
		return zsObjectType.FUNCTION;
	}
}

export class zsFunction implements zsScope, zsScopable {
	private ScopeObjets: Array<zsScopable> = new Array<zsScopable>();
	addToScope(obj: zsScopable, type: zsObjectType): void {
		if(type != zsObjectType.VARIABLE) throw new Error("Function can only contains variables");
		this.ScopeObjets.push(obj);
	}

	getObjectType(): zsObjectType {
		return zsObjectType.FUNCTION;
	}
}

export class zsClass implements zsScope, zsScopable {
	private ScopeObjets: Array<zsScopable> = new Array<zsScopable>();
	addToScope(obj: zsScopable, type: zsObjectType): void {
		if(type == zsObjectType.CLASS) throw new Error("Classes cannot contains other interfaces/classes");
		this.ScopeObjets.push(obj);
	}

	getObjectType(): zsObjectType {
		return zsObjectType.CLASS;
	}
}

export class zsInterface implements zsScope, zsScopable {
	private ScopeObjets: Array<zsScopable> = new Array<zsScopable>();
	addToScope(obj: zsScopable, type: zsObjectType): void {
		if(type == zsObjectType.CLASS) throw new Error("Interfaces cannot contains other interfaces/classes");
		this.ScopeObjets.push(obj);
	}

	getObjectType(): zsObjectType {
		return zsObjectType.CLASS;
	}
}

export class zsGlobalScope implements zsScope {
	private ScopeObjets: Array<zsScopable> = new Array<zsScopable>();
	addToScope(obj: zsScopable, type: zsObjectType): void {
		this.ScopeObjets.push(obj);
	}

}