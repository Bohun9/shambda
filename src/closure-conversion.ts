import * as S from "./surface.js";
import * as C from "./core.js";
import { SemanticError } from "./error.js";

type Level = number;

class Environment<K, V> {
    private history: [K, V | undefined][] = [];
    private mapping: Map<K, V> = new Map();

    constructor() {}

    lookup(k: K): V | undefined {
        return this.mapping.get(k);
    }

    define(k: K, v: V): void {
        this.history.push([k, this.lookup(k)]);
        this.mapping.set(k, v);
    }

    pop(): void {
        const [k, v] = this.history.pop()!;
        if (v === undefined) {
            this.mapping.delete(k);
        } else {
            this.mapping.set(k, v);
        }
    }
}

const ENV_NAME = "_env";
const GET_ENV_DATA_NAME = "get_env_data";
const EXTEND_ENV_NAME = "extend_env";
const EXTRACT_FUN_NAME = "extract_fun";
const EXTRACT_ENV_NAME = "extract_env";
const APP_FUN_NAME = "_fun";
const APP_ENV_NAME = "_app_env";
const MAKE_CLOSURE_NAME = "make_closure";

export default class ClosureConversion
    implements S.ExprVisitor<[C.Value, C.Instr[]]>
{
    private freshId = 0;
    private level = -1;
    private hoistedFunctions: C.Function[] = [];
    private environment = new Environment<string, Level>();

    constructor() {}

    freshFunctionName(): string {
        return `fn${this.freshId++}`;
    }

    freshVarName(): string {
        return `_${this.freshId++}`;
    }

    visitExpr(e: S.Expr): [C.Value, C.Instr[]] {
        return e.accept(this);
    }

    visitInt(e: S.Int): [C.Value, C.Instr[]] {
        return [new C.Int(e.value), []];
    }

    visitVar(e: S.Var): [C.Value, C.Instr[]] {
        const defLevel = this.environment.lookup(e.name);
        if (defLevel === undefined) {
            throw new SemanticError(`undefined variable ${e.name}`);
        } else if (defLevel == this.level) {
            return [new C.Var(e.name), []];
        } else {
            const tmp = this.freshVarName();
            return [
                new C.Var(tmp),
                [
                    new C.Assign(
                        tmp,
                        new C.App(new C.String(GET_ENV_DATA_NAME), [
                            new C.Var(ENV_NAME),
                            new C.Int(defLevel - 1),
                        ])
                    ),
                ],
            ];
        }
    }

    visitBinop(e: S.Binop): [C.Value, C.Instr[]] {
        const [v1, instrs1] = this.visitExpr(e.lhs);
        const [v2, instrs2] = this.visitExpr(e.rhs);
        const tmp = this.freshVarName();
        return [
            new C.Var(tmp),
            [
                ...instrs1,
                ...instrs2,
                new C.Assign(tmp, new C.Binop(e.operator, v1, v2)),
            ],
        ];
    }

    visitIf(e: S.If): [C.Value, C.Instr[]] {
        const [v1, instrs1] = this.visitExpr(e.condition);
        const [v2, instrs2] = this.visitExpr(e.thenBranch);
        const [v3, instrs3] = this.visitExpr(e.elseBranch);
        const tmp = this.freshVarName();
        return [
            new C.Var(tmp),
            [
                ...instrs1,
                new C.If(
                    v1,
                    [...instrs2, new C.Assign(tmp, new C.ValueExpr(v2))],
                    [...instrs3, new C.Assign(tmp, new C.ValueExpr(v3))]
                ),
            ],
        ];
    }

    visitApp(e: S.App): [C.Value, C.Instr[]] {
        const [v1, instrs1] = this.visitExpr(e.fun);
        const [v2, instrs2] = this.visitExpr(e.arg);
        const tmp = this.freshVarName();
        return [
            new C.Var(tmp),
            [
                ...instrs1,
                ...instrs2,
                new C.Assign(
                    APP_FUN_NAME,
                    new C.App(new C.String(EXTRACT_FUN_NAME), [v1])
                ),
                new C.Assign(
                    APP_ENV_NAME,
                    new C.App(new C.String(EXTRACT_ENV_NAME), [v1])
                ),
                new C.Assign(
                    tmp,
                    new C.App(new C.Var(APP_FUN_NAME), [
                        new C.Var(APP_ENV_NAME),
                        v2,
                    ])
                ),
            ],
        ];
    }

    visitLambda(e: S.Lambda): [C.Value, C.Instr[]] {
        const lambdaName = this.hoistFunction(e.param, e.body);
        const tmp = this.freshVarName();
        return [
            new C.Var(tmp),
            [
                new C.Assign(
                    tmp,
                    new C.App(new C.String(MAKE_CLOSURE_NAME), [
                        new C.String(lambdaName),
                        new C.Var(ENV_NAME),
                    ])
                ),
            ],
        ];
    }

    visitExprWithBinding(
        e: S.Expr,
        x: string,
        level: Level
    ): [C.Value, C.Instr[]] {
        this.environment.define(x, level);
        const res = this.visitExpr(e);
        this.environment.pop();
        return res;
    }

    hoistFunction(param: string, body: S.Expr): string {
        const functionName = this.freshFunctionName();
        this.level++;
        const [v, instrs] = this.visitExprWithBinding(body, param, this.level);
        this.level--;
        this.hoistedFunctions.push(
            new C.Function(
                functionName,
                [ENV_NAME, param],
                [
                    new C.Assign(
                        ENV_NAME,
                        new C.App(new C.String(EXTEND_ENV_NAME), [
                            new C.Var(ENV_NAME),
                            new C.Var(param),
                        ])
                    ),
                    ...instrs,
                    new C.Return(v),
                ]
            )
        );
        return functionName;
    }

    convProgram(program: S.Expr): C.Program {
        const mainFunction = this.hoistFunction("_dummy_arg", program);
        return new C.Program(this.hoistedFunctions, mainFunction);
    }
}
