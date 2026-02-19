import { XMLParser } from 'fast-xml-parser';
import type { ParsedPlist } from '../types/index.js';
import { readText } from '../utils/fs.js';

/**
 * Parse an Apple plist XML file into a flat key-value object.
 * Apple plists use <dict> with alternating <key> and value elements.
 */
function flattenPlistDict(dict: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (!dict || typeof dict !== 'object') return result;

  const d = dict as Record<string, unknown>;
  const keys = d.key;
  if (!keys) return result;

  // fast-xml-parser returns single children as values, arrays for multiples
  const keyArr = Array.isArray(keys) ? keys : [keys];

  // Collect all value nodes in order
  const valueTypes = ['string', 'integer', 'real', 'true', 'false', 'dict', 'array', 'data', 'date'];
  const values: unknown[] = [];
  for (const vt of valueTypes) {
    if (d[vt] !== undefined) {
      const v = Array.isArray(d[vt]) ? d[vt] : [d[vt]];
      values.push(...v.map((val: unknown) => ({ type: vt, value: val })));
    }
  }

  // Actually we need to preserve order. fast-xml-parser with preserveOrder would help,
  // but let's use a simpler approach: parse with preserveOrder option.
  // For now, use a regex-based approach for the specific keys we need.

  // Return what we can - for the purpose of this tool, we'll use regex parsing as fallback
  for (let i = 0; i < keyArr.length; i++) {
    if (i < values.length) {
      const v = values[i] as { type: string; value: unknown };
      if (v.type === 'true') result[keyArr[i] as string] = true;
      else if (v.type === 'false') result[keyArr[i] as string] = false;
      else if (v.type === 'dict') result[keyArr[i] as string] = flattenPlistDict(v.value);
      else result[keyArr[i] as string] = v.value;
    }
  }

  return result;
}

/**
 * Simple regex-based plist key-value extraction for the fields we care about.
 * More reliable than trying to get fast-xml-parser to handle Apple's plist format perfectly.
 */
function extractPlistValues(xml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Match <key>...</key> followed by a value element
  const keyValueRegex = /<key>([^<]+)<\/key>\s*<(string|true|false|integer|real|dict|array)[^>]*(?:\/>|>([\s\S]*?)<\/\2>)?/g;
  let match;

  while ((match = keyValueRegex.exec(xml)) !== null) {
    const key = match[1];
    const type = match[2];
    const value = match[3];

    if (type === 'true') result[key] = true;
    else if (type === 'false') result[key] = false;
    else if (type === 'integer') result[key] = parseInt(value ?? '0', 10);
    else if (type === 'string') result[key] = value ?? '';
    else if (type === 'dict') result[key] = value ?? '';
    else if (type === 'array') result[key] = value ?? '';
  }

  return result;
}

function extractPurposeStrings(raw: Record<string, unknown>): Record<string, string> {
  const purposeStrings: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith('NS') && key.endsWith('UsageDescription')) {
      purposeStrings[key] = String(value);
    }
  }
  return purposeStrings;
}

function extractUrlSchemes(xml: string): string[] {
  const schemes: string[] = [];
  // Look for CFBundleURLSchemes arrays
  const schemesBlockRegex = /<key>CFBundleURLSchemes<\/key>\s*<array>([\s\S]*?)<\/array>/g;
  let match;
  while ((match = schemesBlockRegex.exec(xml)) !== null) {
    const stringRegex = /<string>([^<]+)<\/string>/g;
    let sm;
    while ((sm = stringRegex.exec(match[1])) !== null) {
      schemes.push(sm[1]);
    }
  }
  return schemes;
}

function extractATS(raw: Record<string, unknown>, xml: string): ParsedPlist['ats'] {
  // Check for NSAllowsArbitraryLoads in the ATS dict
  const atsMatch = xml.match(
    /<key>NSAppTransportSecurity<\/key>\s*<dict>([\s\S]*?)<\/dict>/
  );
  if (!atsMatch) return {};

  const atsBlock = atsMatch[1];
  const allowsArbitrary = /<key>NSAllowsArbitraryLoads<\/key>\s*<true\s*\/>/.test(atsBlock);

  return {
    allowsArbitraryLoads: allowsArbitrary || undefined,
  };
}

export async function parsePlist(path: string): Promise<ParsedPlist | null> {
  const xml = await readText(path);
  if (!xml) return null;

  const raw = extractPlistValues(xml);

  return {
    raw,
    purposeStrings: extractPurposeStrings(raw),
    ats: extractATS(raw, xml),
    urlSchemes: extractUrlSchemes(xml),
    bundleVersion: raw['CFBundleVersion'] != null ? String(raw['CFBundleVersion']) : null,
    bundleShortVersion: raw['CFBundleShortVersionString'] != null
      ? String(raw['CFBundleShortVersionString'])
      : null,
  };
}
