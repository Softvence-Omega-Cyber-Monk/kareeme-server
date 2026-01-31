declare module 'json2csv' {
  export interface ParserOptions {
    fields?: string[] | any;
    unwind?: string[];
    transforms?: any[];
    defaultValue?: any;
  }

  export class Parser {
    constructor(opts?: ParserOptions);
    parse(data: any[]): string;
  }

  export default Parser;
}
