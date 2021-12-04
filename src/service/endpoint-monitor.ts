import { request } from 'undici';
import { EndpointDto } from '../dto/endpoint.dto';
import { EndpointManager } from '../database/endpoint-manager';
import { ResultManager } from '../database/result-manager';
import { createResultDto, ResultDto } from '../dto/result.dto';
import { createLogger } from '../helpers/logger';
import { dt, uuid } from '../helpers/misc';

const _logger = createLogger({
    prefix: 'monitoring',
    timestamp: true,
});

type EndpointId = string;

export class EndpointMonitoringService {
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
            return _logger.info('periodic check already scheduled for endpoint', {
                id: endpoint.id,
            });
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
        if (this.schedule.has(endpoint.id)) {
            clearInterval(
                this.schedule.get(endpoint.id) as NodeJS.Timer,
            );

            _logger.log('stopped periodic check for endpoint', {
                id: endpoint.id,
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
