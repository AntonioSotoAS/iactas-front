import { ColaFifoItem, ColaFifoStats, EstadoSolicitud } from './actaSolicitud';

/**
 * Nombres de eventos emitidos por el servidor en el namespace /solicitudes
 */
export const SOLICITUD_WS_EVENTS = {
  COLA_ACTUALIZADA: 'cola:actualizada',
  COLA_STATS: 'cola:stats',
  SOLICITUD_ESTADO: 'solicitud:estado',
  SOLICITUD_COMPLETADA: 'solicitud:completada',
  SOLICITUD_ERROR: 'solicitud:error',
} as const;

export type SolicitudWsEvent = typeof SOLICITUD_WS_EVENTS[keyof typeof SOLICITUD_WS_EVENTS];

/**
 * Interfaz genérica base para todos los eventos exitosos emitidos por el servidor.
 */
export interface WsSuccessResponse<T = unknown> {
  event: string;
  data: T;
  timestamp: string;
}

/**
 * Payload para actualización global de la cola FIFO.
 * Evento: 'cola:actualizada'
 */
export type WsActualizacionColaPayload = WsSuccessResponse<ColaFifoItem[]>;

/**
 * Payload para el cambio de estado de una solicitud específica.
 * Evento: 'solicitud:estado'
 */
export interface WsCambioEstadoData {
  solicitudId: number;
  nuevoEstado: EstadoSolicitud | string;
}
export type WsCambioEstadoPayload = WsSuccessResponse<WsCambioEstadoData>;

/**
 * Payload para la actualización de estadísticas de la cola.
 * Evento: 'cola:stats'
 */
export type WsStatsColaPayload = WsSuccessResponse<ColaFifoStats>;

/**
 * Payload para cuando una solicitud se completa exitosamente.
 * Evento: 'solicitud:completada'
 */
export interface WsSolicitudCompletadaData {
  solicitudId: number;
  urlActaGenerada?: string;
  userId?: number;
}
export type WsSolicitudCompletadaPayload = WsSuccessResponse<WsSolicitudCompletadaData>;

/**
 * Payload para cuando ocurre un error procesando una solicitud.
 * Nota: Los errores directos se emiten usualmente con esta estructura.
 * Evento: 'solicitud:error' o catch de WsException
 */
export interface WsErrorResponse {
  code: string;
  message: string;
  event?: string;
  timestamp: string;
  details?: {
    solicitudId?: number;
    [key: string]: unknown;
  };
}
