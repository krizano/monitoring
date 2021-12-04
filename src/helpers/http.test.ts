import { Mime, mimeType, serialize } from './http';

describe('Content helpers', () => {
    describe('mimeType()', () => {
        test.each([
            ['test', Mime.Text],
            [123, Mime.Text],
            [{ test: true }, Mime.Json],
            [null, Mime.Json],
        ])('should determine payload mime type', (payload: unknown, expectedType: Mime) => {
            expect(mimeType(payload)).toEqual(expectedType);
        });
    });

    describe('serialize()', () => {
        test.each([
            ['test', Mime.Text, 'test'],
            [123, Mime.Text, '123'],
            [{ test: true }, Mime.Json, {"test":true}],
            [null, Mime.Json, null],
        ])('should serialize payload based on mime type', (payload: unknown, type: Mime, expectedResult) => {
            expect(serialize(payload, type)).toStrictEqual(expectedResult);
        });
    });
});
