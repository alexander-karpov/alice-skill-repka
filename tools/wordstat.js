const fs = require('fs');
const _ = require('lodash');
const readline = require('readline');
const { logsUrl } = require('./secret.json');
const { spawnMystem } = require('./stemmer');

async function printStats(records) {
    const { stemmer, killStemmer } = spawnMystem();

    const counters = {};
    let i = 0;
    for (let word of records) {
        i++;
        if (i % 100 === 0) {
            console.log(Math.floor((i / records.length) * 100));
        }

        const lemmas = await stemmer(word);
        const clear = lemmas.replace(/{|}/g, '');

        if (!counters[clear]) {
            counters[clear] = 1;
        } else {
            counters[clear] += 1;
        }
    }

    killStemmer();

    const mapped = Object.keys(counters).map(key => ({ word: key, count: counters[key] }));

    const stat =
        _.sortBy(mapped.filter(w => w.count >= 10), o => -o.count)
            .map(r => `${r.word} ${r.count}`)
            .join('\n') + '\n';

    fs.writeFileSync('./wordstat.txt', stat);
}

var lineReader = readline.createInterface({
    input: fs.createReadStream('/Users/kukuruku/Documents/logs/repka/all.txt'),
});

let prevIsDate = false;
const messages = [];
lineReader.on('line', function(line) {
    if (prevIsDate && line) {
        messages.push(line);
    }

    prevIsDate = line.includes('mo ');
});

lineReader.on('close', function() {
    printStats(messages);
});
