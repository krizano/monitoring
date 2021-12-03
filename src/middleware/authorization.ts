import { Request, Response, Next } from 'restify';
import { createLogger } from '../helpers/logger';
import { Http, error } from '../helpers/http';
import { getUserManager } from '../database/user-manager';

const _logger = createLogger({
    prefix: 'auth',
    timestamp: true,
});

export const checkAuthorization = async (req: Request, res: Response, next: Next) => {
    const { authorization = null } = req.headers;

    if (!authorization) {
        return error(res, { status: Http.Unauthorized });
    }

    _logger.log(authorization);

    const user = await getUserManager().getByToken(authorization);

    if (user) {
        // @ts-expect-error
        req.set('user', user);
        // _logger.log('user', req.get('user'));
        return next();
    }

    return error(res, { status: Http.Unauthorized });
}
