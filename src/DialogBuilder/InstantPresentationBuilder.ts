import { PresentationBuilder } from './PresentationBuilder';
import { Precentation } from './Precentation';

export class InstantPresentationBuilder implements PresentationBuilder {
    private text: string = '';
    private tts: string = '';

    say = (...speechParts: string[]) => {
        for (const part of speechParts) {
            this.addSpace();

            this.text += part;
            this.tts += part;
        }
    };

    build = (): Precentation => {
        return {
            text: this.text,
            tts: this.tts,
        };
    };

    /**
     * Добавляет пробелы в конце text и tts
     * (нужно перед добавлением новой части)
     */
    private addSpace() {
        if (this.text && !this.text.endsWith(' ')) {
            this.text += ' ';
        }

        if (this.tts && !this.tts.endsWith(' ')) {
            this.tts += ' ';
        }
    }
}
