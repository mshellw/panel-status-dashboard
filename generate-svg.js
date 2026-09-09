const fs = require('fs');

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = 'appPMuMIKkuahUkmG';

async function generateSVG() {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/ACTIVE%20Panels?fields=ID,Type,Cut&pageSize=100`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
      }
    );
    const data = await response.json();
    const records = data.records || [];

    const panels = records.map(r => {
      const id = r.fields.ID || '';
      const match = id.match(/^(\d+)-(\d+)/);
      const [, row, col] = match || ['', '0', '0'];
      return {
        id,
        row: parseInt(row),
        col: parseInt(col),
        cut: !!r.fields.Cut
      };
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

          return `<rect x="${x}" y="${y}" width="20" height="48" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
<text x="${x + 10}" y="${y + 24}" style="font-size: 10px; font-weight: 500; text-anchor: middle; dominant-baseline: middle; fill: #000;">${labelText}</text>`;
        })
      )
      .join('\n');

    const columnLabels = Array.from({ length:
