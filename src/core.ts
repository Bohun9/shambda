import { BinopOperator, binopToString } from "./surface.js";

abstract class Value {
    abstract prettyPrint(): string;
}

class Int extends Value {
    constructor(public value: number) {
        super();
    }

    prettyPrint(): string {
        return `Int(${this.value.toString()})`;
    }
}

class String extends Value {
    constructor(public value: string) {
        super();
    }

    prettyPrint(): string {
        return `String(${this.value})`;
    }
}

class Var extends Value {
    constructor(public name: string) {
        super();
    }

    prettyPrint(): string {
        return `Var(${this.name})`;
    }
}

abstract class Expr {
    abstract prettyPrint(): string;
}

class ValueExpr extends Expr {
    constructor(public value: Value) {
        super();
    }

    prettyPrint(): string {
        return `AtomicExpr(${this.value.prettyPrint()})`;
    }
}

class Binop extends Expr {
    constructor(
        public operator: BinopOperator,
        public lhs: Value,
        public rhs: Value
    ) {
        super();
    }

    prettyPrint(): string {
        const opStr = binopToString(this.operator);
        const lhsStr = this.lhs.prettyPrint();
        const rhsStr = this.rhs.prettyPrint();
        return `Binop(${opStr}, ${lhsStr}, ${rhsStr})`;
    }
}

class App extends Expr {
    constructor(
        public fun: Value,
        public args: Value[]
    ) {
        super();
    }

    prettyPrint(): string {
        const funStr = this.fun.prettyPrint();
        const argsStr = this.args.map((v) => v.prettyPrint()).join(", ");
        return `App(${funStr}, [${argsStr}])`;
    }
}

abstract class Instr {
    abstract prettyPrint(indentLevel: number, indentWidth: number): string;

    pad(indentLevel: number, indentWidth: number): string {
        return " ".repeat(indentWidth * indentLevel);
    }
}

class Assign extends Instr {
    constructor(
        public varName: string,
        public expr: Expr
    ) {
        super();
    }

    prettyPrint(indentLevel: number, indentWidth: number): string {
        const pad = this.pad(indentLevel, indentWidth);
        const exprStr = this.expr.prettyPrint();
        return `${pad}Assign(${this.varName}, ${exprStr})`;
    }
}

class Return extends Instr {
    constructor(public value: Value) {
        super();
    }

    prettyPrint(indentLevel: number, indentWidth: number): string {
        const pad = this.pad(indentLevel, indentWidth);
        const valueStr = this.value.prettyPrint();
        return `${pad}Return(${valueStr})`;
    }
}

function prettyPrintArray(
    arr: {
        prettyPrint: (indentLevel: number, indentWidth: number) => string;
    }[],
    indentLevel: number,
    indentWidth: number,
    sep: string
): string {
    return arr.map((x) => x.prettyPrint(indentLevel, indentWidth)).join(sep);
}

class If extends Instr {
    constructor(
        public condition: Value,
        public thenBranch: Instr[],
        public elseBranch: Instr[]
    ) {
        super();
    }

    prettyPrint(indentLevel: number, indentWidth: number): string {
        const pad = this.pad(indentLevel, indentWidth);
        const condStr = this.condition.prettyPrint();
        const prettyPrintBranch = (b: Instr[]) => {
            const branchStr = prettyPrintArray(
                b,
                indentLevel + 1,
                indentWidth,
                ",\n"
            );
            return `${pad}{\n${branchStr}\n${pad}}`;
        };
        const thenStr = prettyPrintBranch(this.thenBranch);
        const elseStr = prettyPrintBranch(this.elseBranch);
        return `${pad}If(${condStr},\n${thenStr}\n${elseStr})`;
    }
}

class Function {
    constructor(
        public name: string,
        public params: string[],
        public body: Instr[]
    ) {}

    prettyPrint(indentLevel: number, indentWidth: number): string {
        const paramsStr = this.params.join(", ");
        const bodyStr = prettyPrintArray(this.body, 1, indentWidth, ",\n");
        return `Function(${this.name}, [${paramsStr}],\n${bodyStr})`;
    }
}

class Program {
    constructor(
        public functions: Function[],
        public mainFunction: string
    ) {}

    prettyPrint(indentWidth: number = 2): string {
        return prettyPrintArray(this.functions, 0, indentWidth, "\n");
    }
}

export {
    Value,
    Int,
    String,
    Var,
    Expr,
    ValueExpr,
    App,
    Binop,
    Instr,
    Assign,
    Return,
    If,
    Function,
    Program,
    BinopOperator,
};
