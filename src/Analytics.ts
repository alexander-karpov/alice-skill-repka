import { EventsBatch } from './EventsBatch';

/**
 * Абстрактный отправлятор аналитики/счетчиков
 */
export interface Analytics {
    sendEvents(events: EventsBatch): void;
}
