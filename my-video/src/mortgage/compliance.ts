// COPY of C:\Users\Daniel\video-edits\remotion\src\compliance.ts (verbatim, 2026-09-24).
// Keep in sync with that file. No edits were needed: `npm run lint` (tsc, lib
// es2015) accepts it unchanged.

/**
 * ASIC RG 234 / NCCP advertising guards for Finance Hub & Networks.
 *
 * Source of truth for the term lists:
 *   ~/.claude/skills/finhub-internal-comms/references/asic-banned-phrases.md
 *
 * WHAT RG 234 ACTUALLY RESTRICTS (Daniel, 2026-08-24). The restricted terms are
 * restricted when they characterise a product or service WE promote. They are
 * not forbidden English and Vietnamese. Three uses are legitimate and must not
 * be blocked:
 *   - defining something ("LMI is the insurance you pay when...")
 *   - stating a negative, which is consumer-protective ("LMI is not free")
 *   - reporting a named third party's own words ("ANZ's document says X")
 *
 * The previous implementation scanned for bare words and threw on every
 * occurrence. That drifted from the reference table above in BOTH directions:
 * it blocked ordinary language the table never banned (easy, fast, simple,
 * cheap, immediate), while missing the phrases that actually carry licensing
 * risk ("financial advice" - FinHub holds an ACL, not an AFSL - "will qualify",
 * "instant approval"). Both are fixed here.
 *
 * DESIGN: default deny, with a declared escape hatch.
 * Nothing became advisory. "Vay tiền dễ dàng" ("borrow money easily") is a bare
 * word used promotionally and still hard-fails. What changed is that a hit can
 * be cleared by SAYING WHY, from a fixed set of reasons, and every clearance is
 * returned as an audit trail. Guessing intent automatically is not possible;
 * recording a human's declaration is, and it is what a licensee can show later.
 *
 * These throw rather than silently degrading: a video that renders with a
 * non-compliant claim is worse than one that fails to render.
 */

export const LICENSING_STATEMENT =
  "Finance Hub & Networks Pty Ltd | ACN 644 141 613 | Australian Credit Licence 573164";

/** Daniel is credit representative 369168 under Finance Hub's own ACL 573164. */
export const CREDIT_REP_STATEMENT =
  "Daniel Nguyen (Credit Representative 369168) is authorised under Australian Credit Licence 573164.";

/** Required in any marketing per the Advertising Requirements doc. */
export const DISCLAIMER_EN =
  "Your full financial situation would need to be reviewed prior to acceptance of any offer or product.";
export const DISCLAIMER_VI =
  "Tình hình tài chính đầy đủ của bạn cần được xem xét trước khi chấp nhận bất kỳ đề nghị hoặc sản phẩm nào.";

/**
 * TIER 1 - promotional by construction. A multi-word claim about what we or a
 * product will do for the reader. There is no way to write "guaranteed
 * approval" as a neutral definition, so only `quoted` and `negation` can clear
 * one of these; `definition` and `third-party-name` cannot.
 */
const PROMOTIONAL_EN = [
  "free assessment", "free service", "free consultation", "free advice",
  "best rate", "best rates", "best deal", "best deals", "best loan", "best option",
  "great rate", "great rates", "great deal", "cheapest rate", "cheapest loan",
  "guaranteed approval", "guaranteed rate", "guaranteed savings", "guaranteed to save",
  "instant approval", "immediate approval", "approval guaranteed",
  "risk-free", "risk free", "hassle-free", "hassle free", "stress-free", "stress free",
  "save you thousands", "massive savings", "substantial savings",
  "independent advice", "independent service", "financial advice",
  "will qualify", "will be approved", "no obligation",
];

const PROMOTIONAL_VI = [
  "dịch vụ miễn phí", "tư vấn miễn phí", "đánh giá miễn phí",
  "lãi suất tốt nhất", "gói vay tốt nhất", "lựa chọn tốt nhất", "ngân hàng tốt nhất",
  "lãi suất rẻ nhất", "đảm bảo được duyệt", "bảo đảm được duyệt",
  "đảm bảo phê duyệt", "chắc chắn được duyệt", "duyệt ngay lập tức",
  "không rủi ro", "tiết kiệm hàng nghìn", "tư vấn độc lập", "lời khuyên tài chính",
];

