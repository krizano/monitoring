import {
    Props,
    DtoFactory,
    Required,
    Nullable,
} from './dto';

export class EndpointDto {
    id: Required<string>;
    name: Nullable<string>;
    url: Required<string>;
    created: Required<string>;
    checked: Nullable<string>;
    period: Required<number>;
    owner: Required<string>;
}

export const createEndpointDto = (props: Props<EndpointDto>): EndpointDto => {
    return DtoFactory.create<EndpointDto>(EndpointDto, props);
};
