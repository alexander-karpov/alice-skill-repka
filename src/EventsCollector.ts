import { WebhookRequest } from './server';
import { Event } from './Event';
import { Session } from './Session';

/**
 * Накапливает в себе события разных типов (в одного запроса)
 */
export class EventsCollector {
    private constructor(
        private readonly time: number,
        private readonly request: WebhookRequest,
        private readonly session: Session,
        readonly events: readonly Event[]
    ) {}

    static create(time: number, request: WebhookRequest, session: Session): EventsCollector {
        return new EventsCollector(time, request, session, []);
    }

    withNewGame(): EventsCollector {
        return this.withEvent('New Game', {});
    }

    withCharacter(name: string): EventsCollector {
        return this.withEvent('Call Character', { name });
    }

    withThing(name: string): EventsCollector {
        return this.withEvent('Call Thing', { name });
    }

    private withEvent(eventType: string, eventProps: Readonly<Record<string, string>>): EventsCollector {
        return new EventsCollector(this.time, this.request, this.session, [
            ...this.events,
            new Event(eventType, this.time, this.request, this.session, eventProps)
        ]);
    }
}
