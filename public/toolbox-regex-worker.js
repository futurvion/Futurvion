// Dedicated, terminable execution; no requests, storage or logging.
self.onmessage = ({ data }) => {
 try {
  const { pattern, flags, text } = data;
  if (pattern.length > 2000 || text.length > 100000) throw new Error("Limit: 2,000 pattern characters and 100,000 text characters.");
  if (!/^[dgimsuvy]*$/.test(flags) || new Set(flags).size !== flags.length) throw new Error("Unsupported or duplicate flags.");
  const regex = new RegExp(pattern, flags); const matches = []; let match;
  while ((match = regex.exec(text))) {
   matches.push({ index: match.index, value: match[0], groups: match.slice(1), named: match.groups });
   if (matches.length >= 1000 || (!regex.global && !regex.sticky)) break;
   if (!match[0].length) {
    const at = regex.lastIndex; const code = text.codePointAt(at);
    regex.lastIndex += (regex.unicode || regex.unicodeSets) && code > 65535 ? 2 : 1;
   }
  }
  self.postMessage({ matches, capped: matches.length >= 1000 });
 } catch { self.postMessage({ error: "Invalid or unsupported JavaScript regex, flags, or input size. Check your pattern. Limit: 2,000 pattern / 100,000 text characters." }); }
};
