import AdmZip from 'adm-zip';
import { readFileSync } from 'fs';

const zip = new AdmZip();
zip.addLocalFolder('Translate', '', (name) => !name.startsWith('src'));
zip.getEntries().filter(e => e.name.endsWith('.map')).forEach(e => zip.deleteFile(e));

const mf = JSON.parse(zip.getEntry('manifest.json').getData().toString('utf-8'));
delete mf.background.service_worker;
mf.background = { scripts: ['static/js/background.js'] };
mf.browser_specific_settings = { gecko: { id: 'ez-translate@mitcehub.github.io', data_collection_permissions: {} } };
zip.updateFile('manifest.json', Buffer.from(JSON.stringify(mf, null, 2), 'utf-8'));

zip.writeZip('ez-translate-firefox.zip');
