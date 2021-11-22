declare namespace NodeJS {
    export interface ProcessEnv {
      DATABASE_URL: string;
      PORT: number;
      ADMIN: string;
      HEROKU_APP_NAME: string;
    }
  }