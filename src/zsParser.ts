import {IParsedToken} from './IParsedToken'; 
import * as zsRegistry from './zsRegistry';
import * as zsTypes from './zsTypes';
import Stack from "ts-data.stack";
import { Directive } from './zsPreprocessor';
import { NativeTypeIdentifier, TokenTypeFromTypeIdentifier } from './zsNative';

export class zsParser {
	public static Registry: zsRegistry.zsRegistry;

	public static OneLineCommentString = "//";
	public static MultiLineOpeningCommentString = "/*";
	public static MultiLineClosingCommentString = "*/";

	public constructor() {
		if(zsParser.Registry == null)
			zsParser.Registry = new zsRegistry.zsRegistry();
		this.Context = new Stack<zsTypes.zsScope>();
		this.Context.push(new zsTypes.zsGlobalScope());
		zsParser.IsInComment = false;
		this.Line = "";
		this.LineCount = 0;
		this.Words = [];
	}

	public getTypeIdentifierFromString(expression: string): NativeTypeIdentifier {
		try {
			Number(expression);
			return NativeTypeIdentifier.INT;
		}
		catch(e) {
			return NativeTypeIdentifier.NULL;
		}
	}

	public parsePreprocessor(): IParsedToken[] {
		let charIndex = 0;
		const r: IParsedToken[] = [];
		const pp = zsRegistry.zsGlobalRegistry.getPreprocessorDirectives();
		const dirName = this.Words[0].substr(1);
		let dir: Directive = Directive.Null;
		for(let i=0; i<pp.length; i++) {
			if(dirName == pp[i].getDescriptor().getName())
				dir = pp[i];
		}
		if(dir == Directive.Null) {
			//TODO: Error: directive does not exists
			r.push({line: this.LineCount, startCharacter: 0, length: this.Line.length,
				tokenType: zsTypes.TokenTypeError, tokenModifiers: []
			});
			return r;
		}
		r.push({
			line: this.LineCount, startCharacter: 0, length: this.Words[0].length,
			tokenType: zsTypes.TokenTypeKeyword, tokenModifiers: []
		});

		charIndex += this.Words[0].length+1;

		if(this.Words.length-1 != dir.getParameters().length) {
			//TODO: Error: wrong directive parameters count
			r.push({line: this.LineCount, startCharacter: 0, length: this.Line.length,
				tokenType: zsTypes.TokenTypeError, tokenModifiers: []
			});
			return r;
		}
		for(let i=1; i<this.Words.length; i++) {
			if(this.getTypeIdentifierFromString(this.Words[i]) != dir.getParameters()[i-1].getDescriptor().getTypeIdentifier()) {
				//TODO: Error: wrong directive parameters i type
				r.push({
					line: this.LineCount, startCharacter: charIndex, length: this.Words[i].length,
					tokenType: zsTypes.TokenTypeError, tokenModifiers: []
				});
				return r;
				
			}
			r.push({
				line: this.LineCount, startCharacter: charIndex, length: this.Words[i].length,
				tokenType: TokenTypeFromTypeIdentifier(dir.getParameters()[i-1].getDescriptor().getTypeIdentifier()),
				tokenModifiers: []
			});
			dir.getParameters()[i-1].set(this.Words[i]);
			charIndex += this.Words[i].length+1;
		}
		return r;
	}

	public parseLine(line: string, lineCount: number): IParsedToken[] {
		this.Line = line;
		this.LineCount = lineCount;
		let r: IParsedToken[] = [];
		const words = line.split(/\s|(\/\/)|(\/\*)|(\*\/)/);
		this.Words = words;
		let charIndex = 0;
		let CommentLength = 0;
		for (let i = 0; i < words.length; i++) {
			const word = words[i];
			if(word == undefined) continue;

			if(zsParser.IsInComment) {
				if(word == zsParser.MultiLineClosingCommentString) {
					r.push({
						line: lineCount,
						startCharacter: charIndex,
						length: word.length,
						tokenType: zsTypes.TokenTypeComment,
						tokenModifiers: []
					});
					zsParser.IsInComment = false;
					CommentLength = 0;
				}
				else CommentLength+=word.length+1;
				continue;
			} 

			if(word == zsParser.OneLineCommentString) {
				r.push({
					line: lineCount, startCharacter: charIndex-1, length: line.length-charIndex+1,
					tokenType: zsTypes.TokenTypeComment, tokenModifiers: []
				});
				break;
			}
			else if(word == zsParser.MultiLineOpeningCommentString) {
				zsParser.IsInComment = true;
				CommentLength+=word.length+1;
			}

			if(word[0] == zsTypes.PreprocessorChar) {
				r = r.concat(this.parsePreprocessor());
				break;
			}

			charIndex+=word.length+1;
		}
		if(zsParser.IsInComment) {
			r.push({
				line: lineCount, startCharacter: CommentLength-line.length, length: CommentLength,
				tokenType: zsTypes.TokenTypeComment, tokenModifiers: []
			});
		}

		return r;
	}
	public static IsInComment: boolean;
	public Context: Stack<zsTypes.zsScope>;

	private LineCount: number;
	private Line: string;
	private Words: string[];
}