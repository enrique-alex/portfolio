import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

const VALID_ASSET_KEY_REGEX = /^[a-zA-Z0-9._-]+\.(webp|png|jpe?g)$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;

    if (!VALID_ASSET_KEY_REGEX.test(key)) {
      return new NextResponse("Invalid asset key", { status: 400 });
    }

    const { env } = getCloudflareContext();
    const bucket = env.portfolio_images;

    const object = await bucket.get(key);

    if (!object) {
      return new NextResponse("Not found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers as unknown as Headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "private, max-age=3600");

    if (object.httpMetadata?.contentType) {
      headers.set("content-type", object.httpMetadata.contentType);
    }

    return new NextResponse(object.body as unknown as BodyInit, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    console.error(
      JSON.stringify({
        level: "error",
        scope: "api.admin.assets",
        message: "Erreur lecture objet R2",
        error: error instanceof Error ? error.message : String(error),
      })
    );
    return new NextResponse("Internal Error", { status: 500 });
  }
}
