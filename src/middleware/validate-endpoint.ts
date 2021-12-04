import { Next, Request, Response } from 'restify';
import { validate } from 'jsonschema';

import { createLogger } from '../helpers/logger';
import { Http, error} from '../helpers/http';
import { dt, uuid } from '../helpers/misc';
import { EndpointDto } from '../dto/endpoint.dto';
import { getEndpointManager } from '../database/endpoint-manager';
import { getResultManager } from '../database/result-manager';
import { ContextPlugin } from '../controllers/controller';

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
        ...data,
        id: req.params.id,

    };

    req.set('endpoint', endpoint);

    return next();
};

export const validateDeleteEndpoint = async (req: Request & ContextPlugin, res: Response, next: Next) => {
    const endpoint = req.get<EndpointDto>('endpoint');

    const result = await getResultManager().getLast(endpoint);
    if (result) {
        return error(res, {
            status: Http.BadReqest,
            payload: {
                error: `Endpoint id#${req.params.id} has associated results`,
            },
        });
    }

    return next();
};
