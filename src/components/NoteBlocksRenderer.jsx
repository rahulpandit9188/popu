import { blocksToHtml, normalizeBlocks } from '../noteBlocks';
import NoteHtml from './NoteHtml';

function readBlocks(value) {
  if (Array.isArray(value)) return normalizeBlocks(value);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    return normalizeBlocks(JSON.parse(value));
  } catch {
    return [];
  }
}

export default function NoteBlocksRenderer({ blocks, fallbackHtml = '' }) {
  const structuredBlocks = readBlocks(blocks);
  const html = structuredBlocks.length ? blocksToHtml(structuredBlocks) : fallbackHtml;
  return <NoteHtml html={html} />;
}
