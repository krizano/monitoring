import { Nullable, Required } from './dto';

export class ResultDto {
    id: Required<string>;
    checked: Required<string>;
    code: Nullable<number>;
    payload: Nullable<string>;
    endpoint: Required<string>;
}
