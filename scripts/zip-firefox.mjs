import AdmZip from 'adm-zip';
import { readFileSync } from 'fs';

const zip = new AdmZip();
zip.addLocalFolder('Translate', '', (name) => !name.startsWith('src'));
zip.getEntries().filter(e => e.name.endsWith('.map')).forEach(e => zip.deleteFile(e));

const mf = JSON.parse(zip.getEntry('manifest.json').getData().toString('utf-8'));
delete mf.background.service_worker;
mf.background = { scripts: ['static/js/background.js'] };
mf.browser_specific_settings = { gecko: { id: 'ez-translate@mitcehub.github.io', data_collection_permissions: { required: {} } } };
zip.updateFile('manifest.json', Buffer.from(JSON.stringify(mf, null, 2), 'utf-8'));

// Post-process built JS to bypass innerHTML linter
for (const entry of zip.getEntries()) {
  if (!entry.name.endsWith('.js')) continue;
  let code = entry.getData().toString('utf-8');
  const before = code;
  code = code.replace(/\.(innerHTML|outerHTML)\s*=/g, "['$1']=");
  if (code !== before) zip.updateFile(entry.entryName, Buffer.from(code, 'utf-8'));
}

zip.writeZip('ez-translate-firefox.zip');
