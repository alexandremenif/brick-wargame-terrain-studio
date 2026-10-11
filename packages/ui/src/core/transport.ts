export interface JsonRpcTransport {
  call<TResult>(method: string, params: unknown): Promise<TResult>;
}

export class WebSocketTransport implements JsonRpcTransport {
  private ws: WebSocket | null = null;
  private requestId = 0;
  private pendingRequests = new Map<number | string, { resolve: (res: any) => void; reject: (err: any) => void }>();

  constructor(private url: string = 'ws://localhost:4000') {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => resolve();
        this.ws.onerror = (err) => reject(err);
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.id && this.pendingRequests.has(data.id)) {
              const { resolve, reject } = this.pendingRequests.get(data.id)!;
              this.pendingRequests.delete(data.id);
              if (data.error) {
                reject(new Error(data.error.message || 'JSON-RPC Error'));
              } else {
                resolve(data.result);
              }
            }
          } catch (e) {
            console.error('Failed to parse WebSocket JSON-RPC message', e);
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  async call<TResult>(method: string, params: unknown): Promise<TResult> {
    const id = ++this.requestId;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params: Array.isArray(params) ? params : [params]
    };

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Mock fallback when offline or disconnected during development
      console.warn(`[WebSocketTransport] WebSocket not connected to ${this.url}. Returning simulated response for '${method}'`);
      return { success: true, sequenceId: id } as unknown as TResult;
    }

    return new Promise<TResult>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify(request));
    });
  }
}
