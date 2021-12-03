import { Response } from 'restify';

export enum Http {
    'Ok' = 200,
    'Created' = 201,
    'BadReqest' = 400,
    'Unauthorized' = 403,
    'NotFound' = 404,
    'Internal' = 500,
};

export enum Mime {
    'Text' = 'text/plain',
    'Json' = 'application/json',
};

export type ResponseParams = {
    status?: Http;
    payload?: unknown;
};

export enum RequestMethod {
    Get = 'GET',
    Post = 'POST',
    Put = 'PUT',
    Delete = 'DELETE',
    Options = 'OPTIONS',
}

// content helpers

export const mimeType = (payload: unknown): Mime => {
    if (['string', 'number'].includes(typeof payload)) {
        return Mime.Text;
    }
    return Mime.Json;
}

export const serialize = (payload: unknown, type: Mime): string => {
    switch (type) {
        case Mime.Text:
            return `${payload}`;
        case Mime.Json:
            return JSON.stringify(payload);
    }
};

// response helpers

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
