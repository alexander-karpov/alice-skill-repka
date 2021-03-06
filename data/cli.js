const readline = require('readline');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

/**
 * Выполняет запрошенную команду
 */
(async function main() {
    const commands = {
        'import-nouns': importNounsCommand,
        'print-anim': printAnimCommand,
        'build-endings': buildEndingsCommand,
        'build-rhymes': buildRhymesCommand,
        'print-inan-homonyms': buildInanHomonymsCommand,
        'print-nomn-accs': printNomnAccsCommand,
    };

    const commandName = process.argv[2];
    const command = commands[commandName];

    if (!command) {
        throw new Error(
            `Неизвестная команда ${commandName}. Я умею ${Object.keys(commands).join(', ')}.`
        );
    }

    return await command(...process.argv.slice(3));
})();

/**
 * Загружает существительные из опен-корпора
 */
async function importNounsCommand(openCorporaFilename, dictFilename) {
    const dict = [];

    let partOfSpeech = '';
    let аnimacy = '';
    let singleNomn = '';
    let singleAccs = '';
    let pluralNomn = '';
    let pluralAccs = '';

    function resetSlots() {
        partOfSpeech = '';
        аnimacy = '';
        singleNomn = '';
        singleAccs = '';
        pluralNomn = '';
        pluralAccs = '';
    }

    function saveWord() {
        if (!singleNomn) {
            return;
        }

        const basis = getBasis([singleNomn, singleAccs, pluralNomn, pluralAccs].filter(Boolean));
        const cutBasis = w => w.slice(basis.length, w.length);

        dict.push(
            `${partOfSpeech},${аnimacy},${basis},${cutBasis(singleNomn)},${cutBasis(
                singleAccs
            )},${cutBasis(pluralNomn)},${cutBasis(pluralAccs)}`
        );
    }

    await readLines(openCorporaFilename, line => {
        const [lemma, grs] = line.split('\t');

        if (isOcBeginOfWord(line)) {
            resetSlots();
            return;
        }

        if (isOcEndOfWord(line)) {
            saveWord();

            return;
        }

        // Не обрабатываем ничего кроме существилетльных
        if (!grs.includes('NOUN')) {
            return;
        }

        /**
         * Отбрасываем:
         * V- – формы ОЮ, ЕЮ…
         * Orgn – организации
         * Geox – гео-названия
         * Erro - ошибки
         */
        // 'V-' -  формы ОЮ, ЕЮ и прочее
        if (['V-', 'Orgn', 'Geox', 'Erro'].some(gr => grs.includes(gr))) {
            return;
        }

        /**
         * Не обрабатываем составные слова
         */
        if (lemma.includes('-')) {
            return;
        }

        if (grs.includes('sing') && grs.includes('nomn')) {
            singleNomn = normalizeWord(lemma);
            partOfSpeech = grs.charAt(0).toLowerCase();
            аnimacy = grs.includes('anim') ? 'a' : 'i';

            return;
        }

        if (grs.includes('sing') && grs.includes('accs')) {
            singleAccs = normalizeWord(lemma);
            return;
        }

        if (grs.includes('plur') && grs.includes('nomn')) {
            pluralNomn = normalizeWord(lemma);
            return;
        }

        if (grs.includes('plur') && grs.includes('accs')) {
            pluralAccs = normalizeWord(lemma);
            return;
        }
    });

    writeJson(dictFilename, dict);
}

/**
 * Печатает существительные для рифмования
 */
async function printAnimCommand(openCorporaFilename) {
    await readLines(openCorporaFilename, line => {
        if (isOcBeginOfWord(line) || isOcEndOfWord(line)) {
            return;
        }

        const [lemma, grs] = line.split('\t');

        // Не обрабатываем ничего кроме существилетльных
        if (!grs.includes('NOUN')) {
            return;
        }

        /**
         * Отбрасываем:
         * V- – формы ОЮ, ЕЮ…
         * Orgn – организации
         * Geox – гео-названия
         * Erro - ошибки
         * Patr - Отчество
         * Surn - Фамилия
         * Abbr - аббревиатура
         */
        // 'V-' -  формы ОЮ, ЕЮ и прочее
        if (['V-', 'Orgn', 'Geox', 'Erro', 'Abbr', 'Patr', 'Surn'].some(gr => grs.includes(gr))) {
            return;
        }

        /**
         * Не обрабатываем составные слова
         */
        if (lemma.includes('-')) {
            return;
        }

        if (grs.includes('nomn') && grs.includes('anim')) {
            console.log(lemma.toLowerCase());

            return;
        }
    });
}

