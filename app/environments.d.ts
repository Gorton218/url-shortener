declare global {
    namespace NodeJS {
      interface ProcessEnv {
        BASE_URL: string;
        GENERATED_LENGTH: number;
        DYNAMODB_TABLE: string;
        AWS_DEFAULT_REGION: string;
        AWSENVNAME: 'AWS_SAM_LOCAL' | 'AWS';
        ENVTYPE: 'OSX' | 'Windows' | 'Linux';
      }
    }
  }
  
  // If this file has no import/export statements (i.e. is a script)
  // convert it into a module by adding an empty export statement.
  export {}