import * as dotenv from 'dotenv';
dotenv.config();

import restify, { Request, Response } from 'restify';
import { checkAuthorization } from './middleware/authorization';
// import endpointsCtrl from './controllers/endpoint-controler';
import { ok } from './helpers/response';
import { createLogger } from './helpers/logger';


const { APP_PORT } = process.env;
const _logger = createLogger({ prefix: 'server', timestamp: true });

const server = restify.createServer();

server.pre(restify.plugins.pre.context());
server.pre(checkAuthorization);
server.use(restify.plugins.bodyParser());

server.get('/', (req: Request, res: Response) => {
    ok(res, { payload: 'Helou\n' });
});

// endpointsCtrl.registerRoutes(server);

server.listen(APP_PORT, () => {
    _logger.log(`started app at port ${APP_PORT}`);
    _logger.log(server.getDebugInfo().routes);
});
