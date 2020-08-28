import * as zsNative from './zsNative';

export class ParameterDescriptor {
	constructor(name: string, type: zsNative.NativeTypeIdentifier) {
		this.Name = name;
		this.Type = type;
	}

	public getName(): string {return this.Name;}
	public getTypeIdentifier(): zsNative.NativeTypeIdentifier {return this.Type;}

	Name: string;
	Type: zsNative.NativeTypeIdentifier; 

	public static Null: ParameterDescriptor = new ParameterDescriptor("", zsNative.NativeTypeIdentifier.NULL);
} 

export class DirectiveDescriptor {
	constructor(name: string, parameters: ParameterDescriptor[]) {
		this.Name = name;
		this.Parameters = parameters;
	}

	public getName(): string {return this.Name;}
	public getParameters(): ParameterDescriptor[] {return this.Parameters;}

	private Name: string;
	private Parameters: ParameterDescriptor[];

	public static Null: DirectiveDescriptor = new DirectiveDescriptor("", []);
}

export class Parameter {
	constructor(descriptor: ParameterDescriptor) {
		this.Descriptor = descriptor;
	}

	public getDescriptor(): ParameterDescriptor {
		return this.Descriptor;
	}

	public set(value: any) {
		this.Value = value;
	}

	public get(): any {
		return this.Value;
	}

	private Descriptor: ParameterDescriptor;
	private Value: any;

	public static Null: Parameter = new Parameter(ParameterDescriptor.Null);
}

export class Directive {
	constructor(descriptor: DirectiveDescriptor) {
		this.Descriptor = descriptor;
		this.Parameters = new Array<Parameter>();
		for(let i=0; i<descriptor.getParameters().length; i++) {
			this.Parameters.push(new Parameter(descriptor.getParameters()[i]));
		}
	}

	getDescriptor(): DirectiveDescriptor {return this.Descriptor;}
	getParameters(): Parameter[] {return this.Parameters;}

	private Descriptor: DirectiveDescriptor;
	private Parameters: Array<Parameter>;

	public static Null: Directive = new Directive(DirectiveDescriptor.Null);
}

