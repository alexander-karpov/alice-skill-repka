import { Gender } from './Gender';
import { Word } from './Word';

export class Character {
    static create(subject: Word, gender: Gender, normal: string, tts?: Word): Character {
        return new Character(subject, gender, normal, tts);
    }

    static dedka = Character.create(
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

    byGender<T>(male: T, famela: T, other: T) {
        if (this.gender === Gender.Male || this.gender === Gender.Unisex) {
            return male;
        }

        return this.gender === Gender.Famela ? famela : other;
    }

    byNormal<T>(cases: Record<string, T>): T | undefined {
        return cases[this.normal];
    }

    startsWith(...starts: string[]) {
        return starts.some(start => this.normal.startsWith(start));
    }

    equals(...aliases: string[]) {
        return aliases.some(alias => this.normal === alias);
    }

    private constructor(subject: Word, gender: Gender, normal: string, tts?: Word) {
        this.subject = subject;
        this.tts = tts;
        this.gender = gender;
        this.normal = normal;
    }

    private subject: Word;
    private tts?: Word;
    private gender: Gender;

    // Нормальная форма главного слова.
    // Помогает при определении, кто это.
    private normal: string;
}
