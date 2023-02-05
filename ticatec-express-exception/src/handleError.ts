import ErrorResponse from "./ErrorResponse";
import {AppError, UnauthenticatedError, InsufficientPermissionError, IllegalParameterError, ActionNotFoundError} from './Errors'
import ip from 'ip';
import log4js from "log4js";


let logger = log4js.getLogger('NodeAppException');

const sendResponse = (res, statusCode, data: any):void => {
    res.status(statusCode).json(data);
}

const getErrorCode = (err) => {
    if (err instanceof UnauthenticatedError) {
        return {status: 401, code: -1};
    } else if (err instanceof InsufficientPermissionError) {
        return {status: 403, code: -1};
    } else if (err instanceof IllegalParameterError) {
        return {status: 400, code: -1, message: err.message};
    } else if (err instanceof ActionNotFoundError) {
        return {status: 404, code: -1};
    } else if (err instanceof AppError) {
        return {status: 500, code: err.code, message: err.message};
    } else {
        logger.error(err);
        return {status: 500, code: -1};
    }
}

/**
 * 发送应用错误到客户端
 * @param req
 * @param res
 * @param err
 */
const sendApplicationError = (req, res, err) => {
    let respCode = getErrorCode(err);
    let data:ErrorResponse = {
        code: respCode.code,
        module: AppError.moduleName || 'Unknown',
        host: ip.address(),
        client: req.ip,
        path: req.baseUrl +  req.path,
        method: req.method,
        timestamp: (new Date()).getTime(),
        message: (respCode.message != null && respCode.message != '') ? respCode.message : null,
        stack: req.get('env')=='development' ? err.stack : null
    }
    sendResponse(res, respCode.status, data);
}

/**
 * 定义错误处理函数
 * @param err
 * @param req
 * @param res
 */
const handleError = (err, req, res) => {
    sendApplicationError(req, res, err);
}

export {handleError};