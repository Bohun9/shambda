import { TokenType, Token, tokenTypeToString } from "./lexer.js";
import * as S from "./surface.js";
import { ParserError } from "./error.js";

export default class Parser {
    private index: number;

    constructor(private tokens: Token[]) {
        this.index = 0;
    }

    peek(): Token {
        const token = this.tokens[this.index];
        if (!token) {
            throw new Error("internal error");
        }
        return token;
    }

    next(): Token {
        const token = this.peek();
        this.index++;
        return token;
    }

    expect(expected: TokenType): Token {
        const actual = this.next();
        if (expected != actual.type) {
            throw new ParserError(
                `expected ${tokenTypeToString(
                    expected
                )}, got ${actual.toString()}`
            );
        }
        return actual;
    }

    parseAtom(): S.Expr {
        const t = this.next();
        switch (t.type) {
            case TokenType.INTEGER:
                return new S.Int(t.intValue());
            case TokenType.IDENT:
                return new S.Var(t.stringValue());
            case TokenType.LPAREN:
                const e = this.parseExpr();
                this.expect(TokenType.RPAREN);
                return e;
            case TokenType.BACKSLASH:
                const param = this.expect(TokenType.IDENT);
                this.expect(TokenType.DOT);
                const body = this.parseExpr();
                return new S.Lambda(param.stringValue(), body);
            case TokenType.IF:
                const e1 = this.parseExpr();
                this.expect(TokenType.THEN);
                const e2 = this.parseExpr();
                this.expect(TokenType.ELSE);
                const e3 = this.parseExpr();
                return new S.If(e1, e2, e3);
            default:
                throw new ParserError(
                    `expected expression, got ${t.toString()}`
                );
        }
    }

    private static atomFirstSet = new Set([
        TokenType.INTEGER,
        TokenType.IDENT,
        TokenType.LPAREN,
        TokenType.BACKSLASH,
        TokenType.IF,
    ]);

    parseApp(): S.Expr {
        let e = this.parseAtom();
        while (Parser.atomFirstSet.has(this.peek().type)) {
            e = new S.App(e, this.parseAtom());
        }
        return e;
    }

    static infixPriority(tt: TokenType): [number, number] | undefined {
        switch (tt) {
            case TokenType.EQEQ:
            case TokenType.LE:
            case TokenType.GE:
                return [1, 2];
            case TokenType.PLUS:
            case TokenType.MINUS:
                return [3, 4];
            case TokenType.STAR:
                return [5, 6];
            default:
                return undefined;
        }
    }

    static tokenToBinop(tt: TokenType): S.BinopOperator {
        switch (tt) {
            case TokenType.PLUS:
                return S.BinopOperator.ADD;
            case TokenType.MINUS:
                return S.BinopOperator.SUB;
            case TokenType.STAR:
                return S.BinopOperator.MUL;
            case TokenType.EQEQ:
                return S.BinopOperator.EQ;
            case TokenType.LE:
                return S.BinopOperator.LE;
            case TokenType.GE:
                return S.BinopOperator.GE;
            default:
                throw new Error("internal error");
        }
    }

    parseExpr(minPrio: number = 0): S.Expr {
        let lhs = this.parseApp();
        for (;;) {
            const op = this.peek().type;
            const prio = Parser.infixPriority(op);
            if (!prio) {
                break;
            }
            const [lPrio, rPrio] = prio;
            if (lPrio < minPrio) {
                break;
            }
            this.next();
            const rhs = this.parseExpr(rPrio);
            lhs = new S.Binop(Parser.tokenToBinop(op), lhs, rhs);
        }
        return lhs;
    }

    parseProgram(): S.Expr {
        const program = this.parseExpr();
        this.expect(TokenType.EOF);
        return program;
    }
}
