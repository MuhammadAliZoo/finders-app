declare module 'react-native-websocket' {
  class WebSocket {
    constructor(url: string, protocols?: string | string[]);
    send(data: string | ArrayBuffer): void;
    close(code?: number, reason?: string): void;
    onopen: () => void;
    onmessage: (event: { data: string }) => void;
    onerror: (error: any) => void;
    onclose: (event: { code: number; reason: string }) => void;
    readyState: number;
  }
  export default WebSocket;
} 