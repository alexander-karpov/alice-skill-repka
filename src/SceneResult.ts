import { Speech } from './speech';
import { Character } from './Character';
import { EventsBatch } from './EventsBatch';
import { Scene } from './Scenes';
import { SceneButton } from './SceneButton';

export type SceneResult = {
    speech: Speech;
    events: EventsBatch;
    chars?: readonly Character[];
    next?: Scene;
    endSession?: boolean;
    imageId?: string;
    buttons?: SceneButton[];
};
