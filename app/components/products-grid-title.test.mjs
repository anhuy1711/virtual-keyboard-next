import assert from "node:assert/strict";
import test from "node:test";
import { getProductsGridTitle } from "./products-grid-title.mjs";

test("getProductsGridTitle uses category name for category-filtered pages", () => {
  const title = getProductsGridTitle({
    selectedCategoryId: 2,
    categories: [
      { id: 1, name: "Bàn phím" },
      { id: 2, name: "Switch" },
      { id: 3, name: "Keycap" },
    ],
  });

  assert.equal(title, "Switch");
});

test("getProductsGridTitle uses search keyword before category", () => {
  const title = getProductsGridTitle({
    searchName: "silent switch",
    selectedCategoryId: 2,
    categories: [{ id: 2, name: "Switch" }],
  });

  assert.equal(title, "Tìm kiếm: silent switch");
});

test("getProductsGridTitle falls back to keyboard title", () => {
  assert.equal(getProductsGridTitle({}), "Bàn phím");
});
