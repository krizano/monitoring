import { Next, Request, Response } from "restify";
import { ContextPlugin, RestController, Route } from "./controller";
import { ok, RequestMethod } from "../helpers/http";
import { EndpointDto } from '../dto/endpoint.dto';
import { getResultManager } from '../database/result-manager';
import { validateEndpointExists } from '../middleware/validate-endpoint';
import { createLogger } from '../helpers/logger';

const _logger = createLogger({ prefix: 'ctrl:results' });

const getResults = async (req: Request & ContextPlugin, res: Response, next: Next) => {
    const { id: endpoint } = req.get<EndpointDto>('endpoint');
    const { limit } = req.query;
    const results = await getResultManager().getMany({
        endpoint,
        limit,
    });

    _logger.log('listing results for', {
        endpoint,
        results: results.length,
    });

    return ok(res, { payload: results });
};

const getSingleResult = async (req: Request & ContextPlugin, res: Response, next: Next) => {
    const endpoint = req.get<EndpointDto>('endpoint');
    const result = await getResultManager()
        .getLast(endpoint);

    _logger.log('last result for', {
        endpoint: endpoint.id,
        result,
    });

    return ok(res, { payload: result });
};

export default new RestController('/results', <Route[]>[
    {
        path: '/:id',
        type: RequestMethod.Get,
        handlers: [
            validateEndpointExists,
            getResults,
        ],
    },
    {
        path: '/:id/last',
        type: RequestMethod.Get,
        handlers: [
            validateEndpointExists,
            getSingleResult,
        ],
    },
]);
