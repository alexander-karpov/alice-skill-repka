import { WebhookRequest } from './server';
import { Session } from './Session';
import { EventProps } from './EventProps';

/**
 * Событие аналитики, счетчик
 * @see https://developers.amplitude.com/#http-api-v2-request-format
 */
export class Event {
    private readonly event_type: string;
    private readonly user_id: string;
    private readonly time: number;
    private readonly region: string;
    private readonly session_id: number;
    private readonly insert_id: string;
    private readonly event_properties: EventProps;
    private readonly user_properties: EventProps;

    constructor(
        eventType: string,
        time: number,
        request: WebhookRequest,
        session: Session,
        eventProps: EventProps,
        userProps: EventProps
    ) {
        this.event_type = eventType;
        this.time = time;
        this.user_id = request.session.user_id;
        this.region = request.meta.timezone;
        this.insert_id = `${eventType}${request.session.session_id}${request.session.message_id}`;
        this.event_properties = eventProps;
        this.user_properties = userProps;
        this.session_id = session.createdOn;
    }

    toString(): string {
        return `Event { ${this.event_type} }`;
    }
}
