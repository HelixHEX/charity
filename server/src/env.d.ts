declare namespace NodeJS {
    export interface ProcessEnv {
      DATABASE_URL: string;
      PORT: number;
      ADMIN: string;
      PROD_URL: string;
    }
  }