import { NextRequest, NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get("collection");

    if (!collectionName) {
      return NextResponse.json(
        { error: "Collection name parameter is required" },
        { status: 400 }
      );
    }

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

    // Check if collection exists first to avoid scroll errors
    const collectionsResponse = await qdrant.getCollections();
    const exists = collectionsResponse.collections.some(
      (c) => c.name === collectionName
    );

    if (!exists) {
      return NextResponse.json({ categories: [] });
    }

    // Scroll points to fetch unique categories from payload
    // We only retrieve up to 1000 points to keep response fast, and request only 'category' payload field
    const result = await qdrant.scroll(collectionName, {
      limit: 1000,
      with_payload: ["category"],
      with_vector: false,
    });

    const uniqueCategories = Array.from(
      new Set(
        result.points
          .map((p) => p.payload?.category)
          .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
      )
    ).sort();

    return NextResponse.json({ categories: uniqueCategories });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to fetch categories: ${message}` },
      { status: 500 }
    );
  }
}
