import * as mysql from 'mysql';
import { createLogger } from '../helpers/logger';

export interface IDbConnector {
    readonly connection: mysql.Connection;
    readonly connected: Promise<boolean>;
    query: (sql: string, props?: any) => Promise<any[]>;
    disconnect: () => Promise<void>;
}

export interface IDbOptions {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
}

const _logger = createLogger({
    prefix: 'db',
    timestamp: true,
});

const createQueryFormatter = (escape: Function) =>
    (query: string, values: { [key: string]: unknown }) => {
        if (!values) return query;

        return query.replace(/\:(\w+)/g, (txt: string, key: string) => {
            if (values.hasOwnProperty(key)) {
                return escape(values[key]);
            }
            return txt;
        });
    };

const createDefaultOptions = (): IDbOptions => ({
    host: process.env.DB_HOST as string,
    database: process.env.DB_NAME as string,
    port: Number(process.env.DB_PORT as string),
    user: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
});

class DbConnection implements IDbConnector {
    readonly connection: mysql.Connection;
    readonly connected: Promise<boolean>;

    constructor(options: IDbOptions) {
        this.connection = mysql.createConnection(options);
        this.connection.config.queryFormat = createQueryFormatter(
            this.connection.escape.bind(this.connection),
        );
        this.connected = this.tryConnection();
    }

    private tryConnection(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            _logger.log('connecting...');
            this.connection.connect((e?: mysql.MysqlError) => {
                if (e) {
                    return reject(e);
                }
                _logger.log('connected');
                return resolve(true);
            });
        });
    }

    query(sql: string, props?: any): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, props, (e, results, fields) => {
                if (e) return reject(e);

                _logger.log('query', { sql, results, fields });
                return resolve(results);
            });
        });
    }

    disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (['connected', 'authenticated'].includes(this.connection.state)) {
                _logger.log('connection teardown');
                return this.connection.end((err) => err
                    ? reject(err)
                    : resolve()
                );
            }

            _logger.log('destroying connection');
            this.connection.destroy();
            return resolve();
        });
    }
}

const cache: { [dbName: string]: IDbConnector } = {};

const isServable = (cached: IDbConnector): boolean => {
    return (
        cached && ['authenticated', 'connected'].includes(cached.connection.state)
    );
};

export const createConnection = (options: IDbOptions, cached = true): IDbConnector => {
    const connection = new DbConnection(options);
    if (cached) {
        cache[options.database] = connection;
    }
    return connection;
};

export const getDatabase = (options: IDbOptions = createDefaultOptions()): IDbConnector => {
    const cached = cache[options.database];
    return isServable(cached)
        ? cached
        : createConnection(options);
};
