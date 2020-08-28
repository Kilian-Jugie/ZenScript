import * as zsTypes from './zsTypes';

export class TypeAttribute {
	constructor(name: string) {
		this.Name = name;
	}

	getName(): string {
		return this.Name;
	}

	Name: string;
}

export enum NativeTypeIdentifier {
	NULL,
	INT
}

export function TokenTypeFromTypeIdentifier(id: NativeTypeIdentifier): string {
	switch(id) {
		case NativeTypeIdentifier.NULL: return zsTypes.TokenTypeError; //TODO ?
		case NativeTypeIdentifier.INT: return zsTypes.TokenTypeNumber;
		default: return zsTypes.TokenTypeError;
	}
}

export interface NativeType {
	getName(): string;
	getValue(): any;
	getIdentifier(): NativeTypeIdentifier;
}

export class zsInt implements NativeType {
	constructor(value: number) {
		this.Value = value;
	}

	getIdentifier(): NativeTypeIdentifier {
		return NativeTypeIdentifier.INT;
	}
	
	getName(): string {
		return "int";
	}

	getValue() {
		return this.Value;
	}

	private Value: number;
}
