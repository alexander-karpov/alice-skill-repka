import { DialogBuilder } from './DialogBuilder';
import { Precentation } from './Precentation';
import { ScreenContext } from './ScreenContext';

const QUESTIONS = [
    { q: 'Сколько планет в Солнечной системе?', a: '8' },
    { q: 'Сколько всего книг о Гарри Поттере?', a: '8' },
    { q: 'Сколько свечей было на торте у Малыша и Карлсона?', a: '8' },
];

type SceneId =
    | 'Start'
    | 'Greating'
    | 'Quit'
    | 'New Game'
    | 'Ask Question'
    | 'Right Answer'
    | 'Wrong Answer'
    | 'Next Level Or Finish'
    | 'Help'
    | 'Finish';

describe('withScene', () => {
    test('Добавляет представление', async () => {
        const repka = new DialogBuilder<{ score: number; level: number }, SceneId>();

        repka.withScene('Start').withInteraction(function() {
            return 'Greating';
        });

        repka
            .withScene('Greating')
            .withPresentation(({ say }) => {
                say('Это игра «Угадай ответ». Вы готовы начать?');
            })
            .withInteraction(function(command) {
                if (command === 'да') {
                    return 'New Game';
                }

                return 'Quit';
            });

        repka.withScene('Quit').withPresentation(({ say }) => {
            say('Ну всё, пока. Пока!');
        });

        repka
            .withScene('New Game')
            .withPresentation(function({ say }) {
                say('Отлично! Начинаем игру. И вот мой первый вопрос.');
            })
            .withTransition((state, setState) => {
                setState({ level: 0, score: 0 });

                return 'Ask Question';
            });

        repka
            .withScene('Ask Question')
            .withPresentation(({ say }, { level }) => {
                return say(QUESTIONS[level].q);
            })
            .withInteraction((commnd, { level, score }, setState) => {
                if (commnd === QUESTIONS[level].a) {
                    setState({ score: score + 1 });

                    return 'Right Answer';
                }

                return 'Wrong Answer';
            });

        repka
            .withScene('Right Answer')
            .withPresentation(({ say }, { score }) => {
                say('И это правильный ответ!', `Ваш счёт составляет ${score}`, 'Продолжаем игру?');
            })
            .withInteraction(command => {
                if (command === 'да') {
                    return 'Next Level Or Finish';
                }

                return 'Quit';
            });

        repka
            .withScene('Wrong Answer')
            .withPresentation(({ say }, { score }) => {
                say('Вы ошиблись');
            })
            .withTransition(() => {
                return 'Quit';
            });

        repka.withScene('Next Level Or Finish').withTransition((state, setState) => {
            if (state.level === QUESTIONS.length - 1) {
                return 'Finish';
            }

            setState({ level: state.level + 1 });
            return 'Ask Question';
        });

        repka
            .withScene('Finish')
            .withPresentation(({ say }, { score }) => {
                say(
                    'И это был последний вопрос нашей игры. Поздравляем!',
                    `Ваш счёт состаляет ${score}!`
                );
            })
            .withTransition(() => 'Quit');

        repka.withGlobalInteraction(command => {
            if (command === 'помощь') {
                return 'Help';
            }
        });

        repka
            .withScene('Help')
            .withPresentation(({ say }, { $previousScene }) => {
                say('Правила простые: отгадывай загадки и набирай очки.');

                if ($previousScene === 'Right Answer') {
                    say('Продолжаем игру?');
                }
            })
            .withTransition(function({ $previousScene }) {
                return $previousScene;
            });

        let context: ScreenContext<{ score: number; level: number }, SceneId> = {
            score: NaN,
            level: NaN,
            $currentScene: 'Start',
            $previousScene: 'Start',
        };

        let pr: Precentation;

        [pr, context] = repka.interact('', context);
        expect(pr.text).toEqual('Это игра «Угадай ответ». Вы готовы начать?');

        [pr, context] = repka.interact('да', context);
        expect(pr.text).toMatch('Отлично! Начинаем игру. И вот мой первый вопрос.');
        expect(pr.text).toMatch('Сколько планет в Солнечной системе?');

        [pr, context] = repka.interact('8', context);
        expect(pr.text).toEqual('И это правильный ответ! Ваш счёт составляет 1 Продолжаем игру?');

        [pr, context] = repka.interact('да', context);
        expect(pr.text).toEqual('Сколько всего книг о Гарри Поттере?');

        [pr, context] = repka.interact('8', context);
        expect(pr.text).toEqual('И это правильный ответ! Ваш счёт составляет 2 Продолжаем игру?');

        [pr, context] = repka.interact('помощь', context);
        expect(pr.text).toMatch('Правила простые: отгадывай загадки и набирай очки.');
        expect(pr.text).toMatch('Продолжаем игру?');

        [pr, context] = repka.interact('да', context);
        expect(pr.text).toEqual('Сколько свечей было на торте у Малыша и Карлсона?');

        [pr, context] = repka.interact('8', context);
        expect(pr.text).toEqual('И это правильный ответ! Ваш счёт составляет 3 Продолжаем игру?');

        [pr, context] = repka.interact('да', context);
        expect(pr.text).toMatch('И это был последний вопрос нашей игры. Поздравляем!');
        expect(pr.text).toMatch('Ну всё, пока. Пока!');
    });
});