/**
 * TIER 2 - restricted only when characterising our offer. Flagged so a human
 * looks, cleared by declaring any of the four reasons. This is the list that
 * used to hard-throw unconditionally.
 */
const CONTEXT_EN = [
  "free", "best", "great", "guarantee", "guaranteed", "independent",
  "instant", "immediate", "quickest", "cheap", "cheapest", "substantial",
  "easy", "easiest", "fast", "fastest", "simple", "simplest", "approved",
];

/** Vietnamese is the language actually reaching the consumer here. */
const CONTEXT_VI = [
  "miễn phí", "tốt nhất", "rẻ nhất", "giá rẻ", "đảm bảo", "bảo đảm",
  "độc lập", "nhanh nhất", "nhanh chóng", "ngay lập tức", "dễ dàng", "đơn giản",
];

/** Why a restricted term is legitimately present. */
export type ExemptionReason =
  /** Explaining what a term means, not characterising our offer. */
  | "definition"
  /** Reporting a named third party's own words. Note must name the source. */
  | "quoted"
  /** Saying something is NOT free / easy / guaranteed. Consumer-protective. */
  | "negation"
  /** Another entity's proper noun, reported factually. */
  | "third-party-name";

/** Tier 1 is promotional by construction; only these two reasons can clear it. */
const REASONS_VALID_FOR_PROMOTIONAL: ExemptionReason[] = ["quoted", "negation"];

export interface Exemption {
  /** Field key as passed to assertCompliantCopy, e.g. "body". */
  field: string;
  /** The restricted term, exactly as listed above. */
  term: string;
  reason: ExemptionReason;
  /** Required. What makes this use non-promotional. Becomes the audit record. */
  note: string;
}

export interface ComplianceAudit {
  /** Cleared hits, with the declared reason. Print these; they are the trail. */
  cleared: { field: string; term: string; reason: ExemptionReason; note: string }[];
  /** Declared but never matched - a stale exemption, which is how a guard rots. */
  unused: Exemption[];
}

const WORD_SAFE = /[a-z]/i;

/**
 * Pure-ASCII single words get a word boundary so "fast" does not match
 * "breakfast". Vietnamese terms are multi-word or carry diacritics that \b
 * does not handle, so they are matched as substrings.
 *
 * String.raw is required: in a normal template literal `\b` is the backspace
 * character (U+0008), not a regex word boundary, which silently disables every
 * single-word check.
 */
const hit = (haystack: string, term: string): boolean =>
  WORD_SAFE.test(term) && !term.includes(" ") && !term.includes("-")
    ? new RegExp(String.raw`\b${term}\b`, "i").test(haystack)
    : haystack.includes(term);

/**
 * Case-insensitive, diacritic-preserving scan of every supplied string.
 *
 * @param fields   copy to scan, keyed by a name that appears in errors
 * @param exemptions declarations that a restricted term is legitimately present
 * @returns the audit trail of what was cleared and why
 * @throws if any restricted term is present without a valid declaration
 */