/** Формирует фонетический словарь одушевленных */
async function buildEndingsCommand() {
    const dehomonymy = readJsom('./data/dehomonymy.json');
    const result = [];
    const recorded = {};

    await readLines('./data/anim.phon', line => {
        const [word, phon] = line.split('\t');
        const key = normalizeWord(word);

        if (word.split('`').length > 2 && !dehomonymy[word]) {
            console.warn(`Встретилось слово с неснятой омонимией: ${word}`);
        }

        if (!recorded[key]) {
            result.push(`${key},${getPhonEnding(dehomonymy[word] || phon)}`);
            recorded[key] = true;
        }
    });

    result.sort(dictSortCompare);

    writeJson('./src/endings.json', result);
}

/** Формирует словарь рифм. Индекс неодушевленных по окончанию. */
async function buildRhymesCommand() {
    const index = {};
    const result = [];

    const geo = await readTxt('./data/geo.txt');

    await readLines('./data/inan.phon', line => {
        const [word, phon] = line.split('\t');
        const key = getPhonEnding(phon);
        const normWord = normalizeWord(word);

        if (geo.includes(normWord)) {
            return;
        }

        index[key] = index[key] || [];
        index[key].push(normWord);
    });

    for (const key of Object.keys(index)) {
        result.push(`${key},${index[key].join(',')}`);
    }

    result.sort(dictSortCompare);

    writeJson('./src/rhymes.json', result);
}

async function buildInanHomonymsCommand() {
    const dehomonymy = readJsom('./data/dehomonymy.json');

    await readLines('./data/inan.phon', line => {
        const [word, phon] = line.split('\t');

        if (word.split('`').length > 2 && !dehomonymy[word]) {
            console.log(`"${word}":"${phon}",`);
        }
    });
}

/**
 * Печатает словарь склонений в вин.падеж одушевленных.
 * Исключает склонения '' -> 'а' и 'а' -> 'у'
 */
async function printNomnAccsCommand(openCorporaFilename, anim, masc) {
    if (!['anim', 'inan'].includes(anim)) {
        throw new Error(`Ожидаю второй параметр anim или inan. Получен ${anim}`);
    }

    if (masc && !['masc', 'femn'].includes(masc)) {
        throw new Error(`Ожидаю третий параметр anim или femn. Получен ${masc}`);
    }

    let nomn = '';
    let nomnGrs = '';
    let accs = '';
    let words = [];

    await readLines(openCorporaFilename, line => {
        const [lemma, grs] = line.split('\t');

        if (isOcBeginOfWord(line)) {
            nomn = '';
            nomnGrs = '';
            accs = '';

            return;
        }

        if (isOcEndOfWord(line)) {
            if (!(nomn && accs)) {
                return;
            }

            const basis = getBasis([nomn, accs]);
            const nomnEnding = nomn.slice(basis.length);
            const accsEnding = accs.slice(basis.length);

            const s = nomnGrs.includes('masc')
                ? 'm'
                : nomnGrs.includes('femn')
                ? 'f'
                : nomnGrs.includes('neut')
                ? 'n'
                : 'mf';

            words.push(`${s},${basis},${nomnEnding},${accsEnding}`);

            return;
        }

        if (lemma.includes('-')) {
            return;
        }

        if (!grs.includes('NOUN') || !grs.includes(anim)) {
            return;
        }

        if (masc && !grs.includes(masc)) {
            return;
        }

        if (grs.includes('sing') && grs.includes('nomn')) {
            nomn = normalizeWord(lemma);
            nomnGrs = grs;

            return;
        }

        if (grs.includes('sing') && grs.includes('accs')) {
            accs = normalizeWord(lemma);
            return;
        }
    });

    words.sort((a, b) => {
        const [as_, abasis, anomnEnding] = a.split(',');
        const [bs, bbasis, bnomnEnding] = b.split(',');

        if (as_ < bs) return -1;
        if (as_ > bs) return 1;

        const akey = `${abasis}${anomnEnding}`;
        const bkey = `${bbasis}${bnomnEnding}`;
        return akey === bkey ? 0 : akey > bkey ? 1 : -1;
    });

    // console.log(JSON.stringify(words, null, 2));

    let i = 0;

    for (let word of _.shuffle(words)) {
        i++;
        if (i % 1000 === 0) {
            console.log(`//`);
            console.log(`// ${i}`);
            console.log(`//`);
        }

        const [s, b, n, a] = word.split(',');

        if (s === 'f') {
            console.log(`expect(Morpher.animFemnNomnToAccs('${b + n}')).toBe('${b + a}');`);
        }
        if (s === 'm') {
            console.log(`expect(Morpher.animMascNomnToAccs('${b + n}')).toBe('${b + a}');`);
        }
        if (s === 'mf') {
            console.log(`expect(Morpher.animMascFemnNomnToAccs('${b + n}')).toBe('${b + a}');`);
        }
        if (s === 'n') {
            console.log(`expect(Morpher.animNeutNomnToAccs('${b + n}')).toBe('${b + a}');`);
        }
    }
}

