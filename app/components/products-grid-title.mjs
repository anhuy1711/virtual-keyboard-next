/**
 * @param {{
 *   searchName?: string;
 *   selectedCategoryId?: number;
 *   categories?: Array<{ id: number; name: string }>;
 * }} params
 */
export function getProductsGridTitle({
  searchName = "",
  selectedCategoryId,
  categories = [],
}) {
  const trimmedSearch = searchName.trim();
  if (trimmedSearch) {
    return `Tìm kiếm: ${trimmedSearch}`;
  }

  if (typeof selectedCategoryId === "number") {
    const category = categories.find((item) => item.id === selectedCategoryId);
    if (category?.name?.trim()) {
      return category.name.trim();
    }
  }

  return "Bàn phím";
}
