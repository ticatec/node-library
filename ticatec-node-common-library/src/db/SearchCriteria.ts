import DBConnection from './DBConnection';
import PaginationList from "./PaginationList";
import StringUtils from "../StringUtils";
import log4js from 'log4js';

const logger = log4js.getLogger('ticatec.common.SearchCriteria');

const DEFAULT_ROWS_PAGE = 25;
const FIRST_PAGE = 1;

export default abstract class SearchCriteria {


    /**
     * 查询符合条件的记录数量
     * @param conn
     * @param sql
     * @param params
     * @private
     */
    private async queryCount(conn: DBConnection, sql: string, params: Array<any>):Promise<number> {
        let result = await conn.find(`select count(*) as cc from (${sql}) a`, params);
        return result == null ? 0 : parseInt(result['cc']);
    }

    /**
     * 在将行记录转换成对象后的回调函数
     * @protected
     */
    protected getPostConstructor():any {
        return null;
    }

    /**
     * 判断是否为空
     * @param s
     * @protected
     */
    protected isNotEmpty(s: string):boolean {
        return !StringUtils.isEmpty(s);
    }

    /**
     * 封装like查询值
     * @param s
     * @protected
     */
    protected wrapLikeMatch(s: string): string {
        return `%${s}%`;
    }

    protected abstract getSQL(): string;

    protected getOrderClause(): string {
        return '';
    }

    protected abstract getParams():Array<any>;

    /**
     * 执行查询语句，返回分页查询结果
     * @param conn
     * @param page
     * @param rowCount
     */
    async paginationQuery(conn: DBConnection, page: any, rowCount: any): Promise<PaginationList> {
        let sql = this.getSQL();
        let params = this.getParams();
        let count = await this.queryCount(conn, sql, params);
        if (count > 0) {
            const rows = StringUtils.parseNumber(rowCount, DEFAULT_ROWS_PAGE);
            const offset = ((StringUtils.parseNumber(page, FIRST_PAGE) || FIRST_PAGE) - 1) * rows;
            let listSQL = `${sql} ${this.getOrderClause()} ${conn.getRowSetLimitClause(rows, offset)} `;
            logger.debug(`符合条件总数：${count}, 需要记录从${offset}开始读取${rows}条记录`);
            logger.debug('执行查询语句', listSQL, params);
            let list = count > offset ? await conn.listQuery(listSQL, params, this.getPostConstructor()) : [];
            const hasMore = offset + rows > count;
            return {count, hasMore, list}
        } else {
            return {count, hasMore: false, list: []}
        }
    }

    /**
     * 不分页，返回所有符合条件的记录
     * @param conn
     */
    async query(conn: DBConnection):Promise<Array<any>> {
        let params = this.getParams();
        return await conn.listQuery(`${this.getSQL()} ${this.getOrderClause()}`, params)
    }
}