import * as zsPreprocessor from './zsPreprocessor';
import { zsParser } from './zsParser';
import { NativeTypeIdentifier } from './zsNative';
import { zsKeyword, zsImport } from './zsTypes';
import {} from 'typescript';

export class zsRegistry {

}

export class zsGlobalRegistry {
	private constructor() {
		this.PreprocessDirectives = new Array<zsPreprocessor.Directive>();
		this.Keywords = new Map<string, zsKeyword>();
	}

	private registerPreprocessing() {
		this.PreprocessDirectives.push(new zsPreprocessor.Directive(
			new zsPreprocessor.DirectiveDescriptor("priority", [
				new zsPreprocessor.ParameterDescriptor("priority", NativeTypeIdentifier.INT)
			]))
		);
	}

	private registerKeywords() {
		const keyImport = new zsImport();
		this.Keywords.set(keyImport.getName(), keyImport);
	}

	public initialize() {
		this.registerPreprocessing();
		this.registerKeywords();
	}
	
	public static instance(): zsGlobalRegistry {
		return zsGlobalRegistry.INSTANCE;
	}

	public static getPreprocessorDirectives(): Array<zsPreprocessor.Directive> {
		return zsGlobalRegistry.instance().PreprocessDirectives;
	}

	public static getKeyword(name: string): zsKeyword | undefined {
		return zsGlobalRegistry.instance().Keywords.get(name);
	}
	
	private PreprocessDirectives: Array<zsPreprocessor.Directive>;
	private Keywords: Map<string, zsKeyword>;
	
	private static INSTANCE: zsGlobalRegistry = new zsGlobalRegistry();
}