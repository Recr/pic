import { configureStore } from '@reduxjs/toolkit'
import { proposalAPI } from './proposal/proposal-api'
import { employeeAPI } from './employee/employee-api'
import { areaAPI } from './area/area-api'
import { categoryAPI } from './category/category-api'
import { loginAPI } from './auth/login'
import authReducer from './auth/auth-slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [proposalAPI.reducerPath]: proposalAPI.reducer,
    [employeeAPI.reducerPath]: employeeAPI.reducer,
    [areaAPI.reducerPath]: areaAPI.reducer,
    [categoryAPI.reducerPath]: categoryAPI.reducer,
    [loginAPI.reducerPath]: loginAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(proposalAPI.middleware)
      .concat(employeeAPI.middleware)
      .concat(areaAPI.middleware)
      .concat(categoryAPI.middleware)
      .concat(loginAPI.middleware),
})
