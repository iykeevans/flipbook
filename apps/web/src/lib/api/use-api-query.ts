"use client";

import { useEffect, useState } from "react";
import { getApi, type FlipbookApi } from "./index";

export type QueryState<T> = { status: "loading"; data: null } | { status: "ready"; data: T } | { status: "error"; data: null; error: Error };

/** Loads read-only API data for a screen. `key` re-runs the query when it changes. */
export function useApiQuery<T>(key: string, load: (api: FlipbookApi) => Promise<T>): QueryState<T> {
  const [state, setState] = useState<{ key: string; value: QueryState<T> }>({ key, value: { status: "loading", data: null } });

  useEffect(() => {
    let alive = true;
    load(getApi()).then(
      (data) => alive && setState({ key, value: { status: "ready", data } }),
      (error: unknown) => alive && setState({ key, value: { status: "error", data: null, error: error as Error } }),
    );
    return () => {
      alive = false;
    };
    // `load` is expected to change every render; `key` identifies the query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state.key === key ? state.value : { status: "loading", data: null };
}
