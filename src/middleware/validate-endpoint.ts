import { Next, Request, Response } from 'restify';
import { validate } from 'jsonschema';

import { createLogger } from '../helpers/logger';
import { Http, error} from '../helpers/http';
import { dt, uuid } from '../helpers/misc';
import { getEndpointManager } from '../database/endpoint-manager';
import { ContextPlugin } from '../controllers/controller';
import { EndpointDto } from '../dto/endpoint.dto';

const _logger = createLogger({ prefix: 'validation:endpoint' });

export const validateEndpointExists = async (req: Request & ContextPlugin, res: Response, next: Next) => {
    const endpoint = await getEndpointManager(req.get('user'))
        .getById(req.params.id);

    if (!endpoint) {
        return error(res, {
            status: Http.NotFound,
            payload: {
                error: `No such endpoint id#${req.params.id}`,
            },
        });
    }

    req.set('endpoint', endpoint);

    return next();
};

export const validateCreateEndpoint = async (req: Request & ContextPlugin, res: Response, next: Next) => {
    const data = req.body as Pick<EndpointDto, 'id' | 'name' | 'period' | 'url'>;
    const { valid, errors } = validate(data, {
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            url: {
                type: 'string',
                // ip regex: '(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$)', 'gm'
                pattern: '^https?.*',
            },
            period: {
                type: 'number',
                minimum: 5,
            },
        },
        required: ['url', 'period'],
        additionalProperties: false,
    });

    if (!valid) {
        return error(res, { payload: {
            errors,
        }});
    }

    const endpoint: Partial<EndpointDto> = {
        ...data,
        id: data.id ?? uuid(),
        created: dt(),
    };

    req.set('endpoint', endpoint);

    return next();
};

export const validateUpdateEndpoint = async (req: Request & ContextPlugin, res: Response, next: Next) => {
    const data = req.body as Pick<EndpointDto, 'name' | 'period'>;
    const { valid, errors } = validate(data, {
        type: 'object',
        properties: {
            name: {
                type: 'string',
            },
            period: {
                type: 'number',
                minimum: 5,
            },
        },
        additionalProperties: false,
    });

    if (!valid) {
        return error(res, { payload: {
            errors,
        }});
    }
    if (!Object.keys(data).length) {
        return error(res, { payload: {
            error: 'Nothing to update: empty request body',
        }});
    }

    const endpoint: Partial<EndpointDto> = {
        id: req.params.id,
        ...data,
    };

    req.set('endpoint', endpoint);

    return next();
};

export const validateDeleteEndpoint = async (req: Request & ContextPlugin, res: Response, next: Next) => {
    const endpoint = await getEndpointManager(req.get('user'))
        .getById(req.params.id);

    if (!endpoint) {
        return error(res, {
            status: Http.NotFound,
            payload: {
                error: `No such endpoint id#${req.params.id}`,
            },
        });
    }

    // todo
    // const results = await getResultsManager()
    // if (results.length) {
    //     return error(res, {
    //         status: Http.BadReqest,
    //         payload: {
    //             error: `Endpoint id#${req.params.id} has associated results`,
    //         },
    //     });
    // }

    req.set('endpoint', endpoint);

    return next();
};
