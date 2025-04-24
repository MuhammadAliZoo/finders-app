declare module 'http' {
  import { EventEmitter } from 'events';
  import { Socket } from 'net';
  import { Readable, Writable } from 'stream';

  export interface IncomingHttpHeaders {
    [key: string]: string | string[] | undefined;
  }

  export interface OutgoingHttpHeaders {
    [key: string]: string | string[] | number | undefined;
  }

  export interface ClientRequestArgs {
    protocol?: string;
    host?: string;
    hostname?: string;
    family?: number;
    port?: number | string;
    defaultPort?: number | string;
    localAddress?: string;
    socketPath?: string;
    method?: string;
    path?: string;
    headers?: OutgoingHttpHeaders;
    auth?: string;
    agent?: Agent | boolean;
    timeout?: number;
    setHost?: boolean;
  }

  export class IncomingMessage extends Readable {
    constructor(socket: Socket);
    aborted: boolean;
    httpVersion: string;
    httpVersionMajor: number;
    httpVersionMinor: number;
    complete: boolean;
    headers: IncomingHttpHeaders;
    rawHeaders: string[];
    trailers: { [key: string]: string | undefined };
    rawTrailers: string[];
    setTimeout(msecs: number, callback?: () => void): this;
    method?: string;
    url?: string;
    statusCode?: number;
    statusMessage?: string;
    socket: Socket;
    destroy(error?: Error): void;
  }

  export class ServerResponse extends Writable {
    statusCode: number;
    statusMessage: string;
    sendDate: boolean;
    finished: boolean;
    headersSent: boolean;
    constructor(req: IncomingMessage);
    assignSocket(socket: Socket): void;
    detachSocket(socket: Socket): void;
    writeContinue(callback?: () => void): void;
    writeHead(statusCode: number, reasonPhrase?: string, headers?: OutgoingHttpHeaders): this;
    writeHead(statusCode: number, headers?: OutgoingHttpHeaders): this;
    setTimeout(msecs: number, callback?: () => void): this;
    setHeader(name: string, value: number | string | string[]): void;
    getHeader(name: string): number | string | string[] | undefined;
    getHeaders(): OutgoingHttpHeaders;
    getHeaderNames(): string[];
    hasHeader(name: string): boolean;
    removeHeader(name: string): void;
    addTrailers(headers: OutgoingHttpHeaders): void;
    flushHeaders(): void;
  }

  export class ClientRequest extends Writable {
    constructor(url: string | URL | ClientRequestArgs, cb?: (res: IncomingMessage) => void);
    aborted: boolean;
    host: string;
    protocol: string;
    method: string;
    path: string;
    abort(): void;
    onSocket(socket: Socket): void;
    setTimeout(timeout: number, callback?: () => void): this;
    setNoDelay(noDelay?: boolean): void;
    setSocketKeepAlive(enable?: boolean, initialDelay?: number): void;
  }

  export class Agent extends EventEmitter {
    maxFreeSockets: number;
    maxSockets: number;
    maxTotalSockets: number;
    constructor(opts?: AgentOptions);
    destroy(): void;
  }

  export interface AgentOptions {
    keepAlive?: boolean;
    keepAliveMsecs?: number;
    maxSockets?: number;
    maxFreeSockets?: number;
    timeout?: number;
  }

  export class Server extends EventEmitter {
    constructor(requestListener?: (req: IncomingMessage, res: ServerResponse) => void);
    constructor(options: { IncomingMessage?: typeof IncomingMessage, ServerResponse?: typeof ServerResponse }, requestListener?: (req: IncomingMessage, res: ServerResponse) => void);
    listen(port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): this;
    listen(port?: number, hostname?: string, listeningListener?: () => void): this;
    listen(port?: number, backlog?: number, listeningListener?: () => void): this;
    listen(port?: number, listeningListener?: () => void): this;
    listen(path: string, backlog?: number, listeningListener?: () => void): this;
    listen(path: string, listeningListener?: () => void): this;
    listen(options: { port?: number, host?: string, backlog?: number, path?: string, exclusive?: boolean, readableAll?: boolean, writableAll?: boolean, ipv6Only?: boolean }, listeningListener?: () => void): this;
    listen(handle: any, backlog?: number, listeningListener?: () => void): this;
    listen(handle: any, listeningListener?: () => void): this;
    close(callback?: (err?: Error) => void): this;
    setTimeout(msecs?: number, callback?: () => void): this;
    maxHeadersCount: number | null;
    timeout: number;
    keepAliveTimeout: number;
    headersTimeout: number;
  }

  export function createServer(requestListener?: (req: IncomingMessage, res: ServerResponse) => void): Server;
  export function request(options: string | URL | ClientRequestArgs, callback?: (res: IncomingMessage) => void): ClientRequest;
  export function get(options: string | URL | ClientRequestArgs, callback?: (res: IncomingMessage) => void): ClientRequest;
} 