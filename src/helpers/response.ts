import { Response } from 'restify';
import { mimeType, serialize } from './content';
import { Http, ResponseParams } from './http';

const sendResponse = (res: Response, status: Http, payload: unknown) => {
    const mime = mimeType(payload);

    res.status(status);
    res.setHeader('content-type', mime);
    res.send(serialize(payload, mime));
};

export const ok = (
    res: Response,
    params: ResponseParams = {},
) => {
    const { payload, status = Http.Ok } = params;
    sendResponse(res, status, payload);
};

export const error = (
    res: Response,
    params: ResponseParams = {},
) => {
    const { payload, status = Http.BadReqest } = params;
    sendResponse(res, status, payload);
};
