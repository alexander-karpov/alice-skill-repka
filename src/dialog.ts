import { Stemmer } from './Stemmer';
import { Session } from './Session';
import { Speech, speak } from './speech';
import * as intents from './intents';
import { SceneButton } from './SceneButton';
import { whoCalled2 } from './answers';
import { EventsBatch } from './EventsBatch';
import { Character } from './Character';
import { upperFirst } from './utils';
import { ScenarioResolver } from './ScenarioResolver';
import { ExpFlag } from './ExpFlag';

//#region types
export type DialogDependencies = {
    stemmer: Stemmer;
    random100: number;
};

export type DialogResult = {
    speech: Speech;
    imageId?: string;
    buttons: SceneButton[];
    endSession: boolean;
    session: Session;
    events: EventsBatch;
};
//#endregion

export async function mainDialog(
    command: string,
    session: Session,
    events: EventsBatch,
    { stemmer, random100 }: DialogDependencies
): Promise<DialogResult> {
    const tokens = await stemmer.analyze(command.toLowerCase());

    const char = session.findLastCharacter();

    if (intents.help(tokens)) {
        return {
            speech: speak(
                'В этой игре мы вместе сочиним сказку про репку.',
                'Называйте персонажей и слушайте получившуюся историю.',
                char ? whoCalled2(char) : ''
            ),
            endSession: false,
            buttons: [],
            session,
            events,
        };
    }

    const res = session.scenario.current({
        chars: session.currentCharacters,
        command,
        tokens,
        random100,
        events,
    });

    return {
        speech: res.speech,
        endSession: !!res.endSession,
        imageId: res.imageId,
        buttons: res.buttons || [],
        session: session.assign(res.scenario, res.chars),
        events: res.events,
    };
}
