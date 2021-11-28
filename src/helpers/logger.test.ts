import { createLogger, ILogger, LoggerFn } from './logger';

describe('Logger', () => {
    const loggerMethods: LoggerFn[] = ['log', 'info', 'error', 'debug'];

    it('should create default logger', () => {
        expect(createLogger()).toBeDefined();
    });

    it('should log messages using default logger', () => {
        const logger = createLogger();
        const spies = loggerMethods.map(
            (fn) => jest
                .spyOn(logger, fn)
                .mockImplementation(
                    (message: unknown) => expect(message).toEqual(fn),
                ),
        );

        loggerMethods.forEach((fn: LoggerFn) => logger[fn](fn));

        spies.forEach((spy) => expect(spy).toBeCalledTimes(1));
    });

    it('should log messages with prefix', () => {
        const testRegex = /^\[test\]$/;
        const spyLogger = loggerMethods.reduce((out, fn) => {
            return {
                ...out,
                [fn]: jest.fn().mockImplementation(
                    (prefix: string, message: string) => {
                        expect(testRegex.test(prefix)).toBe(true);
                        expect(message).toEqual(fn);
                    },
                ),
            };
        }, {});

        const logger = createLogger({ prefix: 'test', logger: spyLogger as ILogger });

        loggerMethods.forEach((fn: LoggerFn) => logger[fn](fn));
    });

    it('should log messages with timestamp', () => {
        const testRegex = /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]$/;
        const spyLogger = loggerMethods.reduce((out, fn) => {
            return {
                ...out,
                [fn]: jest.fn().mockImplementation(
                    (prefix: string, message: string) => {
                        expect(testRegex.test(prefix)).toBe(true);
                        expect(message).toEqual(fn);
                    },
                ),
            };
        }, {});

        const logger = createLogger({ timestamp: true, logger: spyLogger as ILogger });

        loggerMethods.forEach((fn: LoggerFn) => logger[fn](fn));
    });
});
