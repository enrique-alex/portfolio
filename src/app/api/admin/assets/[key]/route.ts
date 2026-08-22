import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const { env } = getCloudflareContext();
    const bucket = env.portfolio_images;
    
    // Récupération de l'objet depuis le bucket (local ou distant)
    const object = await bucket.get(key);

    if (!object) {
      return new NextResponse("Not found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers as any);
    headers.set("etag", object.httpEtag);
    
    // Fallback explicite pour le content-type si non écrit par writeHttpMetadata
    if (object.httpMetadata?.contentType) {
      headers.set("content-type", object.httpMetadata.contentType);
    }

    return new NextResponse(object.body as any, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Erreur lecture R2:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
