import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { socketService } from '@/lib/socket';
import { actaSolicitudApi } from '@/store/api/actaSolicitudApi';
import { actaGeneradaApi } from '@/store/api/actaGeneradaApi';
import {
  SOLICITUD_WS_EVENTS,
  WsActualizacionColaPayload,
  WsCambioEstadoPayload,
  WsStatsColaPayload,
  WsSuccessResponse,
} from '@/types/ws-events';
import { ColaFifoItem, ColaFifoStats } from '@/types/actaSolicitud';
import type { AppDispatch } from '@/store/store';

const HOOK_LOG_PREFIX = '[useSocketSolicitudes]';

const HOOK_DEBUG =
  process.env.NEXT_PUBLIC_WS_DEBUG === 'true' ||
  process.env.NODE_ENV !== 'production';

function hookLog(...args: unknown[]) {
  if (HOOK_DEBUG) {
    console.log(HOOK_LOG_PREFIX, ...args);
  }
}

export type SocketStatus = 'connected' | 'connecting' | 'disconnected';

export interface UseSocketSolicitudesOptions {
  /** ID del usuario logueado: fuerza refetch de sus actas al recibir eventos WS */
  userId?: number;
  /** Si false, no conecta el socket (útil mientras carga auth) */
  enabled?: boolean;
}

function isWsEnvelope<T>(payload: unknown): payload is WsSuccessResponse<T> {
  return (
    payload != null &&
    typeof payload === 'object' &&
    'data' in payload &&
    'timestamp' in payload
  );
}

/** Sincroniza caché RTK y fuerza refetch HTTP de datos activos */
export function syncRealtimeSolicitudes(
  dispatch: AppDispatch,
  userId?: number,
  payload?: {
    cola?: ColaFifoItem[];
    stats?: ColaFifoStats;
  },
) {
  if (payload?.cola) {
    dispatch(
      actaSolicitudApi.util.updateQueryData('getColaFifo', undefined, () => payload.cola!),
    );
  }

  if (payload?.stats) {
    dispatch(
      actaSolicitudApi.util.updateQueryData(
        'getColaFifoStats',
        undefined,
        () => payload.stats!,
      ),
    );
  }

  dispatch(
    actaSolicitudApi.util.invalidateTags([{ type: 'ActaSolicitud' }]),
  );
  dispatch(
    actaGeneradaApi.util.invalidateTags([{ type: 'ActasGeneradas' }]),
  );

  if (userId) {
    dispatch(
      actaGeneradaApi.endpoints.findByUsuario.initiate(userId, {
        forceRefetch: true,
      }),
    );
    dispatch(
      actaSolicitudApi.endpoints.getColaFifo.initiate(undefined, {
        forceRefetch: true,
      }),
    );
    dispatch(
      actaSolicitudApi.endpoints.getColaFifoStats.initiate(undefined, {
        forceRefetch: true,
      }),
    );
  }
}

export const useSocketSolicitudes = (options: UseSocketSolicitudesOptions = {}) => {
  const { userId, enabled = true } = options;
  const dispatch = useDispatch<AppDispatch>();
  const [status, setStatus] = useState<SocketStatus>('disconnected');
  const userIdRef = useRef(userId);

  userIdRef.current = userId;

  const syncFromWs = useCallback(
    (payload?: { cola?: ColaFifoItem[]; stats?: ColaFifoStats }) => {
      syncRealtimeSolicitudes(dispatch, userIdRef.current, payload);
    },
    [dispatch],
  );

  useEffect(() => {
    if (!enabled) {
      setStatus('disconnected');
      return;
    }

    hookLog('Hook activo, suscribiendo socket…', { userId });

    const socket = socketService.getSocket();

    const onConnect = () => {
      hookLog('connect → connected');
      setStatus('connected');
    };

    const onDisconnect = () => {
      hookLog('disconnect');
      setStatus('disconnected');
    };

    const onActualizacionCola = (raw: WsActualizacionColaPayload | ColaFifoItem[]) => {
      const cola = isWsEnvelope<ColaFifoItem[]>(raw)
        ? raw.data
        : Array.isArray(raw)
          ? raw
          : undefined;

      hookLog(SOLICITUD_WS_EVENTS.COLA_ACTUALIZADA, {
        items: cola?.length,
      });
      syncFromWs({ cola });
    };

    const onStatsCola = (raw: WsStatsColaPayload | ColaFifoStats) => {
      const stats = isWsEnvelope<ColaFifoStats>(raw) ? raw.data : raw;
      hookLog(SOLICITUD_WS_EVENTS.COLA_STATS);
      syncFromWs({ stats: stats as ColaFifoStats });
    };

    const onCambioEstado = (raw: WsCambioEstadoPayload | { solicitudId: number; nuevoEstado: string }) => {
      const data = isWsEnvelope<{ solicitudId: number; nuevoEstado: string }>(raw)
        ? raw.data
        : raw;
      hookLog(SOLICITUD_WS_EVENTS.SOLICITUD_ESTADO, data);
      syncFromWs();
    };

    const onCompletada = () => {
      hookLog(SOLICITUD_WS_EVENTS.SOLICITUD_COMPLETADA);
      syncFromWs();
    };

    const onError = () => {
      hookLog(SOLICITUD_WS_EVENTS.SOLICITUD_ERROR);
      syncFromWs();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(SOLICITUD_WS_EVENTS.COLA_ACTUALIZADA, onActualizacionCola);
    socket.on(SOLICITUD_WS_EVENTS.COLA_STATS, onStatsCola);
    socket.on(SOLICITUD_WS_EVENTS.SOLICITUD_ESTADO, onCambioEstado);
    socket.on(SOLICITUD_WS_EVENTS.SOLICITUD_COMPLETADA, onCompletada);
    socket.on(SOLICITUD_WS_EVENTS.SOLICITUD_ERROR, onError);

    if (socket.connected) {
      setStatus('connected');
    } else {
      setStatus('connecting');
    }

    socketService.subscribe();

    return () => {
      hookLog('Hook cleanup: quitar listeners y unsubscribe');
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(SOLICITUD_WS_EVENTS.COLA_ACTUALIZADA, onActualizacionCola);
      socket.off(SOLICITUD_WS_EVENTS.COLA_STATS, onStatsCola);
      socket.off(SOLICITUD_WS_EVENTS.SOLICITUD_ESTADO, onCambioEstado);
      socket.off(SOLICITUD_WS_EVENTS.SOLICITUD_COMPLETADA, onCompletada);
      socket.off(SOLICITUD_WS_EVENTS.SOLICITUD_ERROR, onError);
      socketService.unsubscribe();
    };
  }, [enabled, syncFromWs, userId]);

  return {
    status,
    isConnected: status === 'connected',
  };
};
