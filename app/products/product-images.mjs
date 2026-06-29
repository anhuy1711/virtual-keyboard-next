/**
 * @param {{
 *   cover?: string;
 *   skus?: Array<{ id: number; sku?: string; imageUrl?: string }>;
 * }} product
 * @returns {Array<{ id: string | number; type: "cover" | "sku"; imageUrl: string; sku?: string }>}
 */
export function buildProductGalleryImages(product) {
  const images = [];
  const seen = new Set();

  const addImage = (image) => {
    if (!image.imageUrl || seen.has(image.imageUrl)) return;
    seen.add(image.imageUrl);
    images.push(image);
  };

  addImage({
    id: "cover",
    type: "cover",
    imageUrl: product.cover || "",
  });

  for (const sku of product.skus || []) {
    addImage({
      id: sku.id,
      type: "sku",
      imageUrl: sku.imageUrl || "",
      sku: sku.sku,
    });
  }

  return images;
}
