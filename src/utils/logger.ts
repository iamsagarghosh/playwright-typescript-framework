type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export class TestLogger {
  private readonly entries: string[] = [];

  constructor(private readonly testTitle: string) {}

  get hasEntries(): boolean {
    return this.entries.length > 0;
  }

  info(message: string): void {
    this.write('INFO', message);
  }

  warn(message: string): void {
    this.write('WARN', message);
  }

  error(message: string): void {
    this.write('ERROR', message);
  }

  toText(): string {
    return this.entries.join('\n');
  }

  private write(level: LogLevel, message: string): void {
    const entry = `${new Date().toISOString()} ${level} [${this.testTitle}] ${message}`;
    this.entries.push(entry);
    console.info(entry);
  }
}
