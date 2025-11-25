import { configureStore } from '@reduxjs/toolkit';
import { improvementApi } from './improvement-api';
import { employeeApi } from './employee-api';
import areaApi from './area-api';

export const store = configureStore({
    reducer: {
        [improvementApi.reducerPath]: improvementApi.reducer,
        [employeeApi.reducerPath]: employeeApi.reducer,
        [areaApi.reducerPath]: areaApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            improvementApi.middleware,
            employeeApi.middleware,
            areaApi.middleware
        ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

