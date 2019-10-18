import { random } from './utils';
import { startServer, WebhookRequest } from './server';
import { mainDialog } from './dialog';
import { spawnMystem } from './stemmer';
import { openLogFile, appendToLog, closeLogFile } from './logger';
import { SessionData, createSessionData } from './sessionData';

export function startSkillServer({ port, logsDir }: { port: number; logsDir: string }) {
    const { stemmer, killStemmer } = spawnMystem();
    const logFile = openLogFile(logsDir);
    const userData: { [name: string]: SessionData } = {};

    startServer(
        async request => {
            const random100 = random(100);
            const sessionKey = createSessionKey(request);

            if (!userData[sessionKey]) {
                userData[sessionKey] = createSessionData();
            }

            const sessionData = userData[sessionKey];
            sessionData.isNewSession = request.session.new;

            const answer = await mainDialog(request.request.command, sessionData, {
                stemmer,
                random100,
            });

            const card = answer.imageId
                ? {
                      type: 'BigImage',
                      image_id: answer.imageId,
                      description: answer.speech.text,
                  }
                : undefined;

            const buttons = answer.buttons
                ? answer.buttons.map(b => {
                      return {
                          title: b.text,
                          url: b.url,
                          hide: true,
                      };
                  })
                : undefined;

            const response = {
                response: {
                    text: answer.speech.text,
                    tts: answer.speech.tts,
                    card,
                    buttons,
                    end_session: answer.endSession,
                },
                session: request.session,
                version: request.version,
            };

            appendToLog(logFile, request, response, new Date());

            return response;
        },
        () => {
            killStemmer();
            closeLogFile(logFile);
        },
        { port },
    );
}

function createSessionKey(request: WebhookRequest) {
    return request.session.session_id;
}
