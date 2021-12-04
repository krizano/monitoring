import { Request, Response } from 'restify';
import { ContextPlugin } from '../controllers/controller';
import { EndpointDto } from '../dto/endpoint.dto';
import * as httpModule from '../helpers/http'
import * as managerModule from '../database/endpoint-manager';
import { validateEndpointExists } from './validate-endpoint';

const reqMock = {
    set: (key: string, val: any) => void 0,
    get: (key: string) => ({
        id: 'id',
    }),
    params: {
        id: 'endpoint-id',
    },
} as Request & ContextPlugin;

const resMock = {
    status: (code: number) => code,
    header: (key: string, val: any) => this,
    send: (payload: any) => this,
    json: (payload: any) => this,
} as Response;

const next = jest.fn();

describe('Endpoint validations', () => {
    beforeEach(jest.clearAllMocks);

    describe('validateEndpointExists', () => {
        it('should update context and call next()', async () => {
            const setEndpointSpy = jest.spyOn(reqMock, 'set');
            const getEndpointSpy = jest.spyOn(managerModule, 'getEndpointManager')
                .mockImplementation((owner) => ({
                    getById: async (id) => ({
                        id: 'endpoint-id',
                    } as EndpointDto),
                } as managerModule.EndpointManager));

            await validateEndpointExists(
                reqMock,
                resMock,
                next,
            );

            expect(getEndpointSpy).toBeCalled();
            expect(setEndpointSpy).toBeCalledWith('endpoint', {
                id: 'endpoint-id',
            });
            expect(next).toBeCalled();
        });

        it('should call error()', async () => {
            const errorSpy = jest.spyOn(httpModule, 'error');
            const getEndpointSpy = jest.spyOn(managerModule, 'getEndpointManager')
                .mockImplementation((owner) => ({
                    getById: async (id) => null,
                } as managerModule.EndpointManager));

            await validateEndpointExists(
                reqMock,
                resMock,
                next,
            );

            expect(getEndpointSpy).toBeCalled();
            expect(errorSpy).toBeCalledWith(resMock, {
                status: 404,
                payload: {
                    error: `No such endpoint id#endpoint-id`,
                },
            });
            expect(next).not.toBeCalled();
        });
    });

    // describe('validateCreateEndpoint', () => {

    // });

    // describe('validateUpdateEndpoint', () => {

    // });

    // describe('validateDeleteEndpoint', () => {

    // });
})