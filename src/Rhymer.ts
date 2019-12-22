import { binarySearch } from './binarySearch';
//@ts-ignore
import rhymes = require('./rhymes.json');
//@ts-ignore
import еndings = require('./endings.json');

export class Rhymer {
    /**
     * Возвращает случайную рифму для слова
     */
    findRhymes(word: string): string[] {
        const еndingRecord = binarySearch(еndings, record => {
            const key = record.slice(0, record.indexOf(','));
            return word === key ? 0 : key > word ? 1 : -1;
        });

        if (!еndingRecord) {
            return [];
        }

        const еnding = еndingRecord.slice(еndingRecord.indexOf(',') + 1);

        const rhymesRecord = binarySearch(rhymes, record => {
            const key = record.slice(0, record.indexOf(','));
            return еnding === key ? 0 : key > еnding ? 1 : -1;
        });

        if (!rhymesRecord) {
            return [];
        }

        const rs = rhymesRecord.split(',');
        // Удаляем ключ из вариантов
        rs.shift();

        // Удаляем само рифмуемое слово из вариантов
        if (rs.includes(word)) {
            rs.splice(rs.indexOf(word), 1);
        }

        return rs;
    }
}
