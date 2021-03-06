import { WebhookRequest } from './server';
import { Event } from './Event';
import { Session } from './Session';
import { EventProps } from './EventProps';
import { ExpFlag } from './ExpFlag';

/**
 * Накапливает в себе события разных типов
 * в ходе обработки одного запроса.
 */
export class EventsBatch {
    constructor(
        private readonly time: number,
        private readonly request: WebhookRequest,
        private readonly session: Session,
        private readonly experiments: ExpFlag[],
        readonly events: readonly Event[] = []
    ) {}

    addNewGame(): EventsBatch {
        return this.addEvent({ eventType: 'New Game', eventProps: {} });
    }

    addwin(eventProps: { charsCount: number }): EventsBatch {
        return this.addEvent({ eventType: 'Win', eventProps });
    }

    addCharacter(name: string): EventsBatch {
        return this.addEvent({ eventType: 'Call Character', eventProps: { name } });
    }

    addThing(name: string): EventsBatch {
        return this.addEvent({ eventType: 'Call Thing', eventProps: { name } });
    }

    addUnrecognized(): EventsBatch {
        return this.addEvent({ eventType: 'Unrecognized', eventProps: {} });
    }

    private addEvent({
        eventType,
        eventProps,
        userProps = {
            Experiments: this.experiments.map(ef => String(ef)),
        },
    }: {
        eventType: string;
        eventProps: EventProps;
        userProps?: EventProps;
    }): EventsBatch {
        if (!userProps.Experiments) {
            throw new Error('Забыл добавить Experiments в userProps');
        }

        return new EventsBatch(
            this.time,
            this.request,
            this.session,
            this.experiments,
            this.events.concat(
                new Event(
                    eventType,
                    this.time,
                    this.request,
                    this.session,
                    this.addDefaultEventProps(eventProps),
                    userProps
                )
            )
        );
    }

    private addDefaultEventProps(addingProps: EventProps): EventProps {
        return {
            $command: this.request.request.command,
            ...addingProps,
        };
    }
}
