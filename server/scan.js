import fs from 'fs';
import path from 'path';
import * as mm from 'music-metadata';



const ROOT = path.resolve('.');
const SONGS_DIR = path.join(ROOT, 'songs');
const TRACKS_JSON = path.join(ROOT, 'tracks.json');


const SUPPORTED = new Set(['.mp3', '.m4a', '.aac', '.flac', '.wav', '.ogg']);


async function main() {
const files = (fs.existsSync(SONGS_DIR) ? fs.readdirSync(SONGS_DIR) : [])
.filter(f => SUPPORTED.has(path.extname(f).toLowerCase()))
.sort();


const tracks = [];
let id = 1;
for (const file of files) {
try {
const full = path.join(SONGS_DIR, file);
const meta = await mm.parseFile(full).catch(() => null);
const title = meta?.common?.title || path.parse(file).name;
const artist = meta?.common?.artist || 'Unknown';
const album = meta?.common?.album || '';
const duration = meta?.format?.duration ? Math.round(meta.format.duration) : 0;
tracks.push({ id: id++, title, artist, album, duration, file });
} catch (e) { /* keep going */ }
}
fs.writeFileSync(TRACKS_JSON, JSON.stringify(tracks, null, 2));
console.log(`Wrote ${tracks.length} tracks → ${TRACKS_JSON}`);
}
main();
