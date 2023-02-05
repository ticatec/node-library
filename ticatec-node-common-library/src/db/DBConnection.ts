import Field from "./Field";

type PostConstructionFun = (obj: any) => void;

export {PostConstructionFun};

export default abstract class DBConnection {

    /**
     * 开始事务
     */
    abstract beginTransaction(): Promise<void>;

    /**
     * 提交
     */
    abstract commit(): Promise<void>;

    /**
     * 回滚
     */
    abstract rollback(): Promise<void>;

    /**
     * 关闭
     */
    abstract close(): Promise<void>;

    /**
     * 执行update/delete查询，返回影响记录的数量
     * @param sql
     * @param params
     */
    abstract executeUpdate(sql: string, params: Array<any>): Promise<number>;

    /**
     * 执行select查询语句，返回数据列表
     * @param sql
     * @param params
     * @param postConstruction
     */
    async listQuery(sql: string, params: Array<any> | void, postConstruction:PostConstructionFun | void): Promise<Array<any>> {
        let result = await this.fetchData(sql, params, postConstruction);
        let list = this.resultToList(result);
        if (postConstruction) {
            list.forEach(data => postConstruction(data));
        }
        return list;
    }

    /**
     * 查询单条记录，如果有多条，返回第一条
     * @param sql
     * @param params
     * @param postConstruction
     */
    async find(sql: string, params: Array<any> | void, postConstruction:PostConstructionFun | void): Promise<any> {
        let result = await this.fetchData(sql, params, postConstruction);
        let row = this.getFirstRow(result);
        if (row && postConstruction) {
            postConstruction(row)
        }
        return row;
    }

    /**
     * 执行sql，获取数据
     * @param sql
     * @param params
     * @param postConstruction
     */
    abstract fetchData(sql: string, params: Array<any> | void, postConstruction:PostConstructionFun | void): Promise<any>;

    /**
     * 获取查询结果对应的字段名列表
     * @param result
     */
    abstract getFields(result): Array<Field>;

    /**
     * 从结果中获得数据集
     * @param result
     */
    protected abstract getRowSet(result): Array<any>;

    /**
     * 返回受影响的行数
     * @param result
     */
    abstract getAffectRows(result): number;

    /**
     * 下划线转换驼峰
     * @param name
     * @returns {*}
     */
    protected toCamel(name) {
        return name.replace(/\_(\w)/g, (all, letter) => {
            return letter.toUpperCase();
        });
    }

    /**
     * 构建字段对应列表
     * @param fields
     * @protected
     */
    protected buildFieldsMap(fields: Array<any>): Map<string, string> {
        return null;
    }

    /**
     * 将返回的多行数据转换成数组对象
     * @param result
     * @protected
     */
    resultToList(result): Array<any> {
        let list:Array<any> = [];
        let fields = this.buildFieldsMap(result.fields);
        result.rows.forEach(row => {
            let obj = {};
            fields.forEach((value, key)=> {
                obj[value] = row[key];
            });
            list.push(obj);
        });
        return list;
    }

    /**
     * 返回设定结果集大小的附加语句
     * @param rowCount
     * @param offset
     */
    getRowSetLimitClause(rowCount: number, offset: number):string {
        return ` limit ${rowCount} offset ${offset}`;
    }

    /**
     * 将首行转换为对象，如果首行不存在，返回空
     * @param result
     * @protected
     */
    protected abstract getFirstRow(result): any;

}