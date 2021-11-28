import * as dotenv from 'dotenv';
import { IDbConnector, createConnection, IDbOptions } from './connection';

dotenv.config();

const options: IDbOptions = {
    host: process.env.DB_HOST as string,
    database: process.env.DB_NAME as string,
    port: Number(process.env.DB_PORT as string),
    user: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
};

describe('DbConnection', () => {
    let connector: IDbConnector;
    beforeAll(async () => {
        try {
            connector = createConnection(options, false);
            await connector.connected;
        } catch (e) {
            console.warn('Connection failed, is MySQL running?', options);
        }
    });
    afterAll(async () => {
        await connector.disconnect();
    });

    it('should create connector instance', () => expect(connector).toBeDefined());

    it('should be connected', async () => {
        expect(await connector.connected).toBe(true);
    });

    it('should make query', async () => {
        const [ result ] = await connector.query('select 1 + 1 as solution');
        expect(result.solution).toEqual(2);
    });
});
