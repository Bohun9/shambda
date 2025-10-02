import * as C from "./core.js";

function codeGenValue(v: C.Value): string {
    if (v instanceof C.Int) {
        return v.value.toString();
    } else if (v instanceof C.String) {
        return `"${v.value}"`;
    } else if (v instanceof C.Var) {
        return `"$${v.name}"`;
    } else {
        throw new Error("internal error");
    }
}

function binopToString(op: C.BinopOperator): string {
    switch (op) {
        case C.BinopOperator.EQ:
            return "==";
        case C.BinopOperator.ADD:
            return "+";
        case C.BinopOperator.SUB:
            return "-";
        case C.BinopOperator.MUL:
            return "*";
        case C.BinopOperator.DIV:
            return "/";
        case C.BinopOperator.LE:
            return "<=";
        case C.BinopOperator.GE:
            return ">=";
    }
}

function codeGenExpr(e: C.Expr): string {
    if (e instanceof C.ValueExpr) {
        return codeGenValue(e.value);
    } else if (e instanceof C.Binop) {
        const op = binopToString(e.operator);
        const lhsCode = codeGenValue(e.lhs);
        const rhsCode = codeGenValue(e.rhs);
        return `$((${lhsCode} ${op} ${rhsCode}))`;
    } else if (e instanceof C.App) {
        const funCode = codeGenValue(e.fun);
        const argsCode = e.args.map(codeGenValue).join(" ");
        return `$(${funCode} ${argsCode})`;
    } else {
        throw new Error("internal error");
    }
}

function codeGenInstr(
    i: C.Instr,
    indentLevel: number,
    indentWidth: number
): string {
    const pad = " ".repeat(indentWidth * indentLevel);
    if (i instanceof C.Return) {
        const c = codeGenValue(i.value);
        return `${pad}echo ${c}`;
    } else if (i instanceof C.Assign) {
        const c = codeGenExpr(i.expr);
        return `${pad}${i.varName}=${c}`;
    } else if (i instanceof C.If) {
        const condCode = codeGenValue(i.condition);
        const thenCode = i.thenBranch
            .map((x) => codeGenInstr(x, indentLevel + 1, indentWidth))
            .join("\n");
        const elseCode = i.elseBranch
            .map((x) => codeGenInstr(x, indentLevel + 1, indentWidth))
            .join("\n");
        const ifHeader = `${pad}if (( ${condCode} != 0 )); then`;
        const elseHeader = `${pad}else`;
        const ifFooter = `${pad}fi`;
        return `${ifHeader}\n${thenCode}\n${elseHeader}\n${elseCode}\n${ifFooter}`;
    } else {
        throw new Error("internal error");
    }
}

function codeGenFunction(func: C.Function, indentWidth: number): string {
    const headerCode = `${func.name}() {`;
    const paramsCode = func.params
        .map((p, i) => `${" ".repeat(indentWidth)}local ${p}=$${i + 1}`)
        .join("\n");
    const bodyCode = func.body
        .map((i) => codeGenInstr(i, 1, indentWidth))
        .join("\n");
    return `${headerCode}\n${paramsCode}\n${bodyCode}\n}`;
}

export default function codeGenProgram(
    program: C.Program,
    indentWidth: number = 4
): string {
    const headerCode = "#!/bin/bash";
    const runtimeCode = "source ./runtime.bash";
    const functionsCode = program.functions
        .map((f) => codeGenFunction(f, indentWidth))
        .join("\n");
    const mainCallCode = `${program.mainFunction}`;
    return `${headerCode}\n${runtimeCode}\n${functionsCode}\n${mainCallCode}`;
}
