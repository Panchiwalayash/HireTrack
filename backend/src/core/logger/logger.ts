const LEVEL_LABEL = {
    log: 'LOG',
    warn: 'WARN',
    error: 'ERROR',
} as const;

type LogLevel = keyof typeof LEVEL_LABEL;

export class Logger {
    constructor(private readonly context: string) {}

    public log(message: string): void {
        this.write('log', message);
    }

    public warn(message: string): void {
        this.write('warn', message);
    }

    public error(message: string, error?: unknown): void {
        const detail = error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : '';
        this.write('error', detail ? `${message} :: ${detail}` : message);
    }

    private write(level: LogLevel, message: string): void {
        const line = `[${new Date().toISOString()}] [${LEVEL_LABEL[level]}] [${this.context}] ${message}`;
        console[level](line);
    }
}
