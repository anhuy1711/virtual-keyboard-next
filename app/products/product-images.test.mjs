import assert from "node:assert/strict";
import test from "node:test";
import { buildProductGalleryImages } from "./product-images.mjs";

test("buildProductGalleryImages puts cover first then unique sku images", () => {
  const images = buildProductGalleryImages({
    cover: "/cover.jpg",
    skus: [
      { id: 1, sku: "SKU-1", imageUrl: "/sku-1.jpg" },
      { id: 2, sku: "SKU-2", imageUrl: "/cover.jpg" },
      { id: 3, sku: "SKU-3", imageUrl: "/sku-1.jpg" },
      { id: 4, sku: "SKU-4", imageUrl: "/sku-4.jpg" },
    ],
  });

  assert.deepEqual(
    images.map((image) => image.imageUrl),
    ["/cover.jpg", "/sku-1.jpg", "/sku-4.jpg"]
  );
  assert.equal(images[0].type, "cover");
  assert.equal(images[1].type, "sku");
});
