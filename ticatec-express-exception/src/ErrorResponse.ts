export default interface ErrorResponse {
    code: number,
    module: string,
    host: string,
    client: string,
    path: string,
    method: string,
    timestamp: number,
    message: string | null,
    stack: string | null
}