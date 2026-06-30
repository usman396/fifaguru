import type { Team } from "./types";

// WC2026 Round of 32 qualified teams
// 32 teams arranged as 16 first-round matchups (seeded bracket)
export const TEAMS: Record<string, Team> = {
  ARG: { code: "ARG", name: "Argentina",       flag: "🇦🇷", alpha2: "ar" },
  AUS: { code: "AUS", name: "Australia",        flag: "🇦🇺", alpha2: "au" },
  AUT: { code: "AUT", name: "Austria",          flag: "🇦🇹", alpha2: "at" },
  BEL: { code: "BEL", name: "Belgium",          flag: "🇧🇪", alpha2: "be" },
  BIH: { code: "BIH", name: "Bosnia & Herz.",   flag: "🇧🇦", alpha2: "ba" },
  BRA: { code: "BRA", name: "Brazil",           flag: "🇧🇷", alpha2: "br" },
  CAN: { code: "CAN", name: "Canada",           flag: "🇨🇦", alpha2: "ca" },
  CIV: { code: "CIV", name: "Côte d'Ivoire",    flag: "🇨🇮", alpha2: "ci" },
  COD: { code: "COD", name: "DR Congo",         flag: "🇨🇩", alpha2: "cd" },
  COL: { code: "COL", name: "Colombia",         flag: "🇨🇴", alpha2: "co" },
  CPV: { code: "CPV", name: "Cape Verde",       flag: "🇨🇻", alpha2: "cv" },
  DZA: { code: "DZA", name: "Algeria",          flag: "🇩🇿", alpha2: "dz" },
  ECU: { code: "ECU", name: "Ecuador",          flag: "🇪🇨", alpha2: "ec" },
  EGY: { code: "EGY", name: "Egypt",            flag: "🇪🇬", alpha2: "eg" },
  ENG: { code: "ENG", name: "England",          flag: "🏴",  alpha2: "gb-eng" },
  ESP: { code: "ESP", name: "Spain",            flag: "🇪🇸", alpha2: "es" },
  FRA: { code: "FRA", name: "France",           flag: "🇫🇷", alpha2: "fr" },
  DEU: { code: "DEU", name: "Germany",          flag: "🇩🇪", alpha2: "de" },
  GHA: { code: "GHA", name: "Ghana",            flag: "🇬🇭", alpha2: "gh" },
  HRV: { code: "HRV", name: "Croatia",          flag: "🇭🇷", alpha2: "hr" },
  JPN: { code: "JPN", name: "Japan",            flag: "🇯🇵", alpha2: "jp" },
  MAR: { code: "MAR", name: "Morocco",          flag: "🇲🇦", alpha2: "ma" },
  MEX: { code: "MEX", name: "Mexico",           flag: "🇲🇽", alpha2: "mx" },
  NLD: { code: "NLD", name: "Netherlands",      flag: "🇳🇱", alpha2: "nl" },
  NOR: { code: "NOR", name: "Norway",           flag: "🇳🇴", alpha2: "no" },
  PRY: { code: "PRY", name: "Paraguay",         flag: "🇵🇾", alpha2: "py" },
  PRT: { code: "PRT", name: "Portugal",         flag: "🇵🇹", alpha2: "pt" },
  SEN: { code: "SEN", name: "Senegal",          flag: "🇸🇳", alpha2: "sn" },
  CHE: { code: "CHE", name: "Switzerland",      flag: "🇨🇭", alpha2: "ch" },
  USA: { code: "USA", name: "United States",    flag: "🇺🇸", alpha2: "us" },
  ZAF: { code: "ZAF", name: "South Africa",     flag: "🇿🇦", alpha2: "za" },
  SWE: { code: "SWE", name: "Sweden",           flag: "🇸🇪", alpha2: "se" },
};

// 16 R32 matchups — ordered to match the actual bracket tree
// Pairs feed R16 slots: [0,1]→r16_0, [2,3]→r16_1 … [14,15]→r16_7
// Bracket: r16_0+r16_1→qf_0, r16_2+r16_3→qf_1, r16_4+r16_5→qf_2, r16_6+r16_7→qf_3
//          qf_0+qf_1→sf_0, qf_2+qf_3→sf_1, sf_0+sf_1→final
export const R32_MATCHUPS: [string, string][] = [
  // → r16_0 (R16 M89: W74 vs W77)
  ["DEU", "PRY"], // M74 Jun 29
  ["FRA", "SWE"], // M77 Jun 30
  // → r16_1 (R16 M90: W73 vs W75)
  ["ZAF", "CAN"], // M73 Jun 28
  ["NLD", "MAR"], // M75 Jun 29
  // → r16_2 (R16 M93: W83 vs W84)
  ["PRT", "HRV"], // M83 Jul 2
  ["ESP", "AUT"], // M84 Jul 2
  // → r16_3 (R16 M94: W81 vs W82)
  ["USA", "BIH"], // M81 Jul 1
  ["BEL", "SEN"], // M82 Jul 1
  // → r16_4 (R16 M91: W76 vs W78)
  ["BRA", "JPN"], // M76 Jun 29
  ["CIV", "NOR"], // M78 Jun 30
  // → r16_5 (R16 M92: W79 vs W80)
  ["MEX", "ECU"], // M79 Jun 30
  ["ENG", "COD"], // M80 Jul 1
  // → r16_6 (R16 M95: W86 vs W88)
  ["ARG", "CPV"], // M86 Jul 3
  ["AUS", "EGY"], // M88 Jul 3
  // → r16_7 (R16 M96: W85 vs W87)
  ["CHE", "DZA"], // M85 Jul 2
  ["COL", "GHA"], // M87 Jul 3
];
