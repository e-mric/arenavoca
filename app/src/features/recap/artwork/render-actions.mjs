// Archived schematic study. This never overwrites the generated production artwork.
import fs from 'node:fs/promises';
import sharp from 'sharp';
const out = new URL('./schematic-preview/', import.meta.url);
await fs.mkdir(out, { recursive: true });
const source = new URL('./source/', import.meta.url);
const colors = { pass:'#ddd8ff', shot:'#ffc4b7', save:'#ffdf87', overtake:'#ddd8ff', brake:'#ffc4b7', pits:'#ffdf87' };
const player=(x,y,color='#1646ed')=>`<g transform="translate(${x} ${y})"><circle cy="-22" r="13" fill="#142352"/><path d="M-19 0 Q0-10 19 0 L14 33 H-14Z" fill="${color}"/><path d="M-8 33L-16 57M8 33L25 50" stroke="#142352" stroke-width="10" stroke-linecap="round"/></g>`;
const ball=(x,y)=>`<circle cx="${x}" cy="${y}" r="12" fill="#fffaf0" stroke="#142352" stroke-width="3"/><path d="M${x-5} ${y-4}h10l3 7-8 4-8-4Z" fill="#142352"/>`;
const goal='<path d="M340 50H450V180H340Z M340 50L325 70V195L340 180M325 195H435L450 180" fill="none" stroke="#142352" stroke-width="5"/><path d="M365 50V180M395 50V180M425 50V180M340 80H450M340 110H450M340 145H450" stroke="#fffaf0" stroke-width="3"/>';
const car=(x,y,color)=>`<g transform="translate(${x} ${y})"><rect x="-34" y="-30" width="16" height="25" rx="4" fill="#142352"/><rect x="18" y="-30" width="16" height="25" rx="4" fill="#142352"/><rect x="-34" y="24" width="16" height="25" rx="4" fill="#142352"/><rect x="18" y="24" width="16" height="25" rx="4" fill="#142352"/><path d="M-8-58H8L15-10 23 25 15 48H-15L-23 25-15-10Z" fill="${color}" stroke="#142352" stroke-width="3"/><path d="M-25-36H25M-25 44H25" stroke="${color}" stroke-width="12"/><ellipse ry="13" rx="9" fill="#142352"/></g>`;
const arrow=(d)=>`<path d="${d}" fill="none" stroke="#1646ed" stroke-width="7" stroke-dasharray="10 8" marker-end="url(#arrow)"/>`;
const pitch='<rect x="25" y="25" width="430" height="230" rx="10" fill="none" stroke="#fffaf0" stroke-width="4"/><path d="M240 25V255" stroke="#fffaf0" stroke-width="3"/><circle cx="240" cy="140" r="48" fill="none" stroke="#fffaf0" stroke-width="3"/>';
const track='<path d="M90 280V160Q90 20 220 20H480" fill="none" stroke="#fffaf0" stroke-width="100"/><path d="M90 280V160Q90 20 220 20H480" fill="none" stroke="#142352" stroke-width="3" stroke-dasharray="12 12"/>';
const drawings = {
 pass: pitch+player(100,135)+player(375,90)+ball(130,195)+arrow('M155 190Q260 205 350 147'),
 shot: pitch+goal+player(95,145)+ball(145,190)+arrow('M170 180Q255 105 365 115'),
 save: pitch+goal+`<g transform="rotate(55 345 135)">${player(345,115,'#ff8a76')}<path d="M324 123L310 93M364 123L379 94" stroke="#142352" stroke-width="10" stroke-linecap="round"/></g>`+ball(292,110)+arrow('M70 190Q170 100 265 111'),
 overtake: track+car(78,212,'#ff9a87')+car(205,100,'#1646ed')+arrow('M155 245Q140 150 240 80'),
 brake: track+car(90,205,'#1646ed')+'<path d="M55 264H125M57 278H123" stroke="#f26651" stroke-width="9"/><path d="M198 65H220M242 65H263M286 65H307" stroke="#f26651" stroke-width="10"/>'+arrow('M91 130Q100 80 145 70'),
 pits: '<path d="M40 0V280M245 0V280" stroke="#fffaf0" stroke-width="75"/><rect x="300" y="60" width="155" height="165" rx="9" fill="#fffaf0" stroke="#142352" stroke-width="4"/><path d="M325 95H430M325 195H430" stroke="#ff8a76" stroke-width="7"/>'+car(376,144,'#1646ed')+arrow('M75 235Q210 230 240 157Q265 115 315 140')
};
for(const [id,drawing] of Object.entries(drawings)) {
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 280"><defs><marker id="arrow" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="3" markerHeight="3" orient="auto"><path d="M0 0L12 6L0 12Z" fill="#1646ed"/></marker></defs><rect width="480" height="280" fill="${colors[id]}"/>${drawing}</svg>`;
 await fs.writeFile(new URL(`action_${id}.svg`,source),svg);
 await sharp(Buffer.from(svg)).png().toFile(new URL(`action_${id}.png`,out).pathname);
}
