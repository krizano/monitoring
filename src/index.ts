import * as dotenv from 'dotenv';
dotenv.config();

import restify, { Request, RequestHandlerType, Response } from 'restify';
import { checkAuthorization } from './middleware/authorization';
import { ok } from './helpers/http';
import { createLogger } from './helpers/logger';
import { UserDto } from './dto/user.dto';
import { getDatabase } from './database/connection';

import { getEndpointManager } from './database/endpoint-manager';
import { getResultManager } from './database/result-manager';

import endpointsCtrl from './controllers/endpoint-controller';
import resultsController from './controllers/results-controller';

import { EndpointMonitoringService } from './service/endpoint-monitor';

const { APP_PORT } = process.env;
const _logger = createLogger({ prefix: 'server', timestamp: true });

const monitoring = new EndpointMonitoringService(
    getEndpointManager({ id: '*' } as UserDto),
    getResultManager(),
);

const server = restify.createServer();

server.pre(restify.plugins.pre.context());
server.pre(checkAuthorization as RequestHandlerType);
server.use(restify.plugins.bodyParser());

server.get('/', (req: Request, res: Response) => {
    ok(res, { payload: 'Helou\n' });
});

endpointsCtrl.registerRoutes(server);
resultsController.registerRoutes(server);

server.listen(APP_PORT, () => {
    _logger.log(`started app at port ${APP_PORT}`);
    _logger.log('routes', server.getDebugInfo().routes.map((r: any) => ({
        path: `${r.method.toUpperCase()} ${r.path}`,
        handlers: r.handlers,
    })));
    _logger.log('srarting monitoring service');
    monitoring.init();
});

process.on('exit', (code) => {
    _logger.log('shutdown: monitoring');
    monitoring.stop();

    _logger.log('shutdown: server');
    server.close();

    _logger.log('shutdown: database');
    getDatabase().disconnect();
});
