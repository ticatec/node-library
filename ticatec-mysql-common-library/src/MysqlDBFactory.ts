import {DBConnection, DBFactory} from "@ticatec/node-common-library";
import mysql, {Pool, PoolConnection} from "mysql2/promise";
import log4js from "log4js";
import {PostConstructionFun} from "@ticatec/node-common-library/lib/db/DBConnection";
import Field from "@ticatec/node-common-library/lib/db/Field";


const logger = log4js.getLogger('ticatec.dbs.pg.DBConnection');

class MysqlDBConnection extends DBConnection {

    #client: PoolConnection;

    constructor(conn: PoolConnection) {
        super();
        this.#client = conn;
    }

    async beginTransaction(): Promise<void> {
        await this.#client.beginTransaction();
        return
    }

    async close(): Promise<void> {
        await this.#client.release();
    }

    async commit(): Promise<void> {
        await this.#client.commit();
    }

    async rollback(): Promise<void> {
        try {
            await this.#client.rollback();
        } catch (e) {
            logger.error('Cannot rollback the database.\n' + e);
        }
    }

    async executeUpdate(sql: string, params): Promise<number> {
        let result = await this.#client.execute(sql, params);
        return this.getAffectRows(result);
    }

    getFields(result: any): Array<Field>{
        const fields = result.fields;
        const list:Array<Field> = [];
        fields.forEach(field => {

        });
        return list;
    }

    getRowSet(result: any): Array<any> {
        return result.rows;
    }

    getAffectRows(result): number {
        return result.affectedRows;
    }

    protected buildFieldsMap(fields: Array<any>): Map<string, string> {
        let map: Map<string, string> = new Map<string, string>();
        fields.forEach(field => {
            map.set(field.name, this.toCamel(field.name.toLowerCase()));
        })
        return map;
    }

    protected getFirstRow(result: any): any {
        if (result.rows.length > 0) {
            let ds = {};
            result.fields.forEach(field => {
                ds[this.toCamel(field.name.toLowerCase())] = result.rows[0][field.name];
            })
        } else {
            return null;
        }
    }

    async fetchData(sql: string, params: Array<any> | void, postConstruction: PostConstructionFun | void): Promise<any> {
        return this.#client.execute(sql, params);
    }


}

class MysqlDBFactory implements DBFactory {

    #pool: Pool;

    constructor(pool: Pool) {
        this.#pool = pool;
    }

    async createDBConnection(): Promise<DBConnection> {
        return new MysqlDBConnection(await this.#pool.getConnection());
    }

}


export const initializeMySQL = (config):DBFactory => {
    return new MysqlDBFactory( mysql.createPool(config));
}

