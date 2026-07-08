/**
 * Text Chunking Algorithm
 *
 * Splits text into chunks of a specified size with overlap,
 * respecting word boundaries to avoid cutting words in half.
 */

export interface ChunkOptions {
  chunkSize: number;
  chunkOverlap: number;
}

export function chunkText(
  text: string,
  options: ChunkOptions
): string[] {
  const { chunkSize, chunkOverlap } = options;

  if (!text || text.trim().length === 0) {
    return [];
  }

  // Normalize whitespace
  const normalizedText = text.replace(/\s+/g, " ").trim();

  if (normalizedText.length <= chunkSize) {
    return [normalizedText];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < normalizedText.length) {
    let endIndex = Math.min(startIndex + chunkSize, normalizedText.length);

    // If we're not at the end, find the last word boundary
    if (endIndex < normalizedText.length) {
      const lastSpace = normalizedText.lastIndexOf(" ", endIndex);
      if (lastSpace > startIndex) {
        endIndex = lastSpace;
      }
    }

    const chunk = normalizedText.slice(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move forward by (chunk length - overlap), but find a word boundary
    const step = endIndex - startIndex - chunkOverlap;
    if (step <= 0) {
      // Prevent infinite loop: move at least 1 character forward
      startIndex = endIndex + 1;
    } else {
      startIndex = startIndex + step;
      // Snap to a word boundary
      if (startIndex < normalizedText.length) {
        const nextSpace = normalizedText.indexOf(" ", startIndex);
        if (nextSpace !== -1 && nextSpace - startIndex < chunkOverlap / 2) {
          startIndex = nextSpace + 1;
        }
      }
    }
  }

  return chunks;
}
