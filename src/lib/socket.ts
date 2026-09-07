import { io, Socket } from 'socket.io-client';

const WS_LOG_PREFIX = '[WS Solicitudes]';

const WS_DEBUG =
  process.env.NEXT_PUBLIC_WS_DEBUG === 'true' ||
  process.env.NODE_ENV !== 'production';

function wsLog(...args: unknown[]) {
  if (WS_DEBUG) {
    console.log(WS_LOG_PREFIX, ...args);
  }
}

function wsWarn(...args: unknown[]) {
  if (WS_DEBUG) {
    console.warn(WS_LOG_PREFIX, ...args);
  }
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private readonly url: string;
  private listenersAttached = false;
  /** Evita desconectar mientras haya pantallas suscritas (p. ej. Strict Mode) */
  private subscriberCount = 0;

  private constructor() {
    const defaultUrl = typeof window !== 'undefined' && window.location.hostname
      ? `http://${window.location.hostname}:3009/api/v1`
      : 'http://172.17.78.59:3009/api/v1';

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || defaultUrl;

    try {
      const parsedUrl = new URL(baseUrl);
      this.url = `${parsedUrl.protocol}//${parsedUrl.host}`;
    } catch {
      this.url = baseUrl.replace(/\/api\/v1\/?$/, '');
    }

    wsLog('Servicio inicializado', {
      baseUrl,
      wsOrigin: this.url,
      endpoint: `${this.url}/solicitudes`,
    });
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private attachDebugListeners(socket: Socket): void {
    if (this.listenersAttached) return;
    this.listenersAttached = true;

    socket.on('connect', () => {
      wsLog('✅ Conectado', { id: socket.id, connected: socket.connected });
    });

    socket.on('disconnect', (reason) => {
      wsWarn('Desconectado', { reason });
    });

    socket.on('connect_error', (err) => {
      wsWarn('❌ connect_error', { message: err.message });
      if (
        err.message.includes('UNAUTHORIZED') ||
        err.message.includes('No autorizado')
      ) {
        this.updateToken();
      }
    });
  }

  public getSocket(): Socket {
    if (!this.socket) {
      const endpoint = `${this.url}/solicitudes`;
      wsLog('Creando instancia socket.io', { endpoint });

      this.socket = io(endpoint, {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        withCredentials: true,
      });

      this.attachDebugListeners(this.socket);
    }

    return this.socket;
  }

  /** Suscribir una vista; solo desconecta cuando no queden suscriptores */
  public subscribe(): void {
    this.subscriberCount += 1;
    wsLog('subscribe()', { subscriberCount: this.subscriberCount });
    this.connect();
  }

  public unsubscribe(): void {
    this.subscriberCount = Math.max(0, this.subscriberCount - 1);
    wsLog('unsubscribe()', { subscriberCount: this.subscriberCount });
    if (this.subscriberCount === 0) {
      this.disconnect();
    }
  }

  public connect(): void {
    const socket = this.getSocket();
    if (socket.connected) return;

    this.updateToken();
    wsLog('Conectando…', {
      hasToken: Boolean(
        (socket.auth as { token?: string } | undefined)?.token,
      ),
    });
    socket.connect();
  }

  public disconnect(): void {
    if (this.socket?.connected) {
      wsLog('Desconectando (sin suscriptores activos)', { id: this.socket.id });
      this.socket.disconnect();
    }
  }

  /** Cierre de sesión: ignora contador de suscriptores */
  public forceDisconnect(): void {
    this.subscriberCount = 0;
    this.disconnect();
  }

  public getDebugInfo(): {
    connected: boolean;
    id: string | undefined;
    endpoint: string;
    hasToken: boolean;
    subscriberCount: number;
  } {
    const socket = this.socket;
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;
    return {
      connected: socket?.connected ?? false,
      id: socket?.id,
      endpoint: `${this.url}/solicitudes`,
      hasToken: Boolean(token),
      subscriberCount: this.subscriberCount,
    };
  }

  private updateToken(): void {
    if (!this.socket) return;

    try {
      const token = localStorage.getItem('access_token');
      this.socket.auth = { token: token || '' };
    } catch {
      this.socket.auth = { token: '' };
    }
  }
}

export const socketService = SocketService.getInstance();

if (typeof window !== 'undefined' && WS_DEBUG) {
  (
    window as Window & { __socketService?: typeof socketService }
  ).__socketService = socketService;
}
