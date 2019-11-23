import axios from 'axios';
import { EventsBatch } from './EventsBatch';
import { Analytics } from './Analytics';

/**
 * Клиент логирования событий в https://amplitude.com
 */
export class ConsoleAnalytics implements Analytics {
    static create(): ConsoleAnalytics {
        return new ConsoleAnalytics();
    }

    sendEvents(events: EventsBatch) {
        if (events.events.length) {
            console.log(...events.events.map(e => e.toString()));
        }
    }
}
