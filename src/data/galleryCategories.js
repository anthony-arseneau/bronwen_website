// Shared by the frontend and server.js, so keep this file free of JSX and browser APIs.
// Items reference sections by id, so renaming a section never disconnects its artwork.
export const defaultGalleryCategories = [
  {
    id: 'photography',
    label: 'Photography',
    children: [
      { id: 'analog-film-not-souped', label: 'Analog film (not souped)' },
      { id: 'souped-film', label: 'Souped film' },
      { id: 'digital', label: 'Digital' },
    ],
  },
  { id: 'printmaking', label: 'Printmaking', children: [] },
  { id: 'sculptures', label: 'Sculptures', children: [] },
];

export const slugify = (label) => label
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const createCategoryId = (label) =>
  `${slugify(label) || 'section'}-${Date.now().toString(36)}`;

const getSlug = (category) => slugify(category.label) || category.id;

export const getCategoryPath = (categories, id) => {
  for (const category of categories) {
    if (category.id === id) return `/gallery/${getSlug(category)}`;
    const child = category.children.find((item) => item.id === id);
    if (child) return `/gallery/${getSlug(category)}/${getSlug(child)}`;
  }
  return '/gallery';
};

// Resolves "photography/digital" to { category, parent }.
export const findCategoryByPath = (categories, path) => {
  const [sectionSlug, subsectionSlug] = path.split('/').filter(Boolean);
  const parent = categories.find((category) => getSlug(category) === sectionSlug);
  if (!parent) return null;
  if (!subsectionSlug) return { category: parent, parent: null };
  const child = parent.children.find((category) => getSlug(category) === subsectionSlug);
  return child ? { category: child, parent } : null;
};

export const getCategoryOptions = (categories) => categories.flatMap((category) => [
  { value: category.id, label: category.label },
  ...category.children.map((child) => ({
    value: child.id,
    label: `${category.label} / ${child.label}`,
  })),
]);

export const getCategoryLabel = (categories, id) =>
  getCategoryOptions(categories).find((option) => option.value === id)?.label || 'Uncategorized';

// A section page also shows the work filed under its subsections.
export const getCategoryIdsWithin = (category) =>
  [category.id, ...(category.children || []).map((child) => child.id)];
