export async function encodeChecklist(data: object): Promise<string> {
  const json = JSON.stringify(data);

  // Try compression if available
  if (typeof CompressionStream !== 'undefined') {
    try {
      const blob = new Blob([json]);
      const stream = blob.stream().pipeThrough(new CompressionStream('gzip'));
      const compressed = await new Response(stream).arrayBuffer();
      const bytes = new Uint8Array(compressed);
      let binary = '';
      for (const byte of bytes) binary += String.fromCharCode(byte);
      return 'gz:' + btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch { /* fall through to uncompressed */ }
  }

  // Fallback: plain base64
  return 'b64:' + btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function decodeChecklist(encoded: string): Promise<object> {
  if (encoded.startsWith('gz:')) {
    const base64 = encoded.slice(3).replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const text = await new Response(stream).text();
    return JSON.parse(text);
  }

  if (encoded.startsWith('b64:')) {
    const base64 = encoded.slice(4).replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  }

  throw new Error('Unknown encoding');
}
