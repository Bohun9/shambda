enum BinopOperator {
    ADD,
    SUB,
    MUL,
    DIV,
    EQ,
    LE,
    GE,
}

function binopToString(op: BinopOperator): string {
    return BinopOperator[op];
}

abstract class Expr {
    abstract accept<R>(v: ExprVisitor<R>): R;

    prettyPrint(): string {
        return this.accept(new ExprPrettyPrinter());
    }
}

class Int extends Expr {
    constructor(public value: number) {
        super();
    }

    accept<R>(v: ExprVisitor<R>): R {
        return v.visitInt(this);
    }
}

class Var extends Expr {
    constructor(public name: string) {
        super();
    }

    accept<R>(v: ExprVisitor<R>): R {
        return v.visitVar(this);
    }
}

class Binop extends Expr {
    constructor(
        public operator: BinopOperator,
        public lhs: Expr,
        public rhs: Expr
    ) {
        super();
    }

    accept<R>(v: ExprVisitor<R>): R {
        return v.visitBinop(this);
    }
}

class If extends Expr {
    constructor(
        public condition: Expr,
        public thenBranch: Expr,
        public elseBranch: Expr
    ) {
        super();
    }

    accept<R>(v: ExprVisitor<R>): R {
        return v.visitIf(this);
    }
}

class App extends Expr {
    constructor(
        public fun: Expr,
        public arg: Expr
    ) {
        super();
    }

    accept<R>(v: ExprVisitor<R>): R {
        return v.visitApp(this);
    }
}

class Lambda extends Expr {
    constructor(
        public param: string,
        public body: Expr
    ) {
        super();
    }

    accept<R>(v: ExprVisitor<R>): R {
        return v.visitLambda(this);
    }
}

interface ExprVisitor<R> {
    visitInt(e: Int): R;
    visitVar(e: Var): R;
    visitBinop(e: Binop): R;
    visitIf(e: If): R;
    visitApp(e: App): R;
    visitLambda(e: Lambda): R;
}

class ExprPrettyPrinter implements ExprVisitor<string> {
    private indentLevel: number;

    constructor(private indentWidth: number = 2) {
        this.indentLevel = 0;
    }

    private pad(): string {
        return " ".repeat(this.indentWidth * this.indentLevel);
    }

    visit(e: Expr): string {
        this.indentLevel++;
        const s = e.accept(this);
        this.indentLevel--;
        return s;
    }

    visitInt(e: Int): string {
        return `${this.pad()}Int(${e.value.toString()})`;
    }

    visitVar(e: Var): string {
        return `${this.pad()}Var(${e.name})`;
    }

    visitBinop(e: Binop): string {
        const opStr = binopToString(e.operator);
        const lhsStr = this.visit(e.lhs);
        const rhsStr = this.visit(e.rhs);
        return `${this.pad()}Binop(${opStr},\n${lhsStr},\n${rhsStr}\n${this.pad()})`;
    }

    visitIf(e: If): string {
        const condStr = this.visit(e.condition);
        const thenStr = this.visit(e.thenBranch);
        const elseStr = this.visit(e.elseBranch);
        return `${this.pad()}If(\n${condStr},\n${thenStr},\n${elseStr}\n${this.pad()})`;
    }

    visitApp(e: App): string {
        const funStr = this.visit(e.fun);
        const argStr = this.visit(e.arg);
        return `${this.pad()}App(\n${funStr},\n${argStr}\n${this.pad()})`;
    }

    visitLambda(e: Lambda): string {
        const bodyStr = this.visit(e.body);
        return `${this.pad()}Lambda(${e.param},\n${bodyStr}\n${this.pad()})`;
    }
}

export {
    BinopOperator,
    binopToString,
    Expr,
    Int,
    Var,
    Binop,
    If,
    App,
    Lambda,
    ExprPrettyPrinter,
    type ExprVisitor,
};
