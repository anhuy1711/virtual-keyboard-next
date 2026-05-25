import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["app"];
const extensions = new Set([".tsx"]);
const forbidden = [
  "Search",
  "Shopping Cart",
  "Account",
  "Admin Panel",
  "Premium Member",
  "Profile",
  "Orders",
  "Order History",
  "Items:",
  "Total:",
  "Payment:",
  "Keyboard Builder",
  "Choose kit",
  "Configure kit",
  "Choose switch",
  "Choose keycap",
  "Build name",
  "Selected options",
  "Save collection",
  "Add combo to cart",
  "Buy now",
  "Collection",
  "Ready for custom combo",
  "Stock",
  "Your Selection",
  "Remove",
  "Remove SKU",
  "Discount (10%)",
  "Secure Checkout",
  "Order Summary",
  "Back to My Orders",
  "Dashboard",
  "Add User",
  "Username",
  "Loading...",
  "Category Management",
  "Add Category",
  "Subtotal",
  "Shipping",
  "Free",
  "Dash",
  "Items",
  "Users",
  "User Info",
  "User Object",
  "Role Check",
  "No token found",
  "No user found",
  "No role found",
  "Subscribe",
  "Enter your email",
  "All rights reserved",
  "Shipping Information",
  "Audit Log",
  "No options yet",
  "Add Option Type",
];

const mojibakeMarkers = ["Ã", "Ä", "Æ", "áº", "á»", "â‚", "âœ"];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path, files);
    } else if (extensions.has(path.slice(path.lastIndexOf(".")))) {
      files.push(path);
    }
  }
  return files;
}

const failures = [];

function isUserFacingTerm(line, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`>${escaped}<`),
    new RegExp(`>\\s*${escaped}\\s*$`),
    new RegExp(`^\\s*${escaped}\\s*<`),
    new RegExp(`title=["']${escaped}["']`),
    new RegExp(`placeholder=["'][^"']*${escaped}[^"']*["']`),
    new RegExp(`aria-label=["']${escaped}["']`),
    new RegExp(`\\{[^}]*["'\`]${escaped}["'\`][^}]*\\}`),
    new RegExp(`:\\s*["'\`]${escaped}["'\`]`),
  ];

  return patterns.some((pattern) => pattern.test(line));
}

for (const root of roots) {
  for (const file of walk(root)) {
    const text = readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const term of forbidden) {
        if (line.includes(term) && isUserFacingTerm(line, term)) {
          failures.push(`${file}:${index + 1}: contains "${term}"`);
        }
      }
      for (const marker of mojibakeMarkers) {
        if (line.includes(marker)) {
          failures.push(`${file}:${index + 1}: contains mojibake marker "${marker}"`);
        }
      }
    });
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Vietnamese UI check passed.");
