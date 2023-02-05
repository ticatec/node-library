import {DBConnection, DBFactory} from "@ticatec/node-common-library";
import dmdb, {Pool, Connection} from "dmdb";
import type {Result} from "dmdb"
import log4js from "log4js";
import {PostConstructionFun} from "@ticatec/node-common-library/lib/db/DBConnection";
import Field, {FieldType} from "@ticatec/node-common-library/lib/db/Field";

const logger = log4js.getLogger('ticatec.dbs.dm.DBConnection');

class DMDBConnection extends DBConnection {

    #connection: Connection;

    constructor(conn) {
        super();
        this.#connection = conn;
    }

    async beginTransaction(): Promise<void> {
        return
    }

    async close(): Promise<void> {
        await this.#connection.close();
    }

    async commit(): Promise<void> {
        await this.#connection.commit();
    }

    async rollback(): Promise<void> {
        try {
            await this.#connection.rollback();
        } catch (e) {
            logger.error('Cannot rollback the database.\n' + e);
        }
    }

    async executeUpdate(sql: string, params): Promise<number> {
        let result:Result<any> = await this.#connection.execute(sql, params);
        return result.rowsAffected;
    }

    getFields(result: any): Array<Field> {
        const list: Array<Field> = [];
        if (result && result.metaData) {
            result.metaData.forEach(field => {
                const type = this.getFieldType(field);
                list.push({name: this.toCamel(field.name.toLowerCase()), type});
            })
        }
        return list;
    }

    protected getRowSet(result: any): Array<any> {
        return result.rows;
    }

    getAffectRows(result): number {
        return result.rowsAffected;
    }

    protected buildFieldsMap(fields: Array<any>): Map<string, string> {
        let map: Map<string, string> = new Map<string, string>();
        fields.forEach(field => {
            map.set(field.name, this.toCamel(field.name.toLowerCase()));
        });
        return map;
    }

    protected getFirstRow(result: any): any {
        let row:any = result.rows.length > 0 ? result.rows[0] : null;
        return row == null ? null : this.convertRowToData(result.metaData, row);
    }

    async fetchData(sql: string, params: any | void, postConstruction: PostConstructionFun | void): Promise<any> {
        return await this.#connection.execute(sql, params);
    }

    /**
     * 得到字段的顺序
     * @param fields
     * @returns {*[]}
     */
    private getFieldList(fields) {
        let list = [];
        fields.forEach((field, idx) => {
            list.push(this.toCamel(field.name.toLowerCase()));
        });
        return list;
    }

    /**
     * 将达梦的数据行转换成对象
     * @param fields 处理后的字段
     * @param row
     * @returns {{}}
     */
    private rowToData(fields, row) {
        let obj = {};
        fields.forEach((field, idx) => {
            obj[field] = row[idx];
        });
        return obj;
    }

    /**
     * 根据原始的字段定义转换行数据为对象
     * @param fields 原始的字段
     * @param row
     * @returns {{}}
     */
    private convertRowToData(fields, row) {
        let obj = {};
        fields.forEach((field, idx) => {
            obj[this.toCamel(field.name.toLowerCase())] = row[idx];
        });
        return obj;
    }


    /**
     * 将返回的多行数据转换成数组对象
     * @param result
     * @protected
     */
    resultToList(result): Array<any> {
        let list:Array<any> = [];
        let fields = this.getFieldList(result.metaData);
        result.rows.forEach(row => {
            list.push(this.rowToData(fields, row));
        });
        return list;
    }

    private getFieldType(field): FieldType {
        return FieldType.Text;
    }
}

class DMDBFactory implements DBFactory {

    #pool:Pool;
    #config: any;

    constructor(config:any) {
        this.#config = config;
    }

    async createDBConnection(): Promise<DBConnection> {
        if (this.#pool == null) {
            this.#pool = await dmdb.createPool(this.#config)
        }
        let conn = await this.#pool.getConnection();
        return new DMDBConnection(conn);
    }

}

let factory;

export const initializeDmDB = (config:any):DBFactory => {
    return new DMDBFactory(config);
}
