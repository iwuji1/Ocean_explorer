function normGridId(v) {
  return String(v ?? "")
    .normalize("NFKC")
    .replace(/\u00A0/g, " ")   // NBSP -> space
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width chars
    .trim()
    .toLowerCase();
}
