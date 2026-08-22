// Cette valeur doit rester synchronisée avec R2_PUBLIC_URL dans wrangler.toml si elle change un jour (ex: migration vers domaine personnalisé)
const R2_PUBLIC_URL_PATTERN = 'pub-f2abb97fd5a44520b79d8e56bf020956\\.r2\\.dev';

export interface ProjectFormInput {
  slug: string;
  year: number;
  technologies: string[];
  themeColorR: number;
  themeColorG: number;
  themeColorB: number;
  githubUrl: string | null;
  coverImage: string | null;
  gallery: string[] | null;
  sortOrder: number;
  isFeatured: boolean;
  titleFr: string;
  categoryFr: string;
  shortDescriptionFr: string;
  detailedDescriptionFr: string;
  technicalChallengesFr: string;
  impactFr: string;
  titleEn: string;
  categoryEn: string;
  shortDescriptionEn: string;
  detailedDescriptionEn: string;
  technicalChallengesEn: string;
  impactEn: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: ProjectFormInput;
}

export function validateProjectInput(
  raw: unknown,
  existingSlugs: string[],
  currentProjectCount: number
): ValidationResult {
  const errors: string[] = [];

  if (typeof raw !== 'object' || raw === null) {
    return { valid: false, errors: ['Données invalides.'] };
  }

  const data = raw as Record<string, unknown>;

  // validation slug
  const slug = data.slug;
  if (
    typeof slug !== 'string' ||
    !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) ||
    slug.length < 3 ||
    slug.length > 100
  ) {
    errors.push(
      'Le slug doit contenir entre 3 et 100 caractères, uniquement des lettres minuscules, des chiffres et des tirets.'
    );
  } else if (existingSlugs.includes(slug)) {
    errors.push('Ce slug est déjà utilisé par un autre projet.');
  }

  // validation year
  const year = data.year;
  if (typeof year !== 'number' || year < 2000 || year > 2030 || !Number.isInteger(year)) {
    errors.push("L'année doit être un nombre entier compris entre 2000 et 2030.");
  }

  // validation technologies
  const technologies = data.technologies;
  if (
    !Array.isArray(technologies) ||
    technologies.length < 1 ||
    technologies.length > 20 ||
    !technologies.every((t) => typeof t === 'string' && t.length >= 1 && t.length <= 50)
  ) {
    errors.push('Les technologies doivent être une liste de 1 à 20 éléments, de 50 caractères maximum chacun.');
  }

  // validation themeColor
  const themeColorR = data.themeColorR;
  const themeColorG = data.themeColorG;
  const themeColorB = data.themeColorB;
  const isValidColor = (c: unknown) => typeof c === 'number' && Number.isInteger(c) && c >= 0 && c <= 255;
  if (!isValidColor(themeColorR) || !isValidColor(themeColorG) || !isValidColor(themeColorB)) {
    errors.push('Les couleurs du thème (RGB) doivent être des nombres entiers entre 0 et 255.');
  }

  // validation githubUrl
  let githubUrl = data.githubUrl;
  if (githubUrl === '') githubUrl = null;
  if (githubUrl !== null) {
    if (typeof githubUrl !== 'string' || !githubUrl.startsWith('https://')) {
      errors.push('L\'URL GitHub doit commencer exactement par "https://".');
    }
  }

  const localImageRegex = /^\/image\/projects\/[a-zA-Z0-9._-]+\.(webp|png|jpe?g|svg)$/;
  const r2ImageRegex = new RegExp(`^https://${R2_PUBLIC_URL_PATTERN}/[a-zA-Z0-9._-]+\\.(webp|png|jpe?g)$`);

  // validation coverImage
  let coverImage = data.coverImage;
  if (coverImage === '') coverImage = null;
  if (coverImage !== null) {
    if (typeof coverImage !== 'string' || (!localImageRegex.test(coverImage) && !r2ImageRegex.test(coverImage))) {
      errors.push("L'image de couverture doit respecter le format /image/projects/*.{webp,png,jpg,jpeg,svg} ou une URL R2 valide.");
    }
  }

  // validation gallery
  let gallery = data.gallery;
  if (gallery === '' || (Array.isArray(gallery) && gallery.length === 0)) gallery = null;
  if (gallery !== null) {
    if (Array.isArray(gallery)) {
      if (!gallery.every((img) => typeof img === 'string' && (localImageRegex.test(img) || r2ImageRegex.test(img)))) {
        errors.push("Chaque image de la galerie doit respecter le format /image/projects/*.{webp,png,jpg,jpeg,svg} ou une URL R2 valide.");
      }
    } else {
      errors.push("La galerie doit être une liste d'images.");
    }
  }

  // validation sortOrder
  const sortOrder = data.sortOrder;
  if (typeof sortOrder !== 'number' || sortOrder < 0 || sortOrder > currentProjectCount || !Number.isInteger(sortOrder)) {
    errors.push(`L'ordre de tri doit être un entier entre 0 et ${currentProjectCount} inclus.`);
  }

  // validation isFeatured
  let isFeatured = data.isFeatured;
  if (isFeatured === undefined) {
    isFeatured = false;
  } else if (typeof isFeatured !== 'boolean') {
    errors.push("Le champ 'isFeatured' doit être un booléen.");
  }

  // validation strings
  const validateString = (val: unknown, name: string, maxLen: number) => {
    if (typeof val !== 'string' || val.trim().length === 0) {
      errors.push(`Le champ ${name} est requis et ne peut pas être vide.`);
      return false;
    }
    if (val.length > maxLen) {
      errors.push(`Le champ ${name} ne doit pas dépasser ${maxLen} caractères.`);
      return false;
    }
    return true;
  };

  validateString(data.titleFr, 'Titre (FR)', 200);
  validateString(data.categoryFr, 'Catégorie (FR)', 200);
  validateString(data.shortDescriptionFr, 'Description Courte (FR)', 300);
  validateString(data.detailedDescriptionFr, 'Description Détaillée (FR)', 5000);
  validateString(data.technicalChallengesFr, 'Défis Techniques (FR)', 5000);
  validateString(data.impactFr, 'Impact (FR)', 5000);

  validateString(data.titleEn, 'Titre (EN)', 200);
  validateString(data.categoryEn, 'Catégorie (EN)', 200);
  validateString(data.shortDescriptionEn, 'Description Courte (EN)', 300);
  validateString(data.detailedDescriptionEn, 'Description Détaillée (EN)', 5000);
  validateString(data.technicalChallengesEn, 'Défis Techniques (EN)', 5000);
  validateString(data.impactEn, 'Impact (EN)', 5000);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const finalData: ProjectFormInput = {
    slug: slug as string,
    year: year as number,
    technologies: technologies as string[],
    themeColorR: themeColorR as number,
    themeColorG: themeColorG as number,
    themeColorB: themeColorB as number,
    githubUrl: githubUrl as string | null,
    coverImage: coverImage as string | null,
    gallery: gallery as string[] | null,
    sortOrder: sortOrder as number,
    isFeatured: isFeatured as boolean,
    titleFr: (data.titleFr as string).trim(),
    categoryFr: (data.categoryFr as string).trim(),
    shortDescriptionFr: (data.shortDescriptionFr as string).trim(),
    detailedDescriptionFr: (data.detailedDescriptionFr as string).trim(),
    technicalChallengesFr: (data.technicalChallengesFr as string).trim(),
    impactFr: (data.impactFr as string).trim(),
    titleEn: (data.titleEn as string).trim(),
    categoryEn: (data.categoryEn as string).trim(),
    shortDescriptionEn: (data.shortDescriptionEn as string).trim(),
    detailedDescriptionEn: (data.detailedDescriptionEn as string).trim(),
    technicalChallengesEn: (data.technicalChallengesEn as string).trim(),
    impactEn: (data.impactEn as string).trim(),
  };

  return { valid: true, errors: [], data: finalData };
}
