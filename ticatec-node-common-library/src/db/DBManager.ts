                                                                                                                                                                                                                                                                                                        import DBConnection from "./DBConnection";
import DBFactory from "./DBFactory";

let dbFactory:DBFactory;

const init =  (_factory): void => {
    dbFactory = _factory;
}

// @ts-ignore
const connect = async ():Promise<DBConnection> => {
    return await dbFactory.createDBConnection();
}

export default {init, connect}