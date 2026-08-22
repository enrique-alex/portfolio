"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ProjectFormInput } from "@/lib/validation/project";
import { Loader2 } from "lucide-react";

interface ProjectFormProps {
  mode: "create" | "edit";
  initialData?: ProjectFormInput & { id: string };
}

export function ProjectForm({ mode, initialData }: ProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [slugWarning, setSlugWarning] = useState(false);

  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialData?.coverImage ?? null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(initialData?.coverImage ?? null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [galleryItems, setGalleryItems] = useState<{ url: string; preview: string }[]>(
    (initialData?.gallery ?? []).map((url) => ({ url, preview: url }))
  );
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // Revoke object URLs on unmount to avoid memory leaks
  const objectUrlsRef = useRef<string[]>([]);
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const createLocalPreview = (file: File): string => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    return url;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    setCoverImagePreview(createLocalPreview(file));
    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        alert(data.error || "Erreur lors de l'upload de l'image de couverture.");
        // Revert preview on failure
        setCoverImagePreview(null);
        return;
      }
      const data = (await res.json()) as { url: string };
      setCoverImageUrl(data.url);
    } catch (err) {
      alert("Erreur réseau inattendue lors de l'upload.");
      setCoverImagePreview(null);
    } finally {
      setIsUploadingCover(false);
      e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Create instant local previews for all files
    const localPreviews: { url: string; preview: string; pending: boolean }[] = [];
    for (let i = 0; i < files.length; i++) {
      localPreviews.push({
        url: "",
        preview: createLocalPreview(files[i]),
        pending: true,
      });
    }
    const startIndex = galleryItems.length;
    setGalleryItems((prev) => [...prev, ...localPreviews.map(({ preview }) => ({ url: "", preview }))]);

    setIsUploadingGallery(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = (await res.json()) as { url: string };
          // Update the gallery item with the real URL
          setGalleryItems((prev) =>
            prev.map((item, idx) =>
              idx === startIndex + i ? { ...item, url: data.url } : item
            )
          );
        } else {
          const data = (await res.json()) as { error?: string };
          alert(`Erreur pour ${files[i].name} : ${data.error || "Erreur d'upload"}`);
          // Remove the failed preview
          setGalleryItems((prev) => prev.filter((_, idx) => idx !== startIndex + i));
        }
      }
    } catch (err) {
      alert("Erreur réseau inattendue lors de l'upload.");
    } finally {
      setIsUploadingGallery(false);
      e.target.value = "";
    }
  };

  const removeGalleryItem = (urlToRemove: string) => {
    setGalleryItems((prev) => prev.filter((item) => item.url !== urlToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, FormDataEntryValue> = Object.fromEntries(formData.entries());

    // Transformations
    const payload: Record<string, unknown> = {
      ...data,
      year: parseInt(data.year as string, 10),
      technologies: (data.technologies as string).split(",").map((t) => t.trim()).filter(Boolean),
      themeColorR: parseInt(data.themeColorR as string, 10),
      themeColorG: parseInt(data.themeColorG as string, 10),
      themeColorB: parseInt(data.themeColorB as string, 10),
      sortOrder: parseInt(data.sortOrder as string, 10),
      gallery: (data.gallery as string).split(",").map((t) => t.trim()).filter(Boolean),
      isFeatured: formData.get("isFeatured") === "on",
    };

    if (Array.isArray(payload.gallery) && payload.gallery.length === 0) payload.gallery = null;
    if (!payload.githubUrl) payload.githubUrl = null;
    if (!payload.coverImage) payload.coverImage = null;

    try {
      const url = mode === "create" ? "/api/admin/projects" : `/api/admin/projects/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const result = (await res.json()) as { errors?: string[]; error?: string };
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors([result.error || "Une erreur est survenue lors de l'enregistrement."]);
        }
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrors(["Erreur réseau inattendue."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === "edit" && initialData?.slug !== e.target.value) {
      setSlugWarning(true);
    } else {
      setSlugWarning(false);
    }
  };

  const inputClass = "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200 dark:bg-red-900/20 dark:border-red-900/50">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {errors.length === 1 ? "Il y a une erreur dans le formulaire" : `Il y a ${errors.length} erreurs dans le formulaire`}
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <ul className="list-disc pl-5 space-y-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SECTION COMMUNE */}
      <div className="rounded-2xl border border-zinc-200/50 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-white/10 dark:bg-[#0a0a0a]/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Informations Générales</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                id="isFeatured"
                defaultChecked={initialData?.isFeatured ?? false}
                className="h-5 w-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Mettre en avant (carte plus grande sur l'accueil)
              </span>
            </label>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Conseil : Ne pas dépasser 2 à 4 projets mis en avant simultanément pour garder une grille harmonieuse.
            </p>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="slug" className={labelClass}>Slug</label>
            <input
              type="text"
              name="slug"
              id="slug"
              required
              defaultValue={initialData?.slug}
              onChange={handleSlugChange}
              pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
              className={inputClass}
              aria-label="Slug du projet"
            />
            {slugWarning && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ Attention : Modifier le slug cassera les liens existants vers ce projet.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="year" className={labelClass}>Année</label>
            <input
              type="number"
              name="year"
              id="year"
              required
              min="2000"
              max="2030"
              defaultValue={initialData?.year ?? new Date().getFullYear()}
              className={inputClass}
              aria-label="Année de réalisation"
            />
          </div>

          <div>
            <label htmlFor="sortOrder" className={labelClass}>Ordre de tri</label>
            <input
              type="number"
              name="sortOrder"
              id="sortOrder"
              required
              min="0"
              defaultValue={initialData?.sortOrder ?? 0}
              className={inputClass}
              aria-label="Ordre d'affichage dans la liste"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="technologies" className={labelClass}>Technologies (séparées par des virgules)</label>
            <input
              type="text"
              name="technologies"
              id="technologies"
              required
              defaultValue={initialData?.technologies?.join(", ")}
              placeholder="React, Next.js, TypeScript"
              className={inputClass}
              aria-label="Technologies utilisées"
            />
          </div>

          <div className="sm:col-span-2">
            <p className={labelClass}>Couleur du Thème (RGB)</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="themeColorR" className="sr-only">Rouge</label>
                <input type="number" name="themeColorR" id="themeColorR" required min="0" max="255" defaultValue={initialData?.themeColorR ?? 255} className={inputClass} placeholder="R" aria-label="Composante rouge" />
              </div>
              <div>
                <label htmlFor="themeColorG" className="sr-only">Vert</label>
                <input type="number" name="themeColorG" id="themeColorG" required min="0" max="255" defaultValue={initialData?.themeColorG ?? 255} className={inputClass} placeholder="G" aria-label="Composante verte" />
              </div>
              <div>
                <label htmlFor="themeColorB" className="sr-only">Bleu</label>
                <input type="number" name="themeColorB" id="themeColorB" required min="0" max="255" defaultValue={initialData?.themeColorB ?? 255} className={inputClass} placeholder="B" aria-label="Composante bleue" />
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="githubUrl" className={labelClass}>URL GitHub (optionnel)</label>
            <input
              type="url"
              name="githubUrl"
              id="githubUrl"
              defaultValue={initialData?.githubUrl || ""}
              placeholder="https://github.com/..."
              className={inputClass}
              aria-label="Lien vers le dépôt GitHub"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Image de couverture (optionnel)</label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/webp,image/png,image/jpeg"
                onChange={handleCoverUpload}
                disabled={isUploadingCover}
                className={inputClass}
                aria-label="Upload de l'image de couverture"
              />
              {isUploadingCover && <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Upload en cours...</p>}
              {coverImagePreview && (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImagePreview} alt="Prévisualisation couverture" className="h-32 w-auto rounded-lg object-cover shadow-sm border border-zinc-200 dark:border-white/10" />
                  <button
                    type="button"
                    onClick={() => { setCoverImageUrl(null); setCoverImagePreview(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                    aria-label="Supprimer l'image de couverture"
                  >
                    <span className="sr-only">Supprimer</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}
            </div>
            <input type="hidden" name="coverImage" value={coverImageUrl ?? ""} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Galerie (optionnel)</label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/webp,image/png,image/jpeg"
                multiple
                onChange={handleGalleryUpload}
                disabled={isUploadingGallery}
                className={inputClass}
                aria-label="Upload d'images pour la galerie"
              />
              {isUploadingGallery && <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Upload en cours...</p>}
              {galleryItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {galleryItems.map((item, i) => (
                    <div key={i} className="relative inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.preview} alt={`Prévisualisation galerie ${i + 1}`} className="h-24 w-full rounded-lg object-cover shadow-sm border border-zinc-200 dark:border-white/10" />
                      <button
                        type="button"
                        onClick={() => removeGalleryItem(item.url)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                        aria-label={`Supprimer l'image ${i + 1} de la galerie`}
                      >
                        <span className="sr-only">Supprimer</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input type="hidden" name="gallery" value={galleryItems.map(item => item.url).filter(Boolean).join(",")} />
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION FR */}
        <div className="rounded-2xl border border-blue-200/50 bg-blue-50/50 backdrop-blur-md p-6 shadow-sm dark:border-blue-900/30 dark:bg-blue-900/10">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
            <span className="text-xl">🇫🇷</span> Version Française
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="titleFr" className={labelClass}>Titre</label>
              <input type="text" name="titleFr" id="titleFr" required maxLength={200} defaultValue={initialData?.titleFr} className={inputClass} aria-label="Titre en français" />
            </div>
            <div>
              <label htmlFor="categoryFr" className={labelClass}>Catégorie</label>
              <input type="text" name="categoryFr" id="categoryFr" required maxLength={200} defaultValue={initialData?.categoryFr} className={inputClass} aria-label="Catégorie en français" />
            </div>
            <div>
              <label htmlFor="shortDescriptionFr" className={labelClass}>Description courte</label>
              <textarea name="shortDescriptionFr" id="shortDescriptionFr" required maxLength={300} rows={3} defaultValue={initialData?.shortDescriptionFr} className={inputClass} aria-label="Description courte en français" />
            </div>
            <div>
              <label htmlFor="detailedDescriptionFr" className={labelClass}>Description détaillée</label>
              <textarea name="detailedDescriptionFr" id="detailedDescriptionFr" required maxLength={5000} rows={5} defaultValue={initialData?.detailedDescriptionFr} className={inputClass} aria-label="Description détaillée en français" />
            </div>
            <div>
              <label htmlFor="technicalChallengesFr" className={labelClass}>Défis techniques</label>
              <textarea name="technicalChallengesFr" id="technicalChallengesFr" required maxLength={5000} rows={5} defaultValue={initialData?.technicalChallengesFr} className={inputClass} aria-label="Défis techniques en français" />
            </div>
            <div>
              <label htmlFor="impactFr" className={labelClass}>Impact</label>
              <textarea name="impactFr" id="impactFr" required maxLength={5000} rows={3} defaultValue={initialData?.impactFr} className={inputClass} aria-label="Impact en français" />
            </div>
          </div>
        </div>

        {/* SECTION EN */}
        <div className="rounded-2xl border border-red-200/50 bg-red-50/50 backdrop-blur-md p-6 shadow-sm dark:border-red-900/30 dark:bg-red-900/10">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
            <span className="text-xl">🇬🇧</span> Version Anglaise
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="titleEn" className={labelClass}>Titre</label>
              <input type="text" name="titleEn" id="titleEn" required maxLength={200} defaultValue={initialData?.titleEn} className={inputClass} aria-label="Titre en anglais" />
            </div>
            <div>
              <label htmlFor="categoryEn" className={labelClass}>Catégorie</label>
              <input type="text" name="categoryEn" id="categoryEn" required maxLength={200} defaultValue={initialData?.categoryEn} className={inputClass} aria-label="Catégorie en anglais" />
            </div>
            <div>
              <label htmlFor="shortDescriptionEn" className={labelClass}>Description courte</label>
              <textarea name="shortDescriptionEn" id="shortDescriptionEn" required maxLength={300} rows={3} defaultValue={initialData?.shortDescriptionEn} className={inputClass} aria-label="Description courte en anglais" />
            </div>
            <div>
              <label htmlFor="detailedDescriptionEn" className={labelClass}>Description détaillée</label>
              <textarea name="detailedDescriptionEn" id="detailedDescriptionEn" required maxLength={5000} rows={5} defaultValue={initialData?.detailedDescriptionEn} className={inputClass} aria-label="Description détaillée en anglais" />
            </div>
            <div>
              <label htmlFor="technicalChallengesEn" className={labelClass}>Défis techniques</label>
              <textarea name="technicalChallengesEn" id="technicalChallengesEn" required maxLength={5000} rows={5} defaultValue={initialData?.technicalChallengesEn} className={inputClass} aria-label="Défis techniques en anglais" />
            </div>
            <div>
              <label htmlFor="impactEn" className={labelClass}>Impact</label>
              <textarea name="impactEn" id="impactEn" required maxLength={5000} rows={3} defaultValue={initialData?.impactEn} className={inputClass} aria-label="Impact en anglais" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Créer le projet" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
