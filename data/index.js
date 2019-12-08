const nouns = require('./nouns.json');

const char = 'вну+чка';
const ending = getEnding(char);

for (let word of nouns) {
    if (word.endsWith(ending) && word !== char) {
        console.log(`Я ${char}. У меня есть ${word}.`);
    }
}

function getEnding(word) {
    return word.substr(word.indexOf('+') - 1);
}

// const fs = require('fs');

// const nouns = require('./nouns.json');
// let file = fs.readFileSync('./data/nouns.json').toString('utf8');

// const prepared = [];

// for (let word of nouns) {
//     // Находит латинские буквы (русские считаются не буквами)
//     if (/\w/.test(word)) {
//         console.log(word);
//     }

//     if (!/\+/.test(word)) {
//         console.log(word);
//         const fixedWord = word.replace(/([аяоёуюэеыи])/, '$1+');
//         file = file.replace(`"${word}"`, `"${fixedWord}"`);
//     }
// }

// fs.writeFileSync('./data/nouns.json', file);
