import { Event } from './Event';

/**
 * Интерфейс собирателя событий/счптчиков
 */
export type EventsCollector = {
    withNewGame(): EventsCollector;
    events: readonly Event[];
};
