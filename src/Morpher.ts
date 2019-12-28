import { binarySearch } from './binarySearch';

//@ts-ignore
const nomnToAccs: string[] = require('./nomnToAccs.json');

/**
 * Склонение слов по подежам (в винительный падеж)
 */
export class Morpher {
    static animMascNomnToAccs(nomn: string): string {
        return Morpher.animNomnToAccs(nomn, 'm');
    }
    static animFemnNomnToAccs(nomn: string): string {
        return Morpher.animNomnToAccs(nomn, 'f');
    }

    static animMascFemnNomnToAccs(nomn: string): string {
        return Morpher.animNomnToAccs(nomn, 'mf');
    }
    static animNeutNomnToAccs(nomn: string): string {
        return Morpher.animNomnToAccs(nomn, 'n');
    }
    private static animNomnToAccs(nomn: string, sex: 'm' | 'f' | 'mf' | 'n'): string {
        const dictRecord = binarySearch(nomnToAccs, record => {
            const [s, basis, nomnEnding] = record.split(',');

            if (s > sex) return 1;
            if (s < sex) return -1;

            const guess = `${basis}${nomnEnding}`;

            return nomn === guess ? 0 : guess > nomn ? 1 : -1;
        });

        if (dictRecord) {
            const [s, basis, nomnEnding, accsEnding] = dictRecord.split(',');
            return `${basis}${accsEnding}`;
        }

        // Саша -> сашу, маша -> машу
        if (nomn.endsWith('а')) {
            return `${nomn.slice(0, nomn.length - 1)}у`;
        }

        // Слон -> слона
        return `${nomn}а`;
    }
}
