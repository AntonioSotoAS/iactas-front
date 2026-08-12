import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from './api/baseApi'
import { uploadApi, downloadApi } from './api/uploadApi'
import { estadisticaApi } from './api/estadisticaApi'
import { actaSubidaSijApi } from './api/actaSubidaSijApi'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [downloadApi.reducerPath]: downloadApi.reducer,
    [estadisticaApi.reducerPath]: estadisticaApi.reducer,
    [actaSubidaSijApi.reducerPath]: actaSubidaSijApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones que contengan Blobs
        ignoredActions: [
          'uploadApi/executeMutation/fulfilled',
          'uploadApi/executeMutation/rejected',
          'uploadApi/executeMutation/pending',
          'downloadApi/executeMutation/fulfilled',
          'downloadApi/executeMutation/rejected',
          'downloadApi/executeMutation/pending',
          'actaGeneradaApi/executeMutation/fulfilled',
          'actaGeneradaApi/executeMutation/rejected',
          'actaGeneradaApi/executeMutation/pending'
        ],
        // Ignorar rutas específicas que contengan Blobs
        ignoredPaths: [
          'uploadApi.mutations.*.data',
          'uploadApi.mutations.*.error.data',
          'downloadApi.mutations.*.data',
          'downloadApi.mutations.*.error.data',
          'actaGeneradaApi.mutations.*.data',
          'actaGeneradaApi.mutations.*.error.data'
        ],
        // Ignorar tipos específicos de valores no serializables
        ignoredActionsPaths: ['meta.arg', 'payload'],
      },
    }).concat(
      baseApi.middleware,
      uploadApi.middleware,
      downloadApi.middleware,
      estadisticaApi.middleware,
      actaSubidaSijApi.middleware,
    ),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
