export function buildErrorApi(err: Error | unknown) {
  return {
    success: false,
    error: err instanceof Error ? err : new Error(String(err)),
  } as const;
}
