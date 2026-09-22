import assert from 'node:assert/strict';
import test from 'node:test';

import { blocksToHtml, smartTextToBlocks } from './noteBlocks.js';

test('smart text import detects note title and common blocks', () => {
  const imported = smartTextToBlocks(`# 1. Electric Charge

## Definition
Electric charge is a fundamental property.

- **Positive (+):** proton
- **Negative (-):** electron

FORMULA: q = ne

EXAMPLE: Conservation
Total charge remains constant.

NOTE: Like charges repel.`);

  assert.equal(imported.title, '1. Electric Charge');
  assert.deepEqual(
    imported.blocks.map((block) => block.type),
    ['heading', 'paragraph', 'list', 'formula', 'example', 'tip'],
  );
  assert.match(blocksToHtml(imported.blocks), /class="math-block">\\\[q = ne\\\]/);
});

test('smart text import converts pipe rows to a table block', () => {
  const imported = smartTextToBlocks(`TABLE:
Quantity | Symbol | Unit
Charge | q | Coulomb
Force | F | Newton`);

  assert.equal(imported.blocks[0].type, 'table');
  assert.deepEqual(imported.blocks[0].headers, ['Quantity', 'Symbol', 'Unit']);
  assert.deepEqual(imported.blocks[0].rows[1], ['Force', 'F', 'Newton']);
});

test('formula row and example can contain nested formulas', () => {
  const imported = smartTextToBlocks(`FORMULA: V = \\frac{W}{q} || 1V = 1\\frac{J}{C}

EXAMPLE: Work per unit charge
If W = 10 J and q = 2 C, then V = 5 V.
EXAMPLE-FORMULA: V = \\frac{W}{q} = \\frac{10}{2} = 5V`);

  const html = blocksToHtml(imported.blocks);
  assert.match(html, /\\text\{and\}/);
  assert.match(html, /class="example-box"/);
  assert.match(html, /\\frac\{10\}\{2\}/);
});

test('OCR import finds a numbered card title after chapter headings', () => {
  const imported = smartTextToBlocks(`Electrostatics
Electrostatic Potential and Capacitance
1. Electric Potential (Electrostatic Potential)
Electric potential is work done per unit charge.`);

  assert.equal(imported.title, '1. Electric Potential (Electrostatic Potential)');
});

test('OCR import reconstructs stacked fraction rows as formulas', () => {
  const imported = smartTextToBlocks(`Ww                                   J
V=—       and      1V=1—
q                                    C

WwW 10
V=—=—=5V
q 2`);

  const formulas = imported.blocks.filter((block) => block.type === 'formula');
  assert.equal(formulas.length, 2);
  assert.match(formulas[0].latex, /V=\\frac\{W\}\{q\}/);
  assert.match(formulas[0].latex, /1\\,V=1\\,\\frac\{J\}\{C\}/);
  assert.match(formulas[1].latex, /\\frac\{10\}\{2\}/);
});
