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
