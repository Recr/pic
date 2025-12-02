import { configureStore } from '@reduxjs/toolkit';
import { improvementAPI } from './improvement/improvement-api';
import { employeeAPI } from './employee/employee-api';
import { areaAPI } from './area/area-api';

export const store = configureStore({
    reducer: {
      [improvementAPI.reducerPath]: improvementAPI.reducer,
      [employeeAPI.reducerPath]: employeeAPI.reducer,
      [areaAPI.reducerPath]: areaAPI.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(improvementAPI.middleware)
        .concat(employeeAPI.middleware)
        .concat(areaAPI.middleware)
});


