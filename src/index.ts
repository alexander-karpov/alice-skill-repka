import { random } from './utils';
import { startServer } from './server';
import { mainDialog } from './dialog';
import { SessionStorage } from './SessionStorage';
import { EventsBatch } from './EventsBatch';
import { AmplitudeAnalytics } from './AmplitudeAnalytics';
import { ConsoleAnalytics } from './ConsoleAnalytics';
import { Analytics } from './Analytics';
import { CachingStemmer } from './CachingStemmer';
import { MystemStemmer } from './MystemStemmer';
import { Experiments } from './Experiments';

export function startSkillServer({ port }: { port: number }) {
    const sessions = SessionStorage.create();
    const AMPLITUDE_REPKA_API_KEY = process.env.AMPLITUDE_REPKA_API_KEY;
    const analytics: Analytics = AMPLITUDE_REPKA_API_KEY
        ? AmplitudeAnalytics.create(AMPLITUDE_REPKA_API_KEY)
        : ConsoleAnalytics.create();

    startServer(
        async request => {
            if (
                request.request.command.includes('ping') ||
                request.request.original_utterance.includes('ping')
            ) {
                return {
                    response: {
                        text: 'pong',
                        end_session: true,
                    },
                    session: request.session,
                    version: request.version,
                };
            }

            const random100 = random(100);
            const time = new Date().getTime();
            const session = sessions.$ensureSession(time, request);
            const experiments = new Experiments().forUser(request.session.user_id);
            const events = new EventsBatch(time, request, session, experiments);

            const answer = await mainDialog(request.request.command, session, events, {
                stemmer: new CachingStemmer(new MystemStemmer()),
                random100,
            });

            sessions.$updateSession(request, answer.session);

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

            analytics.sendEvents(answer.events);

            return response;
        },
        { port }
    );
}

startSkillServer({ port: 3000 });
