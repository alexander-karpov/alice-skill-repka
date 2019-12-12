const path = require('path');

printMem();

(function run() {
    const dict = require(path.resolve('./data/animEndings.json'));
    printMem();
})();

function printMem() {
    try {
        if (global.gc) {
            global.gc();
        }
    } catch (e) {
        console.log('`node --expose-gc index.js`');
        process.exit();
    }

    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
}
