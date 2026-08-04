/** Whether POST /api/batch/refresh and the batch page Refresh button are active. */
export function isBatchRefreshEnabled(): boolean {
  if (process.env.BATCH_REFRESH_ENABLED === "0") return false;
  if (process.env.NODE_ENV === "development") return true;
  return process.env.BATCH_REFRESH_ENABLED === "1";
}
