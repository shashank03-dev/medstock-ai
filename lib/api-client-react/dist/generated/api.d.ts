import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Alert, CreateCrisisRequestBody, CreateDepartmentBody, CreateSkuBody, CreateSurplusListingBody, CrisisMatch, CrisisModeStatus, CrisisRequest, DashboardSummary, DeleteResult, Department, ExpiryItem, Forecast, ForecastJobResult, ForecastOverrideBody, GetSkuMovementHistoryParams, HealthStatus, Hospital, InventoryItem, ListAlertsParams, ListExpiryItemsParams, ListForecastsParams, ListInventoryParams, ListSkusParams, MarkExpiryResolvedBody, RedistributionSuggestion, Sku, SkuForecastDetail, StockMovement, StockStatusBreakdown, SurplusListing, ToggleCrisisModeBody, UpdateCrisisStatusBody, UpdateSkuBody, UpdateStockBody, WastageReport, WastageTrendPoint } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns aggregated KPIs for the admin dashboard
 * @summary Get dashboard KPI summary
 */
export declare const getGetDashboardSummaryUrl: () => string;
export declare const getDashboardSummary: (options?: RequestInit) => Promise<DashboardSummary>;
export declare const getGetDashboardSummaryQueryKey: () => readonly ["/api/dashboard/summary"];
export declare const getGetDashboardSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardSummary>>>;
export type GetDashboardSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard KPI summary
 */
export declare function useGetDashboardSummary<TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get stock counts grouped by traffic-light status
 */
export declare const getGetStockByStatusUrl: () => string;
export declare const getStockByStatus: (options?: RequestInit) => Promise<StockStatusBreakdown>;
export declare const getGetStockByStatusQueryKey: () => readonly ["/api/dashboard/stock-by-status"];
export declare const getGetStockByStatusQueryOptions: <TData = Awaited<ReturnType<typeof getStockByStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStockByStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStockByStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStockByStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getStockByStatus>>>;
export type GetStockByStatusQueryError = ErrorType<unknown>;
/**
 * @summary Get stock counts grouped by traffic-light status
 */
export declare function useGetStockByStatus<TData = Awaited<ReturnType<typeof getStockByStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStockByStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get recent alerts feed for dashboard
 */
export declare const getGetAlertsFeedUrl: () => string;
export declare const getAlertsFeed: (options?: RequestInit) => Promise<Alert[]>;
export declare const getGetAlertsFeedQueryKey: () => readonly ["/api/dashboard/alerts-feed"];
export declare const getGetAlertsFeedQueryOptions: <TData = Awaited<ReturnType<typeof getAlertsFeed>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAlertsFeed>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAlertsFeed>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAlertsFeedQueryResult = NonNullable<Awaited<ReturnType<typeof getAlertsFeed>>>;
export type GetAlertsFeedQueryError = ErrorType<unknown>;
/**
 * @summary Get recent alerts feed for dashboard
 */
export declare function useGetAlertsFeed<TData = Awaited<ReturnType<typeof getAlertsFeed>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAlertsFeed>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get monthly wastage cost trend (last 6 months)
 */
export declare const getGetWastageTrendUrl: () => string;
export declare const getWastageTrend: (options?: RequestInit) => Promise<WastageTrendPoint[]>;
export declare const getGetWastageTrendQueryKey: () => readonly ["/api/dashboard/wastage-trend"];
export declare const getGetWastageTrendQueryOptions: <TData = Awaited<ReturnType<typeof getWastageTrend>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWastageTrend>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWastageTrend>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWastageTrendQueryResult = NonNullable<Awaited<ReturnType<typeof getWastageTrend>>>;
export type GetWastageTrendQueryError = ErrorType<unknown>;
/**
 * @summary Get monthly wastage cost trend (last 6 months)
 */
export declare function useGetWastageTrend<TData = Awaited<ReturnType<typeof getWastageTrend>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWastageTrend>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all departments
 */
