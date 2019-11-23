import { WebhookRequest } from './server';
import { Event } from './Event';
import { Session } from './Session';
import { Experiments } from './Experiments';

/**
 * Накапливает в себе события разных типов
 * в ходе обработки одного запроса.
 */
export class EventsBatch {
    constructor(
        private readonly time: number,
        private readonly request: WebhookRequest,
        private readonly session: Session,
        private readonly experiments: string[],
        readonly events: readonly Event[] = []
    ) {}

    withNewGame(): EventsBatch {
        return this.withEvent('New Game', {});
    }

    withCharacter(name: string): EventsBatch {
        return this.withEvent('Call Character', { name });
    }

    withThing(name: string): EventsBatch {
        return this.withEvent('Call Thing', { name });
    }

    private withEvent(
        eventType: string,
        eventProps: Readonly<Record<string, string | string[]>>,
        userProps: Readonly<Record<string, string | string[]>> = { Experiments: this.experiments }
    ): EventsBatch {
        if (!userProps.Experiments) {
            throw new Error('Забыл добавить Experiments в userProps');
        }

        return new EventsBatch(
            this.time,
            this.request,
            this.session,
            this.experiments,
            this.events.concat(
                new Event(eventType, this.time, this.request, this.session, eventProps, userProps)
            )
        );
    }
}
