import { DtoFactory, Props, Required } from './dto';

export class UserDto {
    id: Required<string>;
    name: Required<string>;
    email: Required<string>;
    token: Required<string>;
}

export const createUserDto = (props: Props<UserDto>): UserDto => {
    return DtoFactory.create<UserDto>(UserDto, props);
}
