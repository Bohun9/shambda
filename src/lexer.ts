import { LexerError } from "./error.js";

export enum TokenType {
    INTEGER,
    IDENT,
    PLUS,
    MINUS,
    STAR,
    EQEQ,
    LE,
    GE,
    BACKSLASH,
    DOT,
    EOF,
    LPAREN,
    RPAREN,
    IF,
    THEN,
    ELSE,
}

export function tokenTypeToString(tt: TokenType): string {
    return TokenType[tt];
}

export class Token {
    constructor(
        public type: TokenType,
        private lexeme: string
    ) {}

    stringValue(): string {
        return this.lexeme;
    }

    intValue(): number {
        return parseInt(this.lexeme);
    }

    toString(): string {
        return tokenTypeToString(this.type);
    }
}

export class Lexer {
    constructor(private input: string) {}

    private static lexerRules: [RegExp, TokenType | undefined][] = [
        [/^\+/, TokenType.PLUS],
        [/^\-/, TokenType.MINUS],
        [/^\*/, TokenType.STAR],
        [/^==/, TokenType.EQEQ],
        [/^<=/, TokenType.LE],
        [/^>=/, TokenType.GE],
        [/^\\/, TokenType.BACKSLASH],
        [/^\./, TokenType.DOT],
        [/^\(/, TokenType.LPAREN],
        [/^\)/, TokenType.RPAREN],
        [/^if/, TokenType.IF],
        [/^then/, TokenType.THEN],
        [/^else/, TokenType.ELSE],
        [/^[a-z]+/, TokenType.IDENT],
        [/^\d+/, TokenType.INTEGER],
        [/^\s+/, undefined],
        [/^\/\/.*\n/, undefined],
    ];

    scanTokens(): Token[] {
        let index = 0;
        let tokens: Token[] = [];
        while (index < this.input.length) {
            let longestMatch: [string, TokenType | undefined] = ["", undefined];
            for (const [re, type] of Lexer.lexerRules) {
                const match = re.exec(this.input.slice(index));
                if (match && match[0].length > longestMatch[0].length) {
                    longestMatch = [match[0], type];
                }
            }
            if (longestMatch[0].length === 0) {
                throw new LexerError(
                    `unexpected character '${this.input[index]}'`
                );
            } else if (longestMatch[1] !== undefined) {
                tokens.push(new Token(longestMatch[1], longestMatch[0]));
            }
            index += longestMatch[0].length;
        }
        tokens.push(new Token(TokenType.EOF, ""));
        return tokens;
    }
}
