import { Gender } from './Gender';
import { Word } from './Word';
import { CharacterType } from './CharacterType';

export class Character {
    constructor(
        public type: CharacterType,
        private subject: Word,
        private gender: Gender,
        // Нормальная форма главного слова.
        // Помогает при определении, кто это.
        public normal: string,
        private tts?: Word
    ) {}

    static dedka = new Character(
        CharacterType.Сreature,
        { nominative: 'дедка', accusative: 'дедку' },
        Gender.Male,
        'дедка'
    );

    get nominative(): string {
        return this.subject.nominative;
    }

    get accusative(): string {
        return this.subject.accusative;
    }

    get nominativeTts(): string {
        return this.tts ? this.tts.nominative : this.subject.nominative;
    }

    get accusativeTts(): string {
        return this.tts ? this.tts.accusative : this.subject.accusative;
    }

    get isThing(): boolean {
        return this.type === CharacterType.Thing;
    }

    get lastLetter(): string {
        return this.normal.charAt(this.normal.length - 1).toLowerCase();
    }

    byGender<T>(male: T, famela: T, other: T) {
        if (this.gender === Gender.Male || this.gender === Gender.Unisex) {
            return male;
        }

        return this.gender === Gender.Famela ? famela : other;
    }

    startsWith(...starts: string[]) {
        return starts.some(start => this.normal.startsWith(start));
    }

    equals(...aliases: string[]) {
        return aliases.some(alias => this.normal === alias);
    }
}