/**
 * Читает файл построчно
 * @param {String} filename Пуль к файлу
 * @param {Function<String>} lineHandler Вызывается для каждой строки последовательно
 * @return {Promise<void>}
 */
function readLines(filename, lineHandler) {
    return new Promise(resolve => {
        const reander = readline.createInterface({
            input: fs.createReadStream(path.resolve(filename)),
        });

        reander.on('line', lineHandler);
        reander.on('close', resolve);
    });
}

/**
 * Читает json-файл
 * @param {String} filename Пуль к файлу
 * @return {Object}
 */
function readJsom(filename) {
    return JSON.parse(fs.readFileSync(path.resolve(filename)).toString('utf8'));
}

/**
 * Читает текстовый файл в массив строк
 * @param {String} filename Пуль к файлу
 * @return {String[]}
 */
async function readTxt(filename) {
    const lines = [];

    await readLines(filename, line => {
        lines.push(line);
    });

    return lines;
}

/**
 * Сохраняет объект в json-файл
 * @param {String} filename Пуль к файлу
 * @param {Щиоусе} object Сохраняемый в файл объект
 * @return {Object}
 */
function writeJson(filename, object) {
    fs.writeFileSync(path.resolve(filename), JSON.stringify(object, null, 2));
}

/**
 * Форматирует слово для словаря
 */
function normalizeWord(singleNomn) {
    return singleNomn
        .toLowerCase()
        .replace(/ё/gi, 'е')
        .replace(/`/gi, '');
}

/**
 * Ищет неизменяемую часть слова
 * @param {string[]} words массив слов
 * @returns {String}
 */
function getBasis(words) {
    if (!words || words.length < 2) {
        throw new Error('Массив слов не передан или содержит меньше двух элементов.');
    }

    const [first, ...rest] = words;
    let lemmaLength = first.length;

    while (!rest.every(w => w.startsWith(first.slice(0, lemmaLength)))) {
        lemmaLength--;
    }

    return first.slice(0, lemmaLength);
}

/**
 * Строка, начинающая новое слово в opencorpora
 * @param {string} line
 */
function isOcBeginOfWord(line) {
    return /^\d+$/.test(line);
}

/**
 * Строка, отделяющая предыдущее слово в opencorpora
 * @param {string} line
 */
function isOcEndOfWord(line) {
    return line.trim() === '';
}

/**
 * Возвращает "рифмующее" окончание слова
 * @param {string} phon формат phon
 */
function getPhonEnding(phon) {
    // Когда после ударения есть хотя бы два символа
    const baseCase = phon.match(/`..+/);

    if (baseCase) {
        return baseCase[0];
    }

    // В случае, если ударение падает на последнюю
    // букву, добавляем к окончанию предыдущую боку
    // Сов:`а -> окончание не «:`а», а «в:`а».
    const oneCharEnding = phon.match(/[а-я][^а-я]?(`.)/);

    if (oneCharEnding) {
        return oneCharEnding[0];
    }

    return phon;
}

/** Функция сравнения для сортировки словарей */
function dictSortCompare(a, b) {
    const aKey = a.slice(0, a.indexOf(','));
    const bKey = b.slice(0, b.indexOf(','));

    if (aKey < bKey) {
        return -1;
    }

    if (aKey > bKey) {
        return 1;
    }

    return 0;
}
