import * as fs from 'fs';
import * as path from 'path';

export function openLogFile(logsDir: string): number {
    return fs.openSync(path.join(logsDir, `./log.txt`), 'a');
}

export function appendToLog(fd: number, record: string) {
    fs.appendFile(fd, JSON.stringify(record) + '\n', error => {
        if (error) {
            console.log(error);
        }
    });
}

export function closeLogFile(fd: number) {
    fs.closeSync(fd);
}
