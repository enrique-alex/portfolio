import { NextResponse } from "next/server";
import { getProjects } from "@/lib/db/projects";
import { Locale } from "@/lib/i18n";
import { Project } from "@/lib/data";

interface ErrorResponse {
  error: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const localeParam = searchParams.get("locale");

    // Validation stricte de la locale, fallback sur 'fr'
    const locale: Locale = (localeParam === "fr" || localeParam === "en") ? localeParam : "fr";

    const projects = await getProjects(locale);

    return NextResponse.json<Project[]>(projects, {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: unknown) {
    console.error(
      JSON.stringify({
        level: "error",
        scope: "api.projects",
        message: "Erreur lors de la récupération des projets depuis D1",
        error: error instanceof Error ? error.message : String(error),
      })
    );

    return NextResponse.json<ErrorResponse>(
      { error: "Une erreur est survenue lors de la récupération des projets." },
      { status: 500 }
    );
  }
}
