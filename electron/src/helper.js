import os from 'os'
import path from 'node:path'
import { getAppInfo } from "./index.js"

export function isProd()
{
    return import.meta.env.VITE_APP_ENV === 'production';
}

export const getVideoFolder = path.join(os.homedir(), 'Documents', getAppInfo().name, 'videos');
