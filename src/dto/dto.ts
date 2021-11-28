export type Nullable<T> = T | null;

export type Required<T> = T;

export type Props<T> = Partial<T>;

export interface DtoConstructor<T> {
    new (): T;
}

export class DtoFactory {
    static create<T>(base: DtoConstructor<T>, props: Props<T>): T {
        return Object.assign(new base(), props);
    }
}
