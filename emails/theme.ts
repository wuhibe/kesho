// Kesho's palette (SPEC §3). Email clients strip web fonts, so type is fallback stacks only (SPEC §8).
export const SERIF = "Georgia, 'Times New Roman', serif";
export const SANS = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif";
export const MONO = "'Courier New', Courier, monospace";
export const INK = "#210c02";
export const CREAM = "#f0ebe2";
export const PAPER = "#faf7f1";
export const SAND = "#e1d8c4";
export const BARK = "#7b6556";
export const RED = "#c42121";

// The envelope's paper and sand, tinted toward red. Gmail's app forces its own dark mode, keeping
// each colour's hue: the site's yellowish paper and sand darken to olive, these darken to brown.
export const ENVELOPE_PAPER = "#faf2ef";
export const ENVELOPE_SAND = "#e4cbc3";
// The envelope's own dark palette, for clients that honour prefers-color-scheme (Apple Mail).
export const ENVELOPE_DARK_PAPER = "#2e1a0e";
export const ENVELOPE_DARK_SAND = "#4a3324";
export const ENVELOPE_DARK_BARK = "#bfae9c";
export const ENVELOPE_DARK_RED = "#ef6a5f";