export const assertCompliantCopy = (
  fields: Record<string, string | string[] | undefined>,
  exemptions: Exemption[] = [],
): ComplianceAudit => {
  const blocked: string[] = [];
  const cleared: ComplianceAudit["cleared"] = [];
  const used = new Set<number>();

  for (const [key, value] of Object.entries(fields)) {
    if (!value) continue;
    for (const raw of Array.isArray(value) ? value : [value]) {
      const hay = raw.toLowerCase();

      const scan = (terms: string[], tier: "promotional" | "context") => {
        for (const term of terms) {
          if (!hit(hay, term)) continue;

          const i = exemptions.findIndex(
            (e) => e.field === key && e.term.toLowerCase() === term,
          );
          const ex = i >= 0 ? exemptions[i] : undefined;

          if (!ex) {
            blocked.push(
              tier === "promotional"
                ? `${key}: "${term}" — promotional phrase, no exemption declared`
                : `${key}: "${term}" — restricted term, no exemption declared`,
            );
            continue;
          }
          if (!ex.note?.trim()) {
            blocked.push(`${key}: "${term}" — exemption declared with an empty note`);
            continue;
          }
          if (tier === "promotional" && !REASONS_VALID_FOR_PROMOTIONAL.includes(ex.reason)) {
            blocked.push(
              `${key}: "${term}" — "${ex.reason}" cannot clear a promotional phrase; ` +
                `only ${REASONS_VALID_FOR_PROMOTIONAL.join(" or ")} can`,
            );
            continue;
          }
          used.add(i);
          cleared.push({ field: key, term, reason: ex.reason, note: ex.note });
        }
      };

      scan([...PROMOTIONAL_EN, ...PROMOTIONAL_VI], "promotional");
      scan([...CONTEXT_EN, ...CONTEXT_VI], "context");
    }
  }

  if (blocked.length) {
    throw new Error(
      `RG 234: restricted terminology found.\n  ` +
        `${[...new Set(blocked)].join("\n  ")}\n\n` +
        `RG 234 restricts these where they characterise a product or service we\n` +
        `promote. If this use is a definition, a negation, a quote from a named\n` +
        `source, or a third party's proper noun, declare it:\n` +
        `  assertCompliantCopy(fields, [{ field, term, reason, note }])\n` +
        `  reason: definition | quoted | negation | third-party-name\n` +
        `Otherwise rewrite using legislative wording — see asic-banned-phrases.md\n` +
        `(e.g. "lựa chọn cạnh tranh", "hỗ trợ cá nhân hoá", "subject to eligibility").`,
    );
  }

  return { cleared, unused: exemptions.filter((_, i) => !used.has(i)) };
};

/**
 * s163/s164 NCCP: an advertised rate must carry a comparison rate of equal
 * prominence. Daniel's rule: show the rate only if the comparison rate is
 * supplied too — otherwise show no rate at all.
 */
export const assertRateGate = (
  rateFigure?: string,
  comparisonRate?: string,
  ratesAsAt?: string,
) => {
  if (!rateFigure) return;
  const missing: string[] = [];
  if (!comparisonRate) missing.push("comparisonRate");
  if (!ratesAsAt) missing.push("ratesAsAt (date rates are correct as at)");
  if (missing.length) {
    throw new Error(
      `Cannot display rate "${rateFigure}" — missing ${missing.join(" and ")}. ` +
        `s163/s164 NCCP require a comparison rate of equal prominence. ` +
        `Either supply the comparison rate, or omit rateFigure entirely.`,
    );
  }
};

/**
 * Required by the Advertising Requirements doc whenever a policy feature or
 * concession is advertised (e.g. "no genuine savings required"): the ad must
 * carry wording along the lines of "subject to lenders credit criteria, fees
 * and charges will apply".
 */
export const CONDITIONS_NOTE_VI =
  "Điều kiện áp dụng. Tùy thuộc vào tiêu chí tín dụng của bên cho vay; các khoản phí và lệ phí sẽ được áp dụng.";

/** The comparison-rate warning, Vietnamese, per the recommended disclaimer. */
export const comparisonWarningVi = (ratesAsAt: string) =>
  `Lãi suất chính xác tại ngày ${ratesAsAt} và có thể thay đổi bất kỳ lúc nào. ` +
  `Lãi suất so sánh dựa trên khoản vay $150,000 trong thời hạn 25 năm. ` +
  `CẢNH BÁO: Lãi suất so sánh này chỉ đúng cho ví dụ đã nêu và có thể không bao gồm ` +
  `tất cả các khoản phí. Số tiền vay hoặc điều khoản khác có thể cho ra lãi suất so sánh khác. ` +
  `Điều khoản, điều kiện, phí và lệ phí được áp dụng.`;
