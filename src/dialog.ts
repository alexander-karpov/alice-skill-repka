import { Stemmer } from './stemmer';
import { Session } from './Session';
import { Speech, speak } from './speech';
import * as intents from './intents';
import { SceneButton, scenes } from './scene';
import { whoCalled2 } from './answers';
import { Token } from './tokens';

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
};
//#endregion

export async function mainDialog(
    command: string,
    session: Session,
    { stemmer, random100 }: DialogDependencies,
): Promise<DialogResult> {
    const tokens = filterStopWords(await stemmer(command.toLowerCase()));

    const char = session.findLastCharacter();

    if (intents.help(tokens)) {
        return {
            speech: speak(
                'В этой игре мы вместе сочиним сказку про репку.',
                'Называйте персонажей и слушайте получившуюся историю.',
                char ? whoCalled2(char) : '',
            ),
            endSession: false,
            buttons: [],
            session,
        };
    }

    const res = scenes[session.currentScene]({
        chars: session.currentCharacters,
        tokens,
        random100,
    });

    return {
        speech: res.speech,
        endSession: !!res.endSession,
        imageId: res.imageId,
        buttons: res.buttons || [],
        session: session.assign(res.next, res.chars),
    };
}

/** Удаляет проблемные слова типа "и", "из", "в". */
function filterStopWords(tokens: Token[]): Token[] {
    const stopWords = ['и', 'с', 'в', 'из', 'под', 'на'];

    return tokens.filter(t => !stopWords.includes(t.text));
}
