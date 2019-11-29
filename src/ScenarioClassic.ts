import { Scenario } from './Scenario';
import { SceneResult } from './SceneResult';
import * as answers from './answers';
import * as intents from './intents';
import { Character } from './Character';
import { SceneParams } from './SceneParams';
import { KnownChar, chooseKnownCharButtons, findKnownChar } from './knownChars';
import { last, cutText } from './utils';
import { speak, Speech } from './speech';
import { SceneButton } from './SceneButton';
import { extractChar, extractInanimate } from './extractChar';
import { Scene } from './Scene';
import { Token } from './tokens';

export class ScenarioClassic extends Scenario {
    private reactionButton = {
        text: '❤️ Поставить оценку',
        url: 'https://dialogs.yandex.ru/store/skills/916a8380-skazka-pro-repku',
    };

    create(scene: Scene): Scenario {
        return new ScenarioClassic(scene);
    }

    intro({ events }: SceneParams): SceneResult {
        return {
            speech: answers.intro(),
            chars: [Character.dedka],
            events: events.addNewGame(),
            scenario: this.create('repka'),
        };
    }

    repka({ chars, tokens, random100, events, command }: SceneParams): SceneResult {
        const currentChar = last(chars) as Character;
        const nextChar = this.recognizeCharacter(tokens);

        if (!nextChar) {
            const inanimate = this.recognizeThing(tokens);

            if (inanimate) {
                return {
                    speech: answers.inanimateCalled(inanimate, currentChar),
                    buttons: this.knownCharButtons(chars, random100),
                    events: events.addThing(inanimate.nominative),
                    scenario: this,
                };
            }

            return {
                speech: answers.wrongCommand(currentChar),
                buttons: this.knownCharButtons(chars, random100),
                events: events.addUnrecognized(command),
                scenario: this,
            };
        }

        const knownChar = findKnownChar(nextChar);
        const tale = this.makeRepkaTale(chars, nextChar, knownChar, random100);
        const isEnd = this.isTaleEnd(tale, nextChar);
        const end = isEnd ? answers.success() : answers.failure(nextChar);
        const taleWithEnd = speak(tale, end);
        const image = knownChar && knownChar.image;
        const buttons = this.makeButtons([...chars, nextChar], isEnd, random100);
        const cutTale = image
            ? speak([cutText(taleWithEnd.text, 254), cutText(taleWithEnd.tts, 1023)])
            : speak([cutText(taleWithEnd.text, 1023), cutText(taleWithEnd.tts, 1023)]);
        const scene = isEnd ? 'repeatOffer' : 'repka';

        const eventsWithChar = events.addCharacter(nextChar.nominative);
        const eventsWithWith = isEnd
            ? eventsWithChar.addwin({ charsCount: chars.length })
            : eventsWithChar;

        return {
            speech: cutTale,
            buttons,
            imageId: image,
            chars: chars.concat(nextChar),
            events: eventsWithWith,
            scenario: this.create(scene),
        };
    }

    repeatOffer({ tokens, events }: SceneParams): SceneResult {
        if (intents.notWantRepeat(tokens)) {
            return {
                speech: answers.endOfStory(),
                chars: [Character.dedka],
                endSession: true,
                buttons: [this.reactionButton],
                events,
                scenario: this.create('repka'),
            };
        }

        if (intents.wantsRepeat(tokens)) {
            return {
                speech: answers.storyBegin(),
                chars: [Character.dedka],
                events,
                scenario: this.create('repka'),
            };
        }

        return {
            speech: answers.yesOrNoExpected(),
            buttons: this.storyEndButtons(),
            events,
            scenario: this,
        };
    }

    protected recognizeCharacter(tokens: Token[]): Character | undefined {
        return extractChar(tokens);
    }

    protected recognizeThing(tokens: Token[]): Character | undefined {
        return extractInanimate(tokens);
    }

    private makeRepkaTale(
        chars: readonly Character[],
        char: Character,
        knownChar: KnownChar | undefined,
        random100: number
    ) {
        const allChars = chars.concat(char);
        const previousChar = last(chars) as Character;
        const chain = answers.formatStory(allChars);
        const knownAnswer = knownChar ? knownChar.answer(char, previousChar, random100) : speak();

        return speak(knownAnswer, chain);
    }

    private isTaleEnd(tale: Speech, nextChar: Character) {
        const taleLength = Math.max(tale.text.length, tale.tts.length);

        const isLastMouse = nextChar.startsWith('мыш');
        /**  Максимальная длинна text и tts - 1024 */
        const isTaleTooLong = taleLength >= 800;

        return isLastMouse || isTaleTooLong;
    }

    private makeButtons(
        chars: readonly Character[],
        isEnd: boolean,
        random100: number
    ): SceneButton[] {
        // Дадим ребенку сначала понять, что можно
        // самому придумывать персонажей.
        if (chars.length < 4) {
            return [];
        }

        if (isEnd) {
            return this.storyEndButtons();
        }

        return this.knownCharButtons(chars, random100);
    }

    private knownCharButtons(chars: readonly Character[], random100: number): SceneButton[] {
        return chooseKnownCharButtons(chars, random100).map(text => ({ text }));
    }

    private storyEndButtons(): SceneButton[] {
        return [{ text: 'Да' }, { text: 'Нет' }, this.reactionButton];
    }
}