export declare const getListDepartmentsUrl: () => string;
export declare const listDepartments: (options?: RequestInit) => Promise<Department[]>;
export declare const getListDepartmentsQueryKey: () => readonly ["/api/departments"];
export declare const getListDepartmentsQueryOptions: <TData = Awaited<ReturnType<typeof listDepartments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDepartments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDepartments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDepartmentsQueryResult = NonNullable<Awaited<ReturnType<typeof listDepartments>>>;
export type ListDepartmentsQueryError = ErrorType<unknown>;
/**
 * @summary List all departments
 */
export declare function useListDepartments<TData = Awaited<ReturnType<typeof listDepartments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDepartments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a department
 */
export declare const getCreateDepartmentUrl: () => string;
export declare const createDepartment: (createDepartmentBody: CreateDepartmentBody, options?: RequestInit) => Promise<Department>;
export declare const getCreateDepartmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDepartment>>, TError, {
        data: BodyType<CreateDepartmentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createDepartment>>, TError, {
    data: BodyType<CreateDepartmentBody>;
}, TContext>;
export type CreateDepartmentMutationResult = NonNullable<Awaited<ReturnType<typeof createDepartment>>>;
export type CreateDepartmentMutationBody = BodyType<CreateDepartmentBody>;
export type CreateDepartmentMutationError = ErrorType<unknown>;
/**
 * @summary Create a department
 */
export declare const useCreateDepartment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDepartment>>, TError, {
        data: BodyType<CreateDepartmentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createDepartment>>, TError, {
    data: BodyType<CreateDepartmentBody>;
}, TContext>;
/**
 * @summary Get a department by ID
 */
export declare const getGetDepartmentUrl: (id: number) => string;
export declare const getDepartment: (id: number, options?: RequestInit) => Promise<Department>;
export declare const getGetDepartmentQueryKey: (id: number) => readonly [`/api/departments/${number}`];
export declare const getGetDepartmentQueryOptions: <TData = Awaited<ReturnType<typeof getDepartment>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDepartment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDepartment>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDepartmentQueryResult = NonNullable<Awaited<ReturnType<typeof getDepartment>>>;
export type GetDepartmentQueryError = ErrorType<unknown>;
/**
 * @summary Get a department by ID
 */
export declare function useGetDepartment<TData = Awaited<ReturnType<typeof getDepartment>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDepartment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all SKUs
 */
export declare const getListSkusUrl: (params?: ListSkusParams) => string;
export declare const listSkus: (params?: ListSkusParams, options?: RequestInit) => Promise<Sku[]>;
export declare const getListSkusQueryKey: (params?: ListSkusParams) => readonly ["/api/skus", ...ListSkusParams[]];
export declare const getListSkusQueryOptions: <TData = Awaited<ReturnType<typeof listSkus>>, TError = ErrorType<unknown>>(params?: ListSkusParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSkus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSkus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSkusQueryResult = NonNullable<Awaited<ReturnType<typeof listSkus>>>;
export type ListSkusQueryError = ErrorType<unknown>;
/**
 * @summary List all SKUs
 */
export declare function useListSkus<TData = Awaited<ReturnType<typeof listSkus>>, TError = ErrorType<unknown>>(params?: ListSkusParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSkus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new SKU
 */
export declare const getCreateSkuUrl: () => string;
export declare const createSku: (createSkuBody: CreateSkuBody, options?: RequestInit) => Promise<Sku>;
export declare const getCreateSkuMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSku>>, TError, {
        data: BodyType<CreateSkuBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSku>>, TError, {
    data: BodyType<CreateSkuBody>;
}, TContext>;
export type CreateSkuMutationResult = NonNullable<Awaited<ReturnType<typeof createSku>>>;
export type CreateSkuMutationBody = BodyType<CreateSkuBody>;
export type CreateSkuMutationError = ErrorType<unknown>;
/**
 * @summary Create a new SKU
 */
export declare const useCreateSku: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSku>>, TError, {
        data: BodyType<CreateSkuBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSku>>, TError, {
    data: BodyType<CreateSkuBody>;
}, TContext>;
/**
 * @summary Get a single SKU by ID
 */
export declare const getGetSkuUrl: (id: number) => string;
export declare const getSku: (id: number, options?: RequestInit) => Promise<Sku>;
export declare const getGetSkuQueryKey: (id: number) => readonly [`/api/skus/${number}`];
export declare const getGetSkuQueryOptions: <TData = Awaited<ReturnType<typeof getSku>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSku>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSku>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSkuQueryResult = NonNullable<Awaited<ReturnType<typeof getSku>>>;
export type GetSkuQueryError = ErrorType<unknown>;
/**
 * @summary Get a single SKU by ID
 */
export declare function useGetSku<TData = Awaited<ReturnType<typeof getSku>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSku>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a SKU
 */
export declare const getUpdateSkuUrl: (id: number) => string;
export declare const updateSku: (id: number, updateSkuBody: UpdateSkuBody, options?: RequestInit) => Promise<Sku>;
export declare const getUpdateSkuMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSku>>, TError, {
        id: number;
        data: BodyType<UpdateSkuBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSku>>, TError, {
    id: number;
    data: BodyType<UpdateSkuBody>;
}, TContext>;
export type UpdateSkuMutationResult = NonNullable<Awaited<ReturnType<typeof updateSku>>>;
export type UpdateSkuMutationBody = BodyType<UpdateSkuBody>;
export type UpdateSkuMutationError = ErrorType<unknown>;
/**
 * @summary Update a SKU
 */
export declare const useUpdateSku: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSku>>, TError, {
        id: number;
        data: BodyType<UpdateSkuBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSku>>, TError, {
    id: number;
    data: BodyType<UpdateSkuBody>;
}, TContext>;
/**
 * @summary Delete a SKU
 */
export declare const getDeleteSkuUrl: (id: number) => string;
export declare const deleteSku: (id: number, options?: RequestInit) => Promise<DeleteResult>;
export declare const getDeleteSkuMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteSku>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteSku>>, TError, {
    id: number;
}, TContext>;
export type DeleteSkuMutationResult = NonNullable<Awaited<ReturnType<typeof deleteSku>>>;
export type DeleteSkuMutationError = ErrorType<unknown>;
/**
 * @summary Delete a SKU
 */
export declare const useDeleteSku: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteSku>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteSku>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get stock movement history for a SKU
 */
export declare const getGetSkuMovementHistoryUrl: (id: number, params?: GetSkuMovementHistoryParams) => string;
export declare const getSkuMovementHistory: (id: number, params?: GetSkuMovementHistoryParams, options?: RequestInit) => Promise<StockMovement[]>;
export declare const getGetSkuMovementHistoryQueryKey: (id: number, params?: GetSkuMovementHistoryParams) => readonly [`/api/skus/${number}/movement-history`, ...GetSkuMovementHistoryParams[]];
export declare const getGetSkuMovementHistoryQueryOptions: <TData = Awaited<ReturnType<typeof getSkuMovementHistory>>, TError = ErrorType<unknown>>(id: number, params?: GetSkuMovementHistoryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSkuMovementHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSkuMovementHistory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSkuMovementHistoryQueryResult = NonNullable<Awaited<ReturnType<typeof getSkuMovementHistory>>>;
export type GetSkuMovementHistoryQueryError = ErrorType<unknown>;
/**
 * @summary Get stock movement history for a SKU
 */
export declare function useGetSkuMovementHistory<TData = Awaited<ReturnType<typeof getSkuMovementHistory>>, TError = ErrorType<unknown>>(id: number, params?: GetSkuMovementHistoryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSkuMovementHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get full inventory with real-time stock levels
 */
export declare const getListInventoryUrl: (params?: ListInventoryParams) => string;
export declare const listInventory: (params?: ListInventoryParams, options?: RequestInit) => Promise<InventoryItem[]>;
export declare const getListInventoryQueryKey: (params?: ListInventoryParams) => readonly ["/api/inventory", ...ListInventoryParams[]];
export declare const getListInventoryQueryOptions: <TData = Awaited<ReturnType<typeof listInventory>>, TError = ErrorType<unknown>>(params?: ListInventoryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInventory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listInventory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListInventoryQueryResult = NonNullable<Awaited<ReturnType<typeof listInventory>>>;
export type ListInventoryQueryError = ErrorType<unknown>;
/**
 * @summary Get full inventory with real-time stock levels
 */
export declare function useListInventory<TData = Awaited<ReturnType<typeof listInventory>>, TError = ErrorType<unknown>>(params?: ListInventoryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInventory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update stock quantity for a SKU (consumption or receipt)
 */
export declare const getUpdateStockUrl: () => string;
export declare const updateStock: (updateStockBody: UpdateStockBody, options?: RequestInit) => Promise<InventoryItem>;
export declare const getUpdateStockMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateStock>>, TError, {
        data: BodyType<UpdateStockBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateStock>>, TError, {
    data: BodyType<UpdateStockBody>;
}, TContext>;
export type UpdateStockMutationResult = NonNullable<Awaited<ReturnType<typeof updateStock>>>;
export type UpdateStockMutationBody = BodyType<UpdateStockBody>;
export type UpdateStockMutationError = ErrorType<unknown>;
/**
 * @summary Update stock quantity for a SKU (consumption or receipt)
 */
export declare const useUpdateStock: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateStock>>, TError, {
        data: BodyType<UpdateStockBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateStock>>, TError, {
    data: BodyType<UpdateStockBody>;
}, TContext>;
/**
 * @summary List all unique item categories
 */
export declare const getListCategoriesUrl: () => string;
export declare const listCategories: (options?: RequestInit) => Promise<string[]>;
export declare const getListCategoriesQueryKey: () => readonly ["/api/inventory/categories"];
export declare const getListCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof listCategories>>>;
export type ListCategoriesQueryError = ErrorType<unknown>;
/**
 * @summary List all unique item categories
 */
export declare function useListCategories<TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List demand forecasts
 */
export declare const getListForecastsUrl: (params?: ListForecastsParams) => string;
export declare const listForecasts: (params?: ListForecastsParams, options?: RequestInit) => Promise<Forecast[]>;
export declare const getListForecastsQueryKey: (params?: ListForecastsParams) => readonly ["/api/forecasts", ...ListForecastsParams[]];
export declare const getListForecastsQueryOptions: <TData = Awaited<ReturnType<typeof listForecasts>>, TError = ErrorType<unknown>>(params?: ListForecastsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listForecasts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listForecasts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListForecastsQueryResult = NonNullable<Awaited<ReturnType<typeof listForecasts>>>;
export type ListForecastsQueryError = ErrorType<unknown>;
/**
 * @summary List demand forecasts
 */
export declare function useListForecasts<TData = Awaited<ReturnType<typeof listForecasts>>, TError = ErrorType<unknown>>(params?: ListForecastsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listForecasts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Trigger forecast computation for all SKUs
 */
export declare const getRunForecastsUrl: () => string;
export declare const runForecasts: (options?: RequestInit) => Promise<ForecastJobResult>;
export declare const getRunForecastsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof runForecasts>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof runForecasts>>, TError, void, TContext>;
export type RunForecastsMutationResult = NonNullable<Awaited<ReturnType<typeof runForecasts>>>;
export type RunForecastsMutationError = ErrorType<unknown>;
/**
 * @summary Trigger forecast computation for all SKUs
 */
export declare const useRunForecasts: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof runForecasts>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof runForecasts>>, TError, void, TContext>;
/**
 * @summary Get forecast for a specific SKU
 */
export declare const getGetSkuForecastUrl: (skuId: number) => string;
export declare const getSkuForecast: (skuId: number, options?: RequestInit) => Promise<SkuForecastDetail>;
export declare const getGetSkuForecastQueryKey: (skuId: number) => readonly [`/api/forecasts/${number}`];
export declare const getGetSkuForecastQueryOptions: <TData = Awaited<ReturnType<typeof getSkuForecast>>, TError = ErrorType<unknown>>(skuId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSkuForecast>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSkuForecast>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSkuForecastQueryResult = NonNullable<Awaited<ReturnType<typeof getSkuForecast>>>;
export type GetSkuForecastQueryError = ErrorType<unknown>;
/**
 * @summary Get forecast for a specific SKU
 */
export declare function useGetSkuForecast<TData = Awaited<ReturnType<typeof getSkuForecast>>, TError = ErrorType<unknown>>(skuId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSkuForecast>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Override a forecast with manual adjustment
 */
export declare const getOverrideForecastUrl: (skuId: number) => string;
export declare const overrideForecast: (skuId: number, forecastOverrideBody: ForecastOverrideBody, options?: RequestInit) => Promise<Forecast>;
export declare const getOverrideForecastMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof overrideForecast>>, TError, {
        skuId: number;
        data: BodyType<ForecastOverrideBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof overrideForecast>>, TError, {
    skuId: number;
    data: BodyType<ForecastOverrideBody>;
}, TContext>;
export type OverrideForecastMutationResult = NonNullable<Awaited<ReturnType<typeof overrideForecast>>>;
export type OverrideForecastMutationBody = BodyType<ForecastOverrideBody>;
export type OverrideForecastMutationError = ErrorType<unknown>;
/**
 * @summary Override a forecast with manual adjustment
 */
export declare const useOverrideForecast: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof overrideForecast>>, TError, {
        skuId: number;
        data: BodyType<ForecastOverrideBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof overrideForecast>>, TError, {
    skuId: number;
    data: BodyType<ForecastOverrideBody>;
}, TContext>;
/**
 * @summary List items nearing expiry
 */
export declare const getListExpiryItemsUrl: (params?: ListExpiryItemsParams) => string;
export declare const listExpiryItems: (params?: ListExpiryItemsParams, options?: RequestInit) => Promise<ExpiryItem[]>;
export declare const getListExpiryItemsQueryKey: (params?: ListExpiryItemsParams) => readonly ["/api/expiry/items", ...ListExpiryItemsParams[]];
export declare const getListExpiryItemsQueryOptions: <TData = Awaited<ReturnType<typeof listExpiryItems>>, TError = ErrorType<unknown>>(params?: ListExpiryItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listExpiryItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listExpiryItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListExpiryItemsQueryResult = NonNullable<Awaited<ReturnType<typeof listExpiryItems>>>;
export type ListExpiryItemsQueryError = ErrorType<unknown>;
/**
 * @summary List items nearing expiry
 */
export declare function useListExpiryItems<TData = Awaited<ReturnType<typeof listExpiryItems>>, TError = ErrorType<unknown>>(params?: ListExpiryItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listExpiryItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get wastage report for current month
 */
export declare const getGetWastageReportUrl: () => string;
export declare const getWastageReport: (options?: RequestInit) => Promise<WastageReport>;
export declare const getGetWastageReportQueryKey: () => readonly ["/api/expiry/wastage-report"];
export declare const getGetWastageReportQueryOptions: <TData = Awaited<ReturnType<typeof getWastageReport>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWastageReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWastageReport>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWastageReportQueryResult = NonNullable<Awaited<ReturnType<typeof getWastageReport>>>;
export type GetWastageReportQueryError = ErrorType<unknown>;
/**
 * @summary Get wastage report for current month
 */
export declare function useGetWastageReport<TData = Awaited<ReturnType<typeof getWastageReport>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWastageReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Mark an expiry item as returned/donated
 */
export declare const getMarkExpiryResolvedUrl: () => string;
export declare const markExpiryResolved: (markExpiryResolvedBody: MarkExpiryResolvedBody, options?: RequestInit) => Promise<ExpiryItem>;
export declare const getMarkExpiryResolvedMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markExpiryResolved>>, TError, {
        data: BodyType<MarkExpiryResolvedBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markExpiryResolved>>, TError, {
    data: BodyType<MarkExpiryResolvedBody>;
}, TContext>;
export type MarkExpiryResolvedMutationResult = NonNullable<Awaited<ReturnType<typeof markExpiryResolved>>>;
export type MarkExpiryResolvedMutationBody = BodyType<MarkExpiryResolvedBody>;
export type MarkExpiryResolvedMutationError = ErrorType<unknown>;
/**
 * @summary Mark an expiry item as returned/donated
 */
export declare const useMarkExpiryResolved: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markExpiryResolved>>, TError, {
        data: BodyType<MarkExpiryResolvedBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markExpiryResolved>>, TError, {
    data: BodyType<MarkExpiryResolvedBody>;
}, TContext>;
/**
 * @summary Get redistribution suggestions for near-expiry stock
 */
export declare const getGetRedistributionSuggestionsUrl: () => string;
export declare const getRedistributionSuggestions: (options?: RequestInit) => Promise<RedistributionSuggestion[]>;
export declare const getGetRedistributionSuggestionsQueryKey: () => readonly ["/api/expiry/redistribution-suggestions"];
export declare const getGetRedistributionSuggestionsQueryOptions: <TData = Awaited<ReturnType<typeof getRedistributionSuggestions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRedistributionSuggestions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRedistributionSuggestions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRedistributionSuggestionsQueryResult = NonNullable<Awaited<ReturnType<typeof getRedistributionSuggestions>>>;
export type GetRedistributionSuggestionsQueryError = ErrorType<unknown>;
/**
 * @summary Get redistribution suggestions for near-expiry stock
 */
export declare function useGetRedistributionSuggestions<TData = Awaited<ReturnType<typeof getRedistributionSuggestions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRedistributionSuggestions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all active alerts
 */
export declare const getListAlertsUrl: (params?: ListAlertsParams) => string;
export declare const listAlerts: (params?: ListAlertsParams, options?: RequestInit) => Promise<Alert[]>;
export declare const getListAlertsQueryKey: (params?: ListAlertsParams) => readonly ["/api/alerts", ...ListAlertsParams[]];
export declare const getListAlertsQueryOptions: <TData = Awaited<ReturnType<typeof listAlerts>>, TError = ErrorType<unknown>>(params?: ListAlertsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAlerts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAlertsQueryResult = NonNullable<Awaited<ReturnType<typeof listAlerts>>>;
export type ListAlertsQueryError = ErrorType<unknown>;
/**
 * @summary List all active alerts
 */
export declare function useListAlerts<TData = Awaited<ReturnType<typeof listAlerts>>, TError = ErrorType<unknown>>(params?: ListAlertsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Mark an alert as resolved
 */
export declare const getResolveAlertUrl: (id: number) => string;
export declare const resolveAlert: (id: number, options?: RequestInit) => Promise<Alert>;
export declare const getResolveAlertMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resolveAlert>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof resolveAlert>>, TError, {
    id: number;
}, TContext>;
export type ResolveAlertMutationResult = NonNullable<Awaited<ReturnType<typeof resolveAlert>>>;
export type ResolveAlertMutationError = ErrorType<unknown>;
/**
 * @summary Mark an alert as resolved
 */
export declare const useResolveAlert: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resolveAlert>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof resolveAlert>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List surplus inventory available in the network
 */
export declare const getListSurplusListingsUrl: () => string;
export declare const listSurplusListings: (options?: RequestInit) => Promise<SurplusListing[]>;
export declare const getListSurplusListingsQueryKey: () => readonly ["/api/crisis/surplus-listings"];
export declare const getListSurplusListingsQueryOptions: <TData = Awaited<ReturnType<typeof listSurplusListings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSurplusListings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSurplusListings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSurplusListingsQueryResult = NonNullable<Awaited<ReturnType<typeof listSurplusListings>>>;
export type ListSurplusListingsQueryError = ErrorType<unknown>;
/**
 * @summary List surplus inventory available in the network
 */
export declare function useListSurplusListings<TData = Awaited<ReturnType<typeof listSurplusListings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSurplusListings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Publish a surplus listing to the network
 */
export declare const getCreateSurplusListingUrl: () => string;
export declare const createSurplusListing: (createSurplusListingBody: CreateSurplusListingBody, options?: RequestInit) => Promise<SurplusListing>;
export declare const getCreateSurplusListingMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSurplusListing>>, TError, {
        data: BodyType<CreateSurplusListingBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSurplusListing>>, TError, {
    data: BodyType<CreateSurplusListingBody>;
}, TContext>;
export type CreateSurplusListingMutationResult = NonNullable<Awaited<ReturnType<typeof createSurplusListing>>>;
export type CreateSurplusListingMutationBody = BodyType<CreateSurplusListingBody>;
export type CreateSurplusListingMutationError = ErrorType<unknown>;
/**
 * @summary Publish a surplus listing to the network
 */
export declare const useCreateSurplusListing: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSurplusListing>>, TError, {
        data: BodyType<CreateSurplusListingBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSurplusListing>>, TError, {
    data: BodyType<CreateSurplusListingBody>;
}, TContext>;
/**
 * @summary List all critical item requests in the network
 */
export declare const getListCrisisRequestsUrl: () => string;
export declare const listCrisisRequests: (options?: RequestInit) => Promise<CrisisRequest[]>;
export declare const getListCrisisRequestsQueryKey: () => readonly ["/api/crisis/requests"];
export declare const getListCrisisRequestsQueryOptions: <TData = Awaited<ReturnType<typeof listCrisisRequests>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCrisisRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCrisisRequests>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCrisisRequestsQueryResult = NonNullable<Awaited<ReturnType<typeof listCrisisRequests>>>;
export type ListCrisisRequestsQueryError = ErrorType<unknown>;
/**
 * @summary List all critical item requests in the network
 */
export declare function useListCrisisRequests<TData = Awaited<ReturnType<typeof listCrisisRequests>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCrisisRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Submit a critical item request
 */
export declare const getCreateCrisisRequestUrl: () => string;
export declare const createCrisisRequest: (createCrisisRequestBody: CreateCrisisRequestBody, options?: RequestInit) => Promise<CrisisRequest>;
export declare const getCreateCrisisRequestMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCrisisRequest>>, TError, {
        data: BodyType<CreateCrisisRequestBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCrisisRequest>>, TError, {
    data: BodyType<CreateCrisisRequestBody>;
}, TContext>;
export type CreateCrisisRequestMutationResult = NonNullable<Awaited<ReturnType<typeof createCrisisRequest>>>;
export type CreateCrisisRequestMutationBody = BodyType<CreateCrisisRequestBody>;
export type CreateCrisisRequestMutationError = ErrorType<unknown>;
/**
 * @summary Submit a critical item request
 */
export declare const useCreateCrisisRequest: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCrisisRequest>>, TError, {
        data: BodyType<CreateCrisisRequestBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCrisisRequest>>, TError, {
    data: BodyType<CreateCrisisRequestBody>;
}, TContext>;
/**
 * @summary Update the status of a crisis request
 */
export declare const getUpdateCrisisRequestStatusUrl: (id: number) => string;
export declare const updateCrisisRequestStatus: (id: number, updateCrisisStatusBody: UpdateCrisisStatusBody, options?: RequestInit) => Promise<CrisisRequest>;
export declare const getUpdateCrisisRequestStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCrisisRequestStatus>>, TError, {
        id: number;
        data: BodyType<UpdateCrisisStatusBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCrisisRequestStatus>>, TError, {
    id: number;
    data: BodyType<UpdateCrisisStatusBody>;
}, TContext>;
export type UpdateCrisisRequestStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateCrisisRequestStatus>>>;
export type UpdateCrisisRequestStatusMutationBody = BodyType<UpdateCrisisStatusBody>;
export type UpdateCrisisRequestStatusMutationError = ErrorType<unknown>;
/**
 * @summary Update the status of a crisis request
 */
export declare const useUpdateCrisisRequestStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCrisisRequestStatus>>, TError, {
        id: number;
        data: BodyType<UpdateCrisisStatusBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCrisisRequestStatus>>, TError, {
    id: number;
    data: BodyType<UpdateCrisisStatusBody>;
}, TContext>;
/**
 * @summary Get AI-matched surplus-to-request pairs
 */
export declare const getGetCrisisMatchesUrl: () => string;
export declare const getCrisisMatches: (options?: RequestInit) => Promise<CrisisMatch[]>;
export declare const getGetCrisisMatchesQueryKey: () => readonly ["/api/crisis/matches"];
export declare const getGetCrisisMatchesQueryOptions: <TData = Awaited<ReturnType<typeof getCrisisMatches>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCrisisMatches>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCrisisMatches>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCrisisMatchesQueryResult = NonNullable<Awaited<ReturnType<typeof getCrisisMatches>>>;
export type GetCrisisMatchesQueryError = ErrorType<unknown>;
/**
 * @summary Get AI-matched surplus-to-request pairs
 */
export declare function useGetCrisisMatches<TData = Awaited<ReturnType<typeof getCrisisMatches>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCrisisMatches>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get current crisis mode status
 */
export declare const getGetCrisisModeUrl: () => string;
export declare const getCrisisMode: (options?: RequestInit) => Promise<CrisisModeStatus>;
export declare const getGetCrisisModeQueryKey: () => readonly ["/api/crisis/mode"];
export declare const getGetCrisisModeQueryOptions: <TData = Awaited<ReturnType<typeof getCrisisMode>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCrisisMode>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCrisisMode>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCrisisModeQueryResult = NonNullable<Awaited<ReturnType<typeof getCrisisMode>>>;
export type GetCrisisModeQueryError = ErrorType<unknown>;
/**
 * @summary Get current crisis mode status
 */
export declare function useGetCrisisMode<TData = Awaited<ReturnType<typeof getCrisisMode>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCrisisMode>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Toggle crisis mode on/off
 */
export declare const getToggleCrisisModeUrl: () => string;
export declare const toggleCrisisMode: (toggleCrisisModeBody: ToggleCrisisModeBody, options?: RequestInit) => Promise<CrisisModeStatus>;
export declare const getToggleCrisisModeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof toggleCrisisMode>>, TError, {
        data: BodyType<ToggleCrisisModeBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof toggleCrisisMode>>, TError, {
    data: BodyType<ToggleCrisisModeBody>;
}, TContext>;
export type ToggleCrisisModeMutationResult = NonNullable<Awaited<ReturnType<typeof toggleCrisisMode>>>;
export type ToggleCrisisModeMutationBody = BodyType<ToggleCrisisModeBody>;
export type ToggleCrisisModeMutationError = ErrorType<unknown>;
/**
 * @summary Toggle crisis mode on/off
 */
export declare const useToggleCrisisMode: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof toggleCrisisMode>>, TError, {
        data: BodyType<ToggleCrisisModeBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof toggleCrisisMode>>, TError, {
    data: BodyType<ToggleCrisisModeBody>;
}, TContext>;
/**
 * @summary List all hospitals in the network
 */
export declare const getListHospitalsUrl: () => string;
export declare const listHospitals: (options?: RequestInit) => Promise<Hospital[]>;
export declare const getListHospitalsQueryKey: () => readonly ["/api/hospitals"];
export declare const getListHospitalsQueryOptions: <TData = Awaited<ReturnType<typeof listHospitals>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listHospitals>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listHospitals>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListHospitalsQueryResult = NonNullable<Awaited<ReturnType<typeof listHospitals>>>;
export type ListHospitalsQueryError = ErrorType<unknown>;
/**
 * @summary List all hospitals in the network
 */
export declare function useListHospitals<TData = Awaited<ReturnType<typeof listHospitals>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listHospitals>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map