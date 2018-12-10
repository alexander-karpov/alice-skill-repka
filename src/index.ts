import * as _ from 'lodash';
import { startServer, WebhookRequest } from './server';
import { mainDialog } from './dialog';
import { spawnMystem } from './stemmer';
import { openLogFile, appendToLog, closeLogFile } from './logger';
import { SessionData, createSessionData } from './sessionData';

export function startSkillServer({ port, logsDir }: { port: number; logsDir: string }) {
    const { stemmer, killStemmer } = spawnMystem();
    const logFile = openLogFile(logsDir);
    const userData: { [sessionKey: string]: SessionData } = {};

    startServer(
        async request => {
            const random100 = _.random(100, false);
            const sessionKey = createSessionKey(request);

            // Очень много этих пингов
            if (!request.request.nlu.tokens.includes('ping')) {
                appendToLog(logFile, request.request.nlu.tokens.join(' '));
            }

            if (!userData[sessionKey]) {
                userData[sessionKey] = createSessionData();
            }

            const sessionData = userData[sessionKey];
            sessionData.isNewSession = request.session.new;

            const answer = await mainDialog(request.request.nlu.tokens, sessionData, {
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
                ? answer.buttons.map(title => {
                      return { title, hide: true };
                  })
                : undefined;

            const url = answer.url
                ? [
                      {
                          title: answer.url.text,
                          url: answer.url.url,
                          hide: true,
                      },
                  ]
                : undefined;

            return {
                response: {
                    text: answer.speech.text,
                    tts: answer.speech.tts,
                    card,
                    buttons: buttons || url,
                    end_session: answer.endSession,
                },
                session: request.session,
                version: request.version,
            };
        },
        () => {
            killStemmer();
            closeLogFile(logFile);
        },
        { port },
    );
}

function createSessionKey(request: WebhookRequest) {
    const sessionId = request.session.session_id;
    const userId = request.session.user_id;
    return `${userId}-${sessionId}`;
}
