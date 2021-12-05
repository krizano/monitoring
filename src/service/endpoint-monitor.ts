import { request } from 'undici';
import { EndpointManager, getEndpointManager } from '../database/endpoint-manager';
import { getResultManager, ResultManager } from '../database/result-manager';
import { EndpointDto } from '../dto/endpoint.dto';
import { createResultDto, ResultDto } from '../dto/result.dto';
import { UserDto } from 'dto/user.dto';
import { dt, uuid } from '../helpers/misc';
import { createLogger } from '../helpers/logger';

const _logger = createLogger({
    prefix: 'monitoring',
    timestamp: true,
});

type EndpointId = string;

class EndpointMonitoringService {
    readonly schedule;
    constructor(
        private readonly endpoints: EndpointManager,
        private readonly results: ResultManager,
    ) {
        this.schedule = new Map<EndpointId, NodeJS.Timer>();
    }

    /**
     * @param gap - ms between initial checks
     */
    init (gap = 25) {
        const { stream, pause, resume } = this.endpoints.getStream();

        stream.on('error', (e) => _logger.error(e.message));
        stream.on('result', (endpoint: EndpointDto) => {
            pause();
            this.startCheching(endpoint);
            setTimeout(() => resume(), gap);
        });
        stream.on('end', () => _logger.log('periodic checks scheduled:', this.schedule.size));
    }

    startCheching (endpoint: EndpointDto): void {
        if (this.schedule.has(endpoint.id)) {
            _logger.log('updating periodic check', {
                id: endpoint,
            });
            this.stopChecking(endpoint);
        }

        setImmediate(() => this.check(endpoint));

        this.schedule.set(endpoint.id, setInterval(
            () => this.check(endpoint),
            endpoint.period * 1000,
        ));

        _logger.log('periodic check scheduled for endpoint', {
            id: endpoint.id,
            url: endpoint.url,
            name: endpoint.name,
            period: endpoint.period,
        });
    }

    stopChecking (endpoint: Pick<EndpointDto, 'id'>): void {
        const { id } = endpoint;
        if (this.schedule.has(id)) {
            clearInterval(
                this.schedule.get(id) as NodeJS.Timer,
            );
            this.schedule.delete(id);

            _logger.log('stopped periodic check for endpoint', {
                id,
            });
        }
    }

    stop (): void {
        const checks = [...this.schedule.values()];

        checks.map(it => clearInterval(it));
        this.schedule.clear();

        _logger.log('stopped all checks:', checks.length);
    }

    private async check (endpoint: EndpointDto): Promise<void> {
        _logger.log('checking', {
            id: endpoint.id,
            url: endpoint.url,
        });

        const result = createResultDto({
            id: uuid(),
            checked: dt(),
            endpoint: endpoint.id,
        });

        try {
            const { statusCode, body } = await request(endpoint.url);
            const payload = await body.text();

            result.code = statusCode;
            result.payload = payload;
        } catch (e: any) {
            result.error = e.message || e;
        }

        try {
            await Promise.all([
                this.save(result),
                this.updateChecked(endpoint),
            ]);
        } catch (e: any) {
            _logger.error(e.message);
        }

        _logger.log('saved result', {
            endpoint: result.endpoint,
            kind: result.error ? 'fail' : 'success',
        });
    }

    private async save (result: ResultDto) {
        return this.results.create(result);
    }

    private async updateChecked (endpoint: EndpointDto) {
        return this.endpoints.update(
            { id: endpoint.id, checked: dt() },
            { id: endpoint.owner },
        );
    }
}

export default new EndpointMonitoringService(
    getEndpointManager({ id: '*' } as UserDto),
    getResultManager(),
);
