import { NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";

export async function GET() {
  try {
    const url = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;

    if (!url) {
      return NextResponse.json(
        { error: "QDRANT_URL environment variable is not set" },
        { status: 500 }
      );
    }

    const qdrant = new QdrantClient({
      url,
      apiKey: apiKey || undefined,
    });

    const collectionsResponse = await qdrant.getCollections();
    const collections = collectionsResponse.collections.map((c) => c.name);

    return NextResponse.json({ collections });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to fetch collections: ${message}` },
      { status: 500 }
    );
  }
}
