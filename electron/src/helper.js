import os from 'os'
import path from 'node:path'
import { getAppInfo } from "./index.js"

import ProjectConfig from "./../../project.config";

let project = new ProjectConfig();

let params = project.getParams();

export function isProd()
{
    return params.env === 'production';
}

export const getVideoFolder = path.join(os.homedir(), 'Documents', getAppInfo().name, 'videos');
