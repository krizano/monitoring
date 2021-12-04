import * as mysql from 'mysql';
import { createLogger } from '../helpers/logger';

export interface IDbConnector {
    readonly connection: mysql.Connection;
    query: (sql: string, props?: any) => Promise<any[]>;
    insert<T> (table: string, dto: T): Promise<T>;
    update<T> (table: string, dto: T): Promise<T>;
    delete<T> (table: string, dto: T): Promise<void>;
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

    constructor(options: IDbOptions) {
        this.connection = mysql.createConnection(options);
        this.connection.config.queryFormat = createQueryFormatter(
            this.connection.escape.bind(this.connection),
        );
    }

    query<T = any> (sql: string, props?: any): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, props, (e, results/*, fields*/) => {
                if (e) return reject(e);

                _logger.log('query', { sql, results/*, fields*/ });
                return resolve(results);
            });
        });
    }

    insert<T = any> (table: string, dto: T): Promise<T> {
        return new Promise((resolve, reject) => {
            this.query(
                `INSERT INTO ${table} (${this.mapKeys(dto)}) VALUES (${this.mapKeys(dto, ':')})`,
                this.mapProps(dto),
            )
                .then((results) => {
                    return resolve(dto);
                })
                .catch(reject);
        });
    }

    update<T = any> (table: string, dto: T): Promise<T> {
        return new Promise((resolve, reject) => {
            const { id, owner, ...data } = dto as any;
            this.query(
                `UPDATE ${table} SET ${this.mapSet(data)} WHERE id = :id AND owner = :owner`,
                this.mapProps(dto),
            )
            .then((results) => {
                return resolve(dto);
            })
            .catch(reject);
        });
    }

    delete<T = any> (table: string, dto: T): Promise<void> {
        return new Promise((resolve, reject) => {
            this.query(
                `DELETE FROM ${table} WHERE id = :id AND owner = :owner`,
                this.mapProps(dto),
            )
            .then((results) => {
                _logger.log('results', results);
                return resolve();
            })
            .catch(reject);
        });
    }

    disconnect (): Promise<void> {
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

    private mapKeys<T> (dto: T, prefix = ''): string {
        return Object.keys(dto)
            .map(k => `${prefix}${k}`)
            .join();
    }

    private mapProps<T> (dto: T): any {
        return Object.entries(dto).reduce((out, [key, val]) => ({
            ...out,
            [key]: this.sanitize(val),
        }), {});
    }

    private mapSet<T>(dto: T): string {
        return Object.keys(dto)
            .map(k => `${k}=:${k}`)
            .join();
    }

    private sanitize (val: any) {
        return (val === '') ? null : val;
    }
}

const _cache: { [dbName: string]: IDbConnector } = {};

const isServable = (cached: IDbConnector): boolean => {
    return (
        cached && ['authenticated', 'connected'].includes(cached.connection.state)
    );
};

export const createConnection = (options: IDbOptions, cached = false): IDbConnector => {
    const connection = new DbConnection(options);
    if (cached) {
        _cache[options.database] = connection;
    }
    return connection;
};

export const getDatabase = (options: IDbOptions = createDefaultOptions(), cached = true): IDbConnector => {
    return cached && isServable(_cache[options.database])
        ? _cache[options.database]
        : createConnection(options, cached);
};
