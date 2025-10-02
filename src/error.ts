export class CompilerError extends Error {}

export class LexerError extends CompilerError {
    constructor(message: string) {
        super(`lexer error: ${message}`);
        this.name = "LexerError";
    }
}

export class ParserError extends CompilerError {
    constructor(message: string) {
        super(`parser error: ${message}`);
        this.name = "ParserError";
    }
}

export class SemanticError extends CompilerError {
    constructor(message: string) {
        super(`semantic error: ${message}`);
        this.name = "SemanticError";
    }
}
