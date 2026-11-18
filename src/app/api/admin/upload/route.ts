import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function isLocalRequest(requestUrl: string): boolean {
  try {
    const { hostname } = new URL(requestUrl);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const bucket = env.portfolio_images;
    const publicUrl = env.R2_PUBLIC_URL;

    if (!bucket || !publicUrl) {
      console.error(
        JSON.stringify({
          level: "error",
          scope: "api.admin.upload",
          message: "Bindings R2 manquants (portfolio_images ou R2_PUBLIC_URL)",
        })
      );
      return NextResponse.json(
        { error: "Configuration de stockage R2 incomplète" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Fichier manquant ou invalide" },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Le fichier dépasse la taille maximale de 5 Mo" },
        { status: 400 }
      );
    }

    const mimeType = file.type;
    let extension = "";

    if (mimeType === "image/webp") {
      extension = ".webp";
    } else if (mimeType === "image/png") {
      extension = ".png";
    } else if (mimeType === "image/jpeg") {
      extension = ".jpg";
    } else {
      return NextResponse.json(
        { error: "Type de fichier non autorisé. Uniquement webp, png ou jpeg." },
        { status: 400 }
      );
    }

    const key = crypto.randomUUID() + extension;
    const arrayBuffer = await file.arrayBuffer();

    await bucket.put(key, arrayBuffer, {
      httpMetadata: { contentType: mimeType },
    });

    const isLocal = process.env.NODE_ENV === "development" || isLocalRequest(request.url);
    const normalizedBaseUrl = publicUrl.replace(/\/+$/, "");
    const remoteUrl = `${normalizedBaseUrl}/${key}`;
    const previewUrl = isLocal ? `/api/admin/assets/${key}` : remoteUrl;

    return NextResponse.json(
      { url: remoteUrl, previewUrl },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      JSON.stringify({
        level: "error",
        scope: "api.admin.upload",
        message: "Erreur d'upload vers R2",
        error: error instanceof Error ? error.message : String(error),
      })
    );
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue lors de l'upload" },
      { status: 500 }
    );
  }
}
