import { getDatabase, IDbConnector } from './connection';
import { createResultDto, ResultDto } from '../dto/result.dto';
import { EndpointDto } from 'dto/endpoint.dto';

interface IResultFilter {
    endpoint: string;
    limit?: number;
}

export class ResultManager {
    constructor(
        private readonly connector: IDbConnector,
    ) {}

    async create (data: ResultDto): Promise<ResultDto> {
        return this.connector.insert<ResultDto>('results', data);
    }

    async getLast(endpoint: Pick<EndpointDto, 'id'>): Promise<ResultDto | null> {
        const [ result ] = await this.getMany({
            endpoint: endpoint.id,
            limit: 1,
        });

        return result
            ? createResultDto(result)
            : null;
    }

    async getMany(filter: IResultFilter): Promise<ResultDto[]> {
        const { endpoint, limit = 10 } = filter;
        const results = await this.connector.query(
            `SELECT * FROM results WHERE endpoint = :endpoint ORDER BY checked DESC LIMIT :limit`,
            { endpoint, limit },
        );

        return results.map(createResultDto);
    }
}

export const getResultManager = (): ResultManager => {
    return new ResultManager(getDatabase());
};
