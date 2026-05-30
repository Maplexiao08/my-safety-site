import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const inputPath = path.join(root, 'public', 'accidents.json');
const outputPath = path.join(root, 'public', 'stats.json');

const raw = fs.readFileSync(inputPath, 'utf-8');
const accidents = JSON.parse(raw);

const monthlyCount = {};
const monthlyDeaths = {};
const typeCount = {};
const provinceCount = {};

for (const item of accidents) {
  const month = item.date.slice(0, 7);
  monthlyCount[month] = (monthlyCount[month] || 0) + 1;
  monthlyDeaths[month] = (monthlyDeaths[month] || 0) + (item.deaths || 0);

  const t = item.type || '未知';
  typeCount[t] = (typeCount[t] || 0) + 1;

  const p = item.province || '未知';
  provinceCount[p] = (provinceCount[p] || 0) + 1;
}

const stats = {
  monthly: {
    count: monthlyCount,
    deaths: monthlyDeaths
  },
  byType: typeCount,
  byProvince: provinceCount
};

fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2), 'utf-8');
console.log(`统计完成，已写入 ${outputPath}`);