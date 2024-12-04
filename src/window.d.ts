declare global {
  interface Window {
    appContext: LocalContext;
    database: Database;
    apiErrors: object;
  }
}

export {};
