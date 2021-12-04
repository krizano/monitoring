import { getDatabase, IDbConnector } from './connection';
import { UserDto, createUserDto } from '../dto/user.dto';

export class UserManager {
    constructor(private readonly connector: IDbConnector) {}

    async getByToken (token: string): Promise<UserDto | null> {
        const [ result ] = await this.connector.query(
            `SELECT * FROM users WHERE token = :token`,
            { token },
        );

        return result
            ? createUserDto(result)
            : null;
    }
}

export const getUserManager = (): UserManager => {
    return new UserManager(getDatabase());
};
