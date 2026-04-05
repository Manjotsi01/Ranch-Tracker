type Level = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const log = (level: Level, msg: string, ...args: unknown[]): void => {
  const ts    = new Date().toISOString();
  const extra = args.length
    ? ' ' + args.map(a => (a instanceof Error ? a.stack : String(a))).join(' ')
    : '';
  const line  = `[${level}] ${ts} — ${msg}${extra}`;
  if (level === 'ERROR') console.error(line);
  else if (level === 'WARN') console.warn(line);
  else console.log(line);
};

const logger = {
  info:  (msg: string, ...a: unknown[]) => log('INFO',  msg, ...a),
  warn:  (msg: string, ...a: unknown[]) => log('WARN',  msg, ...a),
  error: (msg: string, ...a: unknown[]) => log('ERROR', msg, ...a),
  debug: (msg: string, ...a: unknown[]) => log('DEBUG', msg, ...a),
};

export default logger;