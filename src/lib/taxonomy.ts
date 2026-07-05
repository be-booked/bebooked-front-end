/**
 * Two-tier industry taxonomy.
 * - INDUSTRIES: top-level category keys and display labels
 * - SPECIALTIES: specialties scoped per industry key
 *
 * Stored in DB as text arrays (industry[], specialties[]).
 * Update this file as the taxonomy grows — no migration needed.
 */

export const INDUSTRIES = [
  { value: "hair",       label: "Hair" },
  { value: "nails",      label: "Nails" },
  { value: "waxing",     label: "Waxing" },
  { value: "lashes",     label: "Lashes" },
  { value: "brows",      label: "Brows" },
  { value: "esthetics",  label: "Esthetics / Skin" },
  { value: "makeup",     label: "Makeup" },
  { value: "body",       label: "Body" },
] as const;

export type IndustryValue = (typeof INDUSTRIES)[number]["value"];

export const SPECIALTIES: Record<IndustryValue, { value: string; label: string }[]> = {
  hair: [
    { value: "balayage",          label: "Balayage" },
    { value: "highlights",        label: "Highlights" },
    { value: "color",             label: "Color" },
    { value: "cut_style",         label: "Cut & Style" },
    { value: "natural_hair",      label: "Natural Hair" },
    { value: "locs",              label: "Locs / Dreadlocks" },
    { value: "braids",            label: "Box Braids / Cornrows" },
    { value: "extensions_weaves", label: "Extensions / Weaves" },
    { value: "relaxer",           label: "Relaxer" },
    { value: "keratin",           label: "Keratin Treatment" },
  ],
  nails: [
    { value: "gel",        label: "Gel / Gel-X" },
    { value: "acrylic",    label: "Acrylic / Sculpted" },
    { value: "dip_powder", label: "Dip Powder" },
    { value: "nail_art",   label: "Nail Art" },
    { value: "manicure",   label: "Manicure" },
    { value: "pedicure",   label: "Pedicure" },
  ],
  waxing: [
    { value: "brazilian",  label: "Brazilian" },
    { value: "bikini",     label: "Bikini" },
    { value: "full_body",  label: "Full Body" },
    { value: "facial_wax", label: "Facial (lip, brow, chin)" },
    { value: "legs_arms",  label: "Legs / Arms" },
  ],
  lashes: [
    { value: "classic",          label: "Classic" },
    { value: "volume",           label: "Volume / Mega Volume" },
    { value: "hybrid",           label: "Hybrid" },
    { value: "lash_lift_tint",   label: "Lash Lift & Tint" },
  ],
  brows: [
    { value: "microblading",     label: "Microblading" },
    { value: "ombre_powder",     label: "Ombre / Powder Brows" },
    { value: "brow_lamination",  label: "Brow Lamination" },
    { value: "tinting_shaping",  label: "Tinting & Shaping" },
  ],
  esthetics: [
    { value: "facials",          label: "Facials" },
    { value: "chemical_peels",   label: "Chemical Peels" },
    { value: "dermaplaning",     label: "Dermaplaning" },
    { value: "microneedling",    label: "Microneedling" },
    { value: "hydrafacial",      label: "Hydrafacial" },
  ],
  makeup: [
    { value: "bridal",           label: "Bridal" },
    { value: "glam_editorial",   label: "Glam / Editorial" },
    { value: "special_occasion", label: "Special Occasion" },
  ],
  body: [
    { value: "massage",          label: "Massage" },
    { value: "spray_tan",        label: "Spray Tan" },
    { value: "body_wraps",       label: "Body Wraps" },
  ],
};

/** All specialty values for a given set of industry selections. */
export function specialtiesForIndustries(
  industries: string[]
): { value: string; label: string }[] {
  return industries.flatMap(
    (ind) => SPECIALTIES[ind as IndustryValue] ?? []
  );
}
