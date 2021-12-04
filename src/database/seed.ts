// Seed script for database initialization
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { createConnection, IDbOptions, IDbConnector } from './connection';
import { UserDto, createUserDto } from '../dto/user.dto';
import { createLogger } from '../helpers/logger';

dotenv.config();

const _logger = createLogger({ prefix: 'seed' });

(async () => {
    const options: IDbOptions = {
        host: process.env.DB_HOST as string,
        database: process.env.DB_NAME as string,
        port: Number(process.env.DB_PORT as string),
        user: process.env.DB_USERNAME as string,
        password: process.env.DB_PASSWORD as string,
    };

    _logger.log('seeding database', options);

    const connector: IDbConnector = createConnection(options);
    try {
        await connector.query('SELECT 1');
    } catch (e: any) {
        _logger.error('Error:', e.message);
        _logger.info('is database server running?');
        return;
    }

    try {
        const dbName = connector.connection.escapeId(options.database);
        await connector.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        await connector.query(`USE ${dbName}`);

        _logger.log('database initialized');
    } catch (e) {
        _logger.error(e);
    }

    try {
        await connector.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY UNIQUE,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                token VARCHAR(36)
            )
        `);

        _logger.log('created table: users');
    } catch (e) {
        _logger.error('Error:', e);
    }

    const users: UserDto[] = [
        createUserDto({
            id: randomUUID(),
            name: 'Jablotron',
            email: 'info@jablotron.cz',
            token: '93f39e2f-80de-4033-99ee-249d92736a25',
        }),
        createUserDto({
            id: randomUUID(),
            name: 'Batman',
            email: 'batman@example.com',
            token: 'dcb20f8a-5657-4f1b-9f7f-ce65739b359e',
        }),
    ];
    try {
        // yo, connecting it to the test db?
        await connector.query('DELETE FROM users');

        await Promise.all(
            users.map(
                (user) => connector.query(`
                    INSERT INTO users (id, name, email, token)
                    VALUES (:id, :name, :email, :token)
                `, user),
            ),
        );

        const results = await connector.query('SELECT * FROM users');

        _logger.log('users imported', results.length, results);
    } catch (e) {
        _logger.error('Warning:', e);
    }

    try {
        await connector.query(`
            CREATE TABLE IF NOT EXISTS endpoints (
                id VARCHAR(36) PRIMARY KEY UNIQUE,
                name TEXT,
                url TEXT NOT NULL,
                created DATETIME NOT NULL,
                checked DATETIME,
                period INT NOT NULL,
                owner VARCHAR(36) NOT NULL,

                CONSTRAINT fk_user FOREIGN KEY (owner) REFERENCES users(id)
            )
        `);

        _logger.log('created table: endpoints');
    } catch (e) {
        _logger.error(e);
    }

    try {
        await connector.query(`
            CREATE TABLE IF NOT EXISTS results (
                id VARCHAR(36) PRIMARY KEY UNIQUE,
                checked DATETIME NOT NULL,
                code INT,
                payload TEXT,
                endpoint VARCHAR(36) NOT NULL,

                CONSTRAINT fk_endpoint FOREIGN KEY (endpoint) REFERENCES endpoints(id)
            )
        `);

        _logger.log('created table: results');
    } catch (e) {
        _logger.error(e);
    }

    await connector.disconnect();

    _logger.log('done');
})();
