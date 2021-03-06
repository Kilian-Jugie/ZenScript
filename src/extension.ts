import * as vscode from 'vscode';
import {IParsedToken} from './IParsedToken';
import {zsParser} from './zsParser';
import { zsGlobalRegistry } from './zsRegistry';

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

const legend = (function () {
	const tokenTypesLegend = [
		'keyword', 'import', 'comment', 'string', 'number', 'operator', 'class',
		'function', 'typeParameter', 'member', 'variable', 'parameter', 'gameObject',
		'error'
		/*
		'comment', 'string', 'keyword', 'number', 'regexp', 'operator', 'namespace',
		'type', 'struct', 'class', 'interface', 'enum', 'typeParameter', 'function',
		'member', 'macro', 'variable', 'parameter', 'property', 'label'*/
	];
	tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));

	const tokenModifiersLegend = [
		'static', 'native'
		/*'declaration', 'documentation', 'readonly', 'static', 'abstract', 'deprecated',
		'modification', 'async'*/
	];
	tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));

	return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({ language: 'zenScript'}, new DocumentSemanticTokensProvider(), legend));
}

class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
	async provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
		const allTokens = this._parseText(document.getText());
		const builder = new vscode.SemanticTokensBuilder();
		allTokens.forEach((token) => {
			builder.push(token.line, token.startCharacter, token.length, this._encodeTokenType(token.tokenType), this._encodeTokenModifiers(token.tokenModifiers));
		});
		return builder.build();
	}

	private _encodeTokenType(tokenType: string): number {
		if (tokenTypes.has(tokenType)) {
			return tokenTypes.get(tokenType)!;
		} else if (tokenType === 'notInLegend') {
			return tokenTypes.size + 2;
		}
		return 0;
	}

	private _encodeTokenModifiers(strTokenModifiers: string[]): number {
		let result = 0;
		for (let i = 0; i < strTokenModifiers.length; i++) {
			const tokenModifier = strTokenModifiers[i];
			if (tokenModifiers.has(tokenModifier)) {
				result = result | (1 << tokenModifiers.get(tokenModifier)!);
			} else if (tokenModifier === 'notInLegend') {
				result = result | (1 << tokenModifiers.size + 2);
			}
		}
		return result;
	}

	private _parseText(text: string): IParsedToken[] {


		let r: IParsedToken[] = [];
		const lines = text.split(/\r\n|\r|\n/);
		const parser: zsParser = new zsParser();
		zsGlobalRegistry.instance().initialize();
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			//let currentOffset = 0;
			try {
				r = r.concat(parser.parseLine(line, i));
			}
			catch(e) {
				//TODO
			}
		}
		return r;
	}

	private _parseTextToken(text: string): { tokenType: string; tokenModifiers: string[]; } {
		const parts = text.split('.');
		return {
			tokenType: parts[0],
			tokenModifiers: parts.slice(1)
		};
	}

	
}
