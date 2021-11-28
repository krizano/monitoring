export type LoggerFn = 'log' | 'info' | 'error' | 'debug';

export type ILogger = {
    [fn in LoggerFn]: (...args: any[]) => void;
};

export interface ILoggerOptions {
    prefix?: string;
    timestamp?: boolean;
    logger?: ILogger;
}

const ts = () => new Date().toISOString();

export const createLogger = (options: ILoggerOptions = {}): ILogger => {
    const {
        logger = console,
        timestamp = false,
        prefix = null,
    } = options;

    const customLogger = { ...logger };
    const methods: LoggerFn[] = ['info', 'log', 'error', 'debug'];

    methods.forEach((fn) => {
        const extraParams: string[] = [];
        if (timestamp) {
            extraParams.push(`[${ts()}]`);
        }
        if (prefix) {
            extraParams.push(`[${prefix}]`);
        }
        let origFn = customLogger[fn].bind(customLogger);
        customLogger[fn] = (...args) => origFn(...extraParams, ...args);
    });

    return customLogger;
};
