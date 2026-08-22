import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const bucket = env.portfolio_images;
    const publicUrl = env.R2_PUBLIC_URL;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Fichier manquant ou invalide" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
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

    const isLocal = process.env.NODE_ENV === "development";
    const remoteUrl = `${publicUrl}/${key}`;
    const previewUrl = isLocal ? `/api/admin/assets/${key}` : remoteUrl;

    return NextResponse.json(
      { url: remoteUrl, previewUrl: previewUrl },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erreur d'upload vers R2");
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue lors de l'upload" },
      { status: 500 }
    );
  }
}
