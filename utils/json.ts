import { writeFileSync } from 'fs';
export const JSONToFile = (obj: any, filename: string) =>
        writeFileSync(`${filename}.json`, JSON.stringify(obj, null, 2));