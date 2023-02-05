
export class AppError extends Error {

    static moduleName:string;

    private _code: number;

    get code(): number {
        return this._code;
    }

    constructor (code: number, message:string=null) {
        super(message);
        //@ts-ignore
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this._code = code;
    }
}

/**
 * 用户未验证
 */
export class UnauthenticatedError extends Error {
    constructor() {
        super('Unauthenticated user is accessing the system.');
        //@ts-ignore
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
    }
}

/**
 * 用户权限不足
 */
export class InsufficientPermissionError extends Error {
    constructor() {
        super('User doesn\'t has permission to access this function.');
        //@ts-ignore
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
    }
}

export class IllegalParameterError extends Error {
    constructor(message) {
        super(message);
        //@ts-ignore
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
    }
}

export class ActionNotFoundError extends Error {
    constructor() {
        super('Web action not found.');
        //@ts-ignore
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
    }
}
