import { Request, Response, Next } from 'restify';
import { ContextPlugin } from '../controllers/controller';
import { createLogger } from '../helpers/logger';
import { Http, error } from '../helpers/http';
import { getUserManager } from '../database/user-manager';

const _logger = createLogger({
    prefix: 'auth',
    timestamp: true,
});

export const checkAuthorization = async (req: Request & ContextPlugin, res: Response, next: Next) => {
    const { authorization = null } = req.headers;

    if (!authorization) {
        return error(res, { status: Http.Unauthorized });
    }

    _logger.log({
        authorization,
        route: `${req.method} ${req.path()}`,
    });

    const user = await getUserManager().getByToken(authorization);

    if (user) {
        req.set('user', user);
        return next();
    }

    return error(res, { status: Http.Unauthorized });
}
