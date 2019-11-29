import { Speech } from './speech';
import { Character } from './Character';
import { EventsBatch } from './EventsBatch';
import { Scene } from './Scene';
import { SceneButton } from './SceneButton';
import { Scenario } from './Scenario';

export type SceneResult = {
    speech: Speech;
    events: EventsBatch;
    chars?: readonly Character[];
    next?: Scene;
    scenario: Scenario;
    endSession?: boolean;
    imageId?: string;
    buttons?: SceneButton[];
};
