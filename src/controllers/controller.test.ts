import { Next, Request, Response, Server } from 'restify';
import { ContextPlugin, IRouteHandler, RestController, Route } from './controller';
import { RequestMethod } from '../helpers/http';

describe('RestController', () => {
    it(`shouldn't do anything`, () => {
        const ctrl = new RestController('/testing', []);

        expect(ctrl.routes.length).toBe(0);
        expect(ctrl.basePath).toBe('/testing');

        const server: unknown = null;

        ctrl.registerRoutes(server as Server);
    });

    it('should register route', () => {
        const route = {
            type: RequestMethod.Get,
            path: '/',
            handlers: [],
        };
        const ctrl = new RestController('/testing', [
            route,
        ]);

        expect(ctrl.routes.length).toBe(1);
        expect(ctrl.routes[0]).toEqual(route);
    });

    it('should assign routes to the server', () => {
        const routes: Route[] = [];
        Object.values(RequestMethod).forEach((type) => {
            routes.push({
                type,
                path: '/t',
                handlers: [
                    async (req, res, next) => void 0,
                ],
            });
        });
        const ctrl = new RestController('/testing', routes);

        expect(ctrl.routes.length).toBe(routes.length);

        const serverMethods: jest.MockedFunction<any>[] = [];
        const server: unknown = Object.values(RequestMethod).reduce(
            (props, key) => {
                let serverKey: any = key.toLowerCase();
                if (key === 'DELETE') {
                    serverKey = 'del';
                }
                if (key === 'OPTIONS') {
                    serverKey = 'opts';
                }
                let mock = jest.fn();
                serverMethods.push(mock);
                return {
                    ...props,
                    [serverKey]: mock,
                }
            }, {});

        ctrl.registerRoutes(server as Server);

        serverMethods.forEach((mock) => expect(mock).toBeCalled());
    });
});
