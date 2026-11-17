/**
 * Lossless JPEG & PNG metadata utility for embedding CBIT Photography Club attribution.
 *
 * CRITICAL GUARANTEE:
 * This module NEVER decodes, re-encodes, resizes, or recompresses image data.
 * For JPEG files, it injects an Adobe XMP APP1 segment (0xFF, 0xE1) containing
 * IPTC Credit, Photoshop Credit, Source, and Description into the JPEG header
 * BEFORE the Start of Scan (0xFF, 0xDA).
 * All compressed DCT image scan data remains 100% byte-for-byte identical.
 */

const XMP_NAMESPACE_HEADER = "http://ns.adobe.com/xap/1.0/\0";
const XMP_HEADER_BUF = Buffer.from(XMP_NAMESPACE_HEADER, "latin1");

export const CPC_METADATA = {
  creditLine: "CBIT Photography Club",
  source: "CBIT Photography Club",
  description: "Captured by CBIT Photography Club",
  website: "https://cbitphotoclub.vercel.app",
} as const;

/**
 * Builds the standard Adobe XMP RDF metadata payload for CPC attribution.
 */
function buildCpcXmpPayload(): string {
  return `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"
    xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/"
    xmlns:dc="http://purl.org/dc/elements/1.1/">
   <photoshop:Credit>${CPC_METADATA.creditLine}</photoshop:Credit>
   <photoshop:Source>${CPC_METADATA.source}</photoshop:Source>
   <Iptc4xmpCore:CreditLine>${CPC_METADATA.creditLine}</Iptc4xmpCore:CreditLine>
   <dc:description>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">${CPC_METADATA.description}</rdf:li>
    </rdf:Alt>
   </dc:description>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

/**
 * Losslessly embeds CPC attribution into a JPEG buffer by adding or updating
 * the XMP APP1 segment.
 *
 * If the image is not a valid JPEG or exceeds segment limits, returns the original buffer unchanged.
 */
export function embedCpcCreditInJpeg(jpegBuffer: Buffer): Buffer {
  if (!Buffer.isBuffer(jpegBuffer) || jpegBuffer.length < 4) {
    return jpegBuffer;
  }

  // Verify JPEG Start Of Image marker (0xFF, 0xD8)
  if (jpegBuffer[0] !== 0xFF || jpegBuffer[1] !== 0xD8) {
    return jpegBuffer;
  }

  let pos = 2;
  let existingXmpSegment: { start: number; end: number; dataStart: number } | null = null;
  let insertIndex = 2; // Default immediately after SOI

  // Scan JPEG marker segments until Start Of Scan (SOS: 0xFF, 0xDA)
  while (pos < jpegBuffer.length - 1) {
    if (jpegBuffer[pos] !== 0xFF) break;
    const marker = jpegBuffer[pos + 1];
    if (marker === undefined) break;

    // Standalone markers without payload
    if (marker === 0xD8 || marker === 0xD9 || (marker >= 0xD0 && marker <= 0xD7) || marker === 0x01) {
      pos += 2;
      continue;
    }

    // Start Of Scan (0xDA): Image data stream begins here.
    if (marker === 0xDA) {
      break;
    }

    if (pos + 4 > jpegBuffer.length) break;
    const segLen = jpegBuffer.readUInt16BE(pos + 2);
    const segStart = pos;
    const segEnd = pos + 2 + segLen;
    if (segEnd > jpegBuffer.length) break;

    // APP1 (0xFF, 0xE1): could be Exif or XMP
    if (marker === 0xE1) {
      if (segLen > XMP_HEADER_BUF.length + 2) {
        const idBuf = jpegBuffer.subarray(pos + 4, pos + 4 + XMP_HEADER_BUF.length);
        if (idBuf.equals(XMP_HEADER_BUF)) {
          existingXmpSegment = {
            start: segStart,
            end: segEnd,
            dataStart: pos + 4 + XMP_HEADER_BUF.length,
          };
        } else {
          // EXIF APP1: place XMP directly after EXIF
          insertIndex = segEnd;
        }
      }
    } else if (marker === 0xE0) {
      // JFIF APP0: place XMP after JFIF
      insertIndex = segEnd;
    }

    pos = segEnd;
  }

  const cpcCreditTags = `
    <photoshop:Credit>${CPC_METADATA.creditLine}</photoshop:Credit>
    <photoshop:Source>${CPC_METADATA.source}</photoshop:Source>
    <Iptc4xmpCore:CreditLine>${CPC_METADATA.creditLine}</Iptc4xmpCore:CreditLine>
    <dc:description>
     <rdf:Alt>
      <rdf:li xml:lang="x-default">${CPC_METADATA.description}</rdf:li>
     </rdf:Alt>
    </dc:description>`;

  let newXmpString: string;
  if (existingXmpSegment) {
    const rawXmp = jpegBuffer.toString("utf8", existingXmpSegment.dataStart, existingXmpSegment.end);
    if (rawXmp.includes(CPC_METADATA.creditLine)) {
      // Already has CPC attribution
      return jpegBuffer;
    }
    if (rawXmp.includes("<rdf:Description")) {
      newXmpString = rawXmp.replace(
        /<rdf:Description([^>]*)>/,
        `<rdf:Description$1 xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/" xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" xmlns:dc="http://purl.org/dc/elements/1.1/">` +
          cpcCreditTags
      );
    } else if (rawXmp.includes("</rdf:RDF>")) {
      newXmpString = rawXmp.replace(
        "</rdf:RDF>",
        `<rdf:Description rdf:about="" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/" xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" xmlns:dc="http://purl.org/dc/elements/1.1/">${cpcCreditTags}</rdf:Description></rdf:RDF>`
      );
    } else {
      newXmpString = buildCpcXmpPayload();
    }
  } else {
    newXmpString = buildCpcXmpPayload();
  }

  const xmpPayloadBuf = Buffer.from(newXmpString, "utf8");
  const newSegLen = 2 + XMP_HEADER_BUF.length + xmpPayloadBuf.length;

  // JPEG marker segments are limited to 64KB (65535 bytes)
  if (newSegLen > 65535) {
    return jpegBuffer;
  }

  const app1Header = Buffer.alloc(4);
  app1Header[0] = 0xFF;
  app1Header[1] = 0xE1;
  app1Header.writeUInt16BE(newSegLen, 2);

  const fullNewXmpSegment = Buffer.concat([app1Header, XMP_HEADER_BUF, xmpPayloadBuf]);

  if (existingXmpSegment) {
    // Replace existing XMP segment losslessly
    return Buffer.concat([
      jpegBuffer.subarray(0, existingXmpSegment.start),
      fullNewXmpSegment,
      jpegBuffer.subarray(existingXmpSegment.end),
    ]);
  } else {
    // Insert new XMP segment right after JFIF/EXIF
    return Buffer.concat([
      jpegBuffer.subarray(0, insertIndex),
      fullNewXmpSegment,
      jpegBuffer.subarray(insertIndex),
    ]);
  }
}

/**
 * Universal lossless credit embedder that checks image type and embeds CPC
 * attribution if supported.
 */
export function embedCpcCreditLossless(imageBuffer: Buffer, mimeType: string = "image/jpeg"): Buffer {
  if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length < 4) {
    return imageBuffer;
  }

  // Check JPEG magic numbers
  if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) {
    return embedCpcCreditInJpeg(imageBuffer);
  }

  // Return original untouched for other formats (PNG, WebP, etc.)
  return imageBuffer;
}
