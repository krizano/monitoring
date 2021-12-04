import { getDatabase, IDbConnector } from './connection';
import { UserDto } from '../dto/user.dto';
import { EndpointDto, createEndpointDto } from '../dto/endpoint.dto';

export class EndpointManager {
    constructor(
        private readonly connector: IDbConnector,
        readonly owner: UserDto,
    ) {}

    getStream(owner?: Pick<UserDto, 'id'>) {
        const oId = owner?.id ?? this.owner.id;
        const c = this.connector.connection;
        return {
            pause: c.pause.bind(c),
            resume: c.resume.bind(c),
            stream : c.query(
                `SELECT * FROM endpoints${
                    oId === '*' ? '' : ` WHERE owner = :owner`
                }`,
                { owner: oId },
            ),
        };
    }

    async getAll (): Promise<EndpointDto[]> {
        const results = await this.connector.query(
            `SELECT * FROM endpoints WHERE owner = :id`,
            { id: this.owner.id },
        );

        return results.map(createEndpointDto);
    }

    async getById (id: string): Promise<EndpointDto | null> {
        const [ result ] = await this.connector.query(
            `SELECT * FROM endpoints WHERE id = :id AND owner = :owner`,
            { id, owner: this.owner.id },
        );

        return result
            ? createEndpointDto(result)
            : null;
    }

    async create (data: EndpointDto): Promise<EndpointDto> {
        return this.connector.insert<EndpointDto>('endpoints', {
            ...data,
            owner: this.owner.id,
        });
    }

    async update (data: Partial<EndpointDto>, owner?: Pick<UserDto, 'id'>): Promise<EndpointDto> {
        return this.connector.update<any>('endpoints', {
            ...data,
            owner: owner?.id ?? this.owner.id,
        });
    }

    async delete (data: Pick<EndpointDto, 'id'>): Promise<void> {
        return this.connector.delete('endpoints', {
            id: data.id,
            owner: this.owner.id,
        });
    }
}

export const getEndpointManager = (owner: UserDto): EndpointManager => {
    return new EndpointManager(getDatabase(), owner);
};
