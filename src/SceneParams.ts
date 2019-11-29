import { Token } from './tokens';
import { Character } from './Character';
import { EventsBatch } from './EventsBatch';

export type SceneParams = {
    random100: number;
    tokens: Token[];
    chars: readonly Character[];
    events: EventsBatch;
};
