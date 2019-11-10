import { EventsCollector } from './EventsCollector';

/**
 * Абстрактный отправлятор аналитики/счетчиков
 */
export type Analytics = {
    sendEvents(events: EventsCollector): void;
};
