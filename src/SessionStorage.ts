import { WebhookRequest } from './server';
import { Session } from './Session';
import * as LRU from 'lru-cache';
import { ScenarioResolver } from './ScenarioResolver';
import { ExperimentsResolver } from './ExperimentsResolver';

export class SessionStorage {
    private readonly sessions: LRU<string, Session> = new LRU<string, Session>({
        // Один час
        maxAge: 1000 * 60 * 60,
    });

    constructor(
        private readonly scenarioResolver: ScenarioResolver,
        private readonly experimentsResolver: ExperimentsResolver
    ) {}

    $ensureSession(time: number, request: WebhookRequest): Session {
        const sessionId = request.session.session_id;
        const existsSession = this.sessions.get(sessionId);

        if (existsSession) {
            return existsSession;
        }

        const exps = this.experimentsResolver.resolve(request.session.user_id);
        const scenario = this.scenarioResolver.resolve(exps);
        const newSession = new Session([], scenario, time);
        this.sessions.set(sessionId, newSession);
        this.sessions.prune();

        return newSession;
    }

    $updateSession(request: WebhookRequest, session: Session) {
        const sessionId = request.session.session_id;
        this.sessions.set(sessionId, session);
    }
}
