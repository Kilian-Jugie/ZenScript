import { zsParser } from './zsParser';
import { IParsedToken } from './IParsedToken';
import * as vscode from 'vscode';
import { existsSync } from 'fs';

export const TokenTypeComment = "comment";
export const TokenTypePreprocessor = "preprocessor";
export const TokenTypeError = "error";
export const TokenTypeKeyword = "keyword";
export const TokenTypeNumber = "number";
export const TokenTypeImportPath = "import";

export const PreprocessorChar = '#';

export enum zsObjectType {
	FUNCTION,
	CLASS,
	VARIABLE
}

export interface zsScopable {
	getObjectType(): zsObjectType;
}

export class zsContextCallbackReturn {
	constructor(allowNext: boolean, tokens: IParsedToken[]) {
		this.AllowNext = allowNext;
		this.Tokens = tokens;
	}

	public AllowNext: boolean;
	public Tokens: IParsedToken[];
}


export interface zsContextable {
	parseCallback(word: string, parser: zsParser): zsContextCallbackReturn;
}

export interface zsKeyword extends zsContextable {
	getName(): string;
	call(parser: zsParser): void;
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

export class zsFunction implements zsScope, zsScopable, zsContextable {
	parseCallback(word: string, parser: zsParser): zsContextCallbackReturn {
		throw new Error("Method not implemented.");
	}

	private ScopeObjets: Array<zsScopable> = new Array<zsScopable>();
	addToScope(obj: zsScopable, type: zsObjectType): void {
		if(type != zsObjectType.VARIABLE) throw new Error("Function can only contains variables");
		this.ScopeObjets.push(obj);
	}

	getObjectType(): zsObjectType {
		return zsObjectType.FUNCTION;
	}
}

export class zsClass implements zsScope, zsScopable, zsContextable {
	parseCallback(word: string, parser: zsParser): zsContextCallbackReturn {
		throw new Error("Method not implemented.");
	}
	private ScopeObjets: Array<zsScopable> = new Array<zsScopable>();
	addToScope(obj: zsScopable, type: zsObjectType): void {
		if(type == zsObjectType.CLASS) throw new Error("Classes cannot contains other interfaces/classes");
		this.ScopeObjets.push(obj);
	}

	getObjectType(): zsObjectType {
		return zsObjectType.CLASS;
	}
}

export class zsInterface implements zsScope, zsScopable, zsContextable {
	parseCallback(word: string, parser: zsParser): zsContextCallbackReturn {
		throw new Error("Method not implemented.");
	}
	private ScopeObjets: Array<zsScopable> = new Array<zsScopable>();
	addToScope(obj: zsScopable, type: zsObjectType): void {
		if(type == zsObjectType.CLASS) throw new Error("Interfaces cannot contains other interfaces/classes");
		this.ScopeObjets.push(obj);
	}

	getObjectType(): zsObjectType {
		return zsObjectType.CLASS;
	}
}

export class zsGlobalScope implements zsScope, zsContextable {
	parseCallback(word: string, parser: zsParser): zsContextCallbackReturn {
		return new zsContextCallbackReturn(true, []);
	}
	private ScopeObjets: Array<zsScopable> = new Array<zsScopable>();
	addToScope(obj: zsScopable, type: zsObjectType): void {
		this.ScopeObjets.push(obj);
	}
}


export class zsImport implements zsKeyword {
	parseCallback(word: string, parser: zsParser): zsContextCallbackReturn {
		const r: zsContextCallbackReturn = new zsContextCallbackReturn(false, []);
		const tok: IParsedToken[] = [];
		if(word[word.length-1] != ';') {
			tok.push({
				length: word.length, startCharacter: 0, line:parser.LineCount,
				tokenModifiers: [], tokenType: TokenTypeError
			});
		}
		else {
			word = word.substr(0, word.length-1);
			const path = word.split(/\./);

			let fileFound = false;

			if(path[0]=="scripts") fileFound = this.parseScriptPath(path);
			else fileFound = this.parseLibPath(path);

			tok.push({length: word.length+1, startCharacter: parser.CharIndex, line: parser.LineCount,
				tokenModifiers: [], tokenType: fileFound?TokenTypeImportPath:TokenTypeError});
		}
		r.Tokens = tok;
		parser.unregisterLastContextCallback();
		return r;
	}

	getName(): string {
		return "import";
	}

	private pathArrayToPath(path: string[], beginIndex=0): string {
		let ret = "";
		for(let i=beginIndex; i<path.length; i++) {
			ret += path[i]+"\\";
		}
		return ret.substr(0, ret.length-1);
	}

	private parseScriptPath(path: string[]): boolean {
		if(vscode.workspace.workspaceFolders == undefined) return false;
		return existsSync(vscode.workspace.workspaceFolders[0]+"\\"+this.pathArrayToPath(path, 1)+".zs");
	}

	private parseLibPath(path: string[]): boolean {
		return existsSync(zsImport.LIBS_PATH+"\\"+this.pathArrayToPath(path)+".zs");
	}

	call(parser: zsParser): void{
		parser.registerContextCallback(this);

		
	}

	//TODO: this as option or at least a more suitable place
	public static LIBS_PATH = "A:\\TS\\ZenScript\\libs";
}