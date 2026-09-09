const fs = require('fs');

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = 'appPMuMIKkuahUkmG';

async function generateSVG() {
  try {
const response = await fetch(
  `https://api.airtable.com/v0/${BASE_ID}/ACTIVE%20Panels?fields=ID,Type,Cut&pageSize=100`,
  { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } }
);
const data = await response.json();
console.log('Response status:', response.status);
console.log('Response data:', data);
const records = data.records || [];
console.log('Records found:', records.length);

    const panels = records.map(r => {
      const id = r.fields.ID || '';
      const match = id.match(/^(\d+)-(\d+)/);
      const [, row, col] = match || ['', '0', '0'];
      return { id, row: parseInt(row), col: parseInt(col), cut: !!r.fields.Cut };
    });

    const total = panels.length;
    const cut = panels.filter(p => p.cut).length;
    const percentage = total > 0 ? Math.round((cut / total) * 100) : 0;
    const timestamp = new Date().toLocaleString();
    const colGap = 60;
    const rowGap = 58;

    const panelElements = Array.from({ length: 12 }, (_, i) => 12 - i)
      .flatMap((row) =>
        Array.from({ length: 7 }, (_, i) => i + 1).map((col) => {
          const panel = panels.find(p => p.row === row && p.col === col);
          const x = 50 + col * colGap;
          const y = 92 + (12 - row) * rowGap;
          const fill = panel?.cut ? '#22c55e' : '#ffffff';
          const stroke = panel?.cut ? '#16a34a' : '#d1d5db';
          const labelText = panel?.id || `${row}-${col}*`;
          return `<rect x="${x}" y="${y}" width="20" height="48" fill="${fill}" stroke="${stroke}" stroke-width="1"/><text x="${x + 10}" y="${y + 24}" style="font-size: 10px; font-weight: 500; text-anchor: middle; dominant-baseline: middle; fill: #000;">${labelText}</text>`;
        })
      ).join('\n');

    const columnLabels = Array.from({ length: 7 }, (_, i) => i + 1)
      .map((col) => `<text x="${50 + col * colGap}" y="75" style="font-size: 11px; fill: #9ca3af; text-anchor: middle;">${col}</text>`)
      .join('\n');

    const rowLabels = Array.from({ length: 12 }, (_, i) => i + 1)
      .map((row) => `<text x="30" y="${116 + (12 - row) * rowGap}" style="font-size: 11px; fill: #9ca3af; text-anchor: end; dominant-baseline: middle;">${row}</text>`)
      .join('\n');

    const svgContent = `<svg viewBox="0 0 500 1100" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block;">
  <text x="250" y="20" style="font-size: 16px; font-weight: 500; text-anchor: middle; fill: #1f2937;">218 Madison — Panel Assembly Status</text>
  <text x="250" y="35" style="font-size: 12px; text-anchor: middle; fill: #6b7280;">Green = Cut, White = Pending</text>
  <rect x="40" y="40" width="12" height="28.8" fill="#22c55e" stroke="#16a34a" stroke-width="1"/>
  <text x="60" y="54" style="font-size: 11px; fill: #1f2937;">Assembled (Cut)</text>
  <rect x="240" y="40" width="12" height="28.8" fill="#ffffff" stroke="#d1d5db" stroke-width="1"/>
  <text x="260" y="54" style="font-size: 11px; fill: #1f2937;">Pending</text>
  ${columnLabels}
  ${panelElements}
  ${rowLabels}
  <rect x="40" y="790" width="400" height="270" fill="#f5f5f5" stroke="0.5px solid #e5e7eb" stroke-width="0.5" rx="8"/>
  <text x="60" y="815" style="font-size: 13px; font-weight: 500; fill: #1f2937;">Assembly Progress Summary</text>
  <text x="60" y="840" style="font-size: 13px; fill: #4b5563;"><tspan font-weight="500" fill="#22c55e">${cut} panels assembled</tspan> / ${total} logged</text>
  <text x="60" y="860" style="font-size: 13px; fill: #4b5563;">Completion rate: <tspan font-weight="500">${percentage}%</tspan></text>
  <text x="60" y="885" style="font-size: 11px; fill: #9ca3af;">Updated: ${timestamp}</text>
</svg>`;

    fs.writeFileSync('panel-grid.svg', svgContent);
    console.log(`✅ Generated SVG: ${cut}/${total} assembled (${percentage}%)`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateSVG();
