import axios from 'axios';
import { EventsCollector } from './EventsCollector';
import { Analytics } from './Analytics';

/**
 * Клиент логирования событий в https://amplitude.com
 */
export class AmplitudeAnalytics implements Analytics {
    private constructor(private readonly apiKey: string) {}

    static create(apiKey: string): AmplitudeAnalytics {
        return new AmplitudeAnalytics(apiKey);
    }

    sendEvents(events: EventsCollector) {
        axios
            .post('https://api.amplitude.com/2/httpapi', {
                api_key: this.apiKey,
                events: events.events,
            })
            .catch(function(error) {
                console.error(error);
            });
    }
}
