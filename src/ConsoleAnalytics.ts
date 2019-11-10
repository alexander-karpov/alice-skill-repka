import axios from 'axios';
import { EventsCollector } from './EventsCollector';
import { Analytics } from './Analytics';

/**
 * Клиент логирования событий в https://amplitude.com
 */
export class ConsoleAnalytics implements Analytics {
    static create(): ConsoleAnalytics {
        return new ConsoleAnalytics();
    }

    sendEvents(events: EventsCollector) {
        if (events.events.length) {
            console.log(...events.events.map(e => e.toString()));
        }
    }
}
