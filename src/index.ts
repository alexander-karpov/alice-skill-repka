import { random } from './utils';
import { startServer } from './server';
import { mainDialog } from './dialog';
import { stemmer } from './stemmer';
import { SessionStorage } from './SessionStorage';

export function startSkillServer({ port }: { port: number }) {
    const sessions = SessionStorage.create();

    startServer(
        async request => {
            const random100 = random(100);

            const answer = await mainDialog(
                request.request.command,
                sessions.$ensureSession(request),
                {
                    stemmer,
                    random100,
                },
            );

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

            return response;
        },
        { port },
    );
}

startSkillServer({ port: 3000 });
