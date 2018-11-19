import * as _ from 'lodash';
import { startServer, WebhookRequest } from './server';
import { mainDialog } from './dialog';
import { spawnMystem } from './stemmer';
import { SessionData, createSessionData } from './sessionData';

export function startSkillServer({ port }) {
    const { stemmer, killStemmer } = spawnMystem();
    const userData: { [sessionKey: string]: SessionData } = {};

    startServer(
        async request => {
            const random100 = _.random(100, false);
            const sessionKey = createSessionKey(request);

            if (!userData[sessionKey]) {
                userData[sessionKey] = createSessionData();
            }

            const sessionData = userData[sessionKey];
            const answer = await mainDialog(request.request.nlu.tokens, sessionData, {
                stemmer,
                random100
            });

            return {
                response: {
                    text: answer.text,
                    end_session: answer.endSession
                },
                session: request.session,
                version: request.version
            };
        },
        () => killStemmer(),
        { port }
    );
}

function createSessionKey(request: WebhookRequest) {
    const sessionId = request.session.session_id;
    const userId = request.session.user_id;
    return `${userId}-${sessionId}`;
}
