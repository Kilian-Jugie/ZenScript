export class Stack<T> {
    constructor() {
        this.Container = new Array<T>();
    }

    public push(value: T): void {
        this.Container.push(value);
    }

    public pop(): T | undefined {
        if(this.Container.length == 0) return undefined;
        const ret = this.Container[this.Container.length-1];
        this.Container.splice(this.Container.length-2, 1);
        return ret;
    }

    public peek(depth = 0): T | undefined {
        if(this.Container.length == 0) return undefined;
        else if(depth>this.Container.length || depth<0) return undefined;
        return this.Container[this.Container.length-(1+depth)];
    }

    public count(): number {
        return this.Container.length; 
    }

    Container: Array<T>;
}

