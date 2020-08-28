import * as zsPreprocessor from './zsPreprocessor';
import { zsParser } from './zsParser';
import { NativeTypeIdentifier } from './zsNative';

export class zsRegistry {

}

export class zsGlobalRegistry {
	private constructor() {
		this.PreprocessDirectives = new Array<zsPreprocessor.Directive>();
		
	}

	private registerPreprocessing() {
		this.PreprocessDirectives.push(new zsPreprocessor.Directive(
			new zsPreprocessor.DirectiveDescriptor("priority", [
				new zsPreprocessor.ParameterDescriptor("priority", NativeTypeIdentifier.INT)
			]))
		);
	}

	public initialize() {
		this.registerPreprocessing();
	}
	
	public static instance(): zsGlobalRegistry {
		return zsGlobalRegistry.INSTANCE;
	}

	public static getPreprocessorDirectives(): Array<zsPreprocessor.Directive> {
		return zsGlobalRegistry.instance().PreprocessDirectives;
	}
	
	private PreprocessDirectives: Array<zsPreprocessor.Directive>;
	
	private static INSTANCE: zsGlobalRegistry = new zsGlobalRegistry();
}