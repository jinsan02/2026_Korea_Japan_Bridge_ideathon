/**
 * Synthetic document page model.
 *
 * A demo document is data, not a picture file. The same block coordinates are
 * used to (a) render the page as SVG and (b) compute Evidence Lens bounding
 * boxes, so a highlight can never drift away from the text it points at.
 *
 * Every document here is invented for the demo. No real citizen document, no
 * real agency phone number, no real account or resident registration number.
 */
import type { Region } from '@/lib/analysis/schema';

export type BlockStyle =
  | 'org'
  | 'title'
  | 'subtitle'
  | 'sectionLabel'
  | 'fieldLabel'
  | 'fieldValue'
  | 'fieldValueStrong'
  | 'body'
  | 'fine'
  /** The one number the reader is looking for, set large. */
  | 'amountHuge'
  /** Light text drawn on top of a filled shape. */
  | 'onFill';

export interface DocumentBlock {
  id: string;
  text: string;
  /** Page-unit coordinates, origin top-left. */
  x: number;
  y: number;
  width: number;
  height: number;
  style: BlockStyle;
}

/**
 * Non-text furniture: the boxes, buttons and barcodes that make a payment slip
 * look like a payment slip and an app screen look like an app screen. Drawn
 * behind the text, and never a source of evidence on its own.
 */
export interface DocumentShape {
  id: string;
  kind: 'panel' | 'outline' | 'button' | 'barcode';
  x: number;
  y: number;
  width: number;
  height: number;
  /** Overrides the default fill for 'panel' and 'button'. */
  fill?: string;
}

export interface SyntheticDocumentPage {
  width: number;
  height: number;
  blocks: DocumentBlock[];
  /** Horizontal rules drawn at these y positions. */
  rules: number[];
  shapes?: DocumentShape[];
  /** Page background. Paper white unless a screenshot says otherwise. */
  background?: string;
}

/** Standard paper canvas (roughly A4 proportions). */
export const PAGE_WIDTH = 800;
export const PAGE_HEIGHT = 1130;

/** Phone screenshot canvas, for a document the user meets inside an app. */
export const SCREEN_WIDTH = 640;
export const SCREEN_HEIGHT = 1300;

/**
 * Converts a block's page-unit box into the normalised 0..1 rect the schema
 * wants. Measured against the page's own canvas, not a global one, so a phone
 * screenshot and an A4 notice can share the Evidence Lens.
 */
export function blockToBBox(page: SyntheticDocumentPage, block: DocumentBlock): Region {
  return {
    x: block.x / page.width,
    y: block.y / page.height,
    width: block.width / page.width,
    height: block.height / page.height,
  };
}

export function findBlock(
  page: SyntheticDocumentPage,
  blockId: string,
): DocumentBlock {
  const block = page.blocks.find((candidate) => candidate.id === blockId);
  if (!block) {
    throw new Error(`Unknown document block: ${blockId}`);
  }
  return block;
}

/** Bounding box for a block id, for use when building fixture evidence. */
export function bboxOf(page: SyntheticDocumentPage, blockId: string): Region {
  return blockToBBox(page, findBlock(page, blockId));
}

/** The verbatim text of a block, so fixture quotes cannot drift from the render. */
export function quoteOf(page: SyntheticDocumentPage, blockId: string): string {
  return findBlock(page, blockId).text;
}

/**
 * Layout helper: a label/value row in the two-column table area of a notice.
 */
export function fieldRow(options: {
  idPrefix: string;
  label: string;
  value: string;
  y: number;
  strong?: boolean;
}): DocumentBlock[] {
  const { idPrefix, label, value, y, strong = false } = options;
  const rowHeight = 56;
  return [
    {
      id: `${idPrefix}-label`,
      text: label,
      x: 72,
      y,
      width: 200,
      height: rowHeight,
      style: 'fieldLabel',
    },
    {
      id: `${idPrefix}-value`,
      text: value,
      x: 288,
      y,
      width: 440,
      height: rowHeight,
      style: strong ? 'fieldValueStrong' : 'fieldValue',
    },
  ];
}
