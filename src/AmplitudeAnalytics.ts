import axios from 'axios';
import { EventsBatch } from './EventsBatch';
import { Analytics } from './Analytics';

/**
 * Клиент логирования событий в https://amplitude.com
 */
export class AmplitudeAnalytics implements Analytics {
    private constructor(private readonly apiKey: string) {}

    static create(apiKey: string): AmplitudeAnalytics {
        return new AmplitudeAnalytics(apiKey);
    }

    sendEvents(events: EventsBatch) {
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
