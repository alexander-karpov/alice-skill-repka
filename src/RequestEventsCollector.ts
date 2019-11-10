import { WebhookRequest } from './server';
import { Event } from './Event';
import { Session } from './Session';
import { EventsCollector } from './EventsCollector';

/**
 * Накапливает в себе события разных типов (в одного запроса)
 */
export class RequestEventsCollector implements EventsCollector {
    private constructor(
        private readonly time: number,
        private readonly request: WebhookRequest,
        private readonly session: Session,
        readonly events: readonly Event[],
    ) {}

    static create(time: number, request: WebhookRequest, session: Session): EventsCollector {
        return new RequestEventsCollector(time, request, session, []);
    }

    withNewGame(): EventsCollector {
        return this.withEvent('New Game', {});
    }

    private withEvent(
        eventType: string,
        eventProps: Readonly<Record<string, string>>,
    ): EventsCollector {
        return new RequestEventsCollector(this.time, this.request, this.session, [
            ...this.events,
            new Event(eventType, this.time, this.request, this.session, eventProps),
        ]);
    }
}
