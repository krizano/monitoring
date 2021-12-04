import { Request, Response } from 'restify';
import { ContextPlugin, RestController, Route } from './controller';
import { RequestMethod, ok, Http } from '../helpers/http';
import { createLogger } from '../helpers/logger';
import { getEndpointManager } from '../database/endpoint-manager';
import { UserDto } from '../dto/user.dto';
import { EndpointDto } from '../dto/endpoint.dto';
import {
    validateCreateEndpoint,
    validateDeleteEndpoint,
    validateEndpointExists,
    validateUpdateEndpoint,
} from '../middleware/validate-endpoint';

const _logger = createLogger({ prefix: 'ctrl:endpoint' });

// All endpoints owned by user
const getEndpoints = async (req: Request & ContextPlugin, res: Response) => {
    _logger.info('listing all endpoints');
    const {  } = req.query;
    const endpoints = await getEndpointManager(req.get<UserDto>('user'))
        .getAll();

    return ok(res, { payload: endpoints });
}

// Single record handlers
const getEndpoint = async (req: Request & ContextPlugin, res: Response) => {
    _logger.info('listing single record');
    return ok(res, {
        payload: req.get<EndpointDto>('endpoint'),
    });
}

const addEndpoint = async (req: Request & ContextPlugin, res: Response) => {
    _logger.info('creating record');
    const endpoint = await getEndpointManager(req.get<UserDto>('user'))
        .create(req.get<EndpointDto>('endpoint'));

    return ok(res, {
        status: Http.Created,
        payload: endpoint,
    });
};

const modEndpoint = async (req: Request & ContextPlugin, res: Response) => {
    _logger.info('updating record');
    const endpoint = await getEndpointManager(req.get<UserDto>('user'))
        .update(req.get<EndpointDto>('endpoint'));

    return ok(res, {
        status: Http.Created,
        payload: endpoint,
    });
};

const delEndpoint = async (req: Request & ContextPlugin, res: Response) => {
    _logger.info('removing record');
    await getEndpointManager(req.get<UserDto>('user'))
        .delete(req.get<EndpointDto>('endpoint'));

    ok(res, { status: Http.Deleted });
};

export default new RestController('/endpoint', <Route[]>[
    {
        path: '/',
        type: RequestMethod.Get,
        handlers: [
            getEndpoints,
        ],
    },
    {
        path: '/',
        type: RequestMethod.Post,
        handlers: [
            validateCreateEndpoint,
            addEndpoint,
        ],
    },
    {
        path: '/:id',
        type: RequestMethod.Get,
        handlers: [
            validateEndpointExists,
            getEndpoint,
        ],
    },
    {
        path: '/:id',
        type: RequestMethod.Put,
        handlers: [
            validateEndpointExists,
            validateUpdateEndpoint,
            modEndpoint,
        ],
    },
    {
        path: '/:id',
        type: RequestMethod.Delete,
        handlers: [
            validateEndpointExists,
            validateDeleteEndpoint,
            delEndpoint,
        ],
    },
]);
