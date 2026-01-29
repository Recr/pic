import { configureStore } from '@reduxjs/toolkit'
import { proposalAPI } from './proposal/proposal-api'
import { employeeAPI } from './employee/employee-api'
import { areaAPI } from './area/area-api'
import { categoryAPI } from './category/category-api'

export const store = configureStore({
  reducer: {
    [proposalAPI.reducerPath]: proposalAPI.reducer,
    [employeeAPI.reducerPath]: employeeAPI.reducer,
    [areaAPI.reducerPath]: areaAPI.reducer,
    [categoryAPI.reducerPath]: categoryAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(proposalAPI.middleware)
      .concat(employeeAPI.middleware)
      .concat(areaAPI.middleware)
      .concat(categoryAPI.middleware),
})
