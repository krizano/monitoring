import { Server, Request, Response, Next } from 'restify';
import { RequestMethod } from '../helpers/http';

export interface ContextPlugin<T = unknown> {
    get<T1>(key: string): T & T1;
    set<T2>(key: string, value: T & T2): void;
}
export interface IRouteHandler {
    (req: Request & ContextPlugin, res: Response, next: Next): Promise<void>;
}

export type Route = {
    path: string;
    type: RequestMethod;
    handlers: IRouteHandler[];
};

export class RestController {
    constructor(
        readonly basePath: string,
        readonly routes: Route[] = [],
    ) {}

    registerRoutes (server: Server) {
        if (!this.routes.length) return;

        const methodMap = {
            [RequestMethod.Get]: server.get,
            [RequestMethod.Put]: server.put,
            [RequestMethod.Post]: server.post,
            [RequestMethod.Delete]: server.del,
            [RequestMethod.Options]: server.opts,
        };
        this.routes.forEach((route) => {
            const serverHandler = methodMap[route.type].bind(server);
            const routeHandlers = route.handlers.map((handler) => handler.bind(this));
            // @ts-expect-error
            serverHandler(this.appendPath(route.path), ...routeHandlers);
        });
    }

    private appendPath (path: string): string {
        // and remove trailing slash
        return `${this.basePath}${path}`.replace(/\/$/, '');
    }
}
