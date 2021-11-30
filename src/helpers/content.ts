import { Mime } from './http';

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
