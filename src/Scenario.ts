import { SceneResult } from './SceneResult';
import { SceneParams } from './SceneParams';

export interface Scenario {
    intro(params: SceneParams): SceneResult;

    repka(params: SceneParams): SceneResult;

    repeatOffer(params: SceneParams): SceneResult;
}
