import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import mime from 'mime';


const app = express();
const PORT = 5000;
const ROOT = path.resolve('.');
const SONGS_DIR = path.join(ROOT, 'songs');
const TRACKS_JSON = path.join(ROOT, 'tracks.json');


app.use(cors());
app.get('/api/tracks', (req, res) => {
try { res.json(JSON.parse(fs.readFileSync(TRACKS_JSON, 'utf8'))); }
catch { res.json([]); }
});


// Stream with HTTP Range (seek works in player)
app.get('/api/stream/:id', (req, res) => {
const id = req.params.id;
const tracks = JSON.parse(fs.readFileSync(TRACKS_JSON, 'utf8'));
const t = tracks.find(x => String(x.id) === String(id));
if (!t) return res.sendStatus(404);
const file = path.join(SONGS_DIR, t.file);
const stat = fs.statSync(file);
const range = req.headers.range;
const contentType = mime.getType(file) || 'audio/mpeg';


if (!range) {
res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': stat.size });
fs.createReadStream(file).pipe(res);
} else {
const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
const start = parseInt(startStr, 10);
const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
const chunk = (end - start) + 1;
res.writeHead(206, {
'Content-Range': `bytes ${start}-${end}/${stat.size}`,
'Accept-Ranges': 'bytes',
'Content-Length': chunk,
'Content-Type': contentType
});
fs.createReadStream(file, { start, end }).pipe(res);
}
});


app.listen(PORT, () => console.log(`server http://localhost:${PORT}`));
