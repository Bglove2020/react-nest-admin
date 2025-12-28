import * as fs from 'fs';
import * as path from 'path';

/**
 * 环境变量项类型
 */
type EnvVar = {
  key: string;
  value: string;
};

/**
 * 追加环境变量到 .env 文件末尾
 * @param envVars 环境变量对象数组，包含 key 和 value
 */
export function updateEnvFile(envVars: EnvVar[]): void {
  const projectRoot = process.cwd();
  const envFilePath = path.join(projectRoot, '.env');

  // 读取现有文件内容
  let content = '';
  if (fs.existsSync(envFilePath)) {
    content = fs.readFileSync(envFilePath, 'utf-8');
  }

  // 构建要追加的内容
  const newLines: string[] = [];
  envVars.forEach(({ key, value }) => {
    newLines.push(`${key}=${value}`);
  });

  // 追加到文件末尾
  const separator = content && !content.endsWith('\n') ? '\n' : '';
  const newContent = content + separator + newLines.join('\n') + '\n';

  // 写入文件
  fs.writeFileSync(envFilePath, newContent, 'utf-8');
}
