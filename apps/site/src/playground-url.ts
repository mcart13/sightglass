const LOCAL_PLAYGROUND_URL = "http://127.0.0.1:4173";

const configuredPlaygroundUrl = import.meta.env.VITE_PLAYGROUND_URL?.trim();

export const playgroundUrl =
  configuredPlaygroundUrl || (import.meta.env.DEV ? LOCAL_PLAYGROUND_URL : "/playground/");
