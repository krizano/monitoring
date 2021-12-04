import { DtoFactory, Nullable, Props, Required } from './dto';

export class ResultDto {
    id: Required<string>;
    checked: Required<string>;
    code: Nullable<number>;
    payload: Nullable<string>;
    error: Nullable<string>;
    endpoint: Required<string>;
}

export const createResultDto = (props: Props<ResultDto>): ResultDto => {
    return DtoFactory.create<ResultDto>(ResultDto, props);
};
