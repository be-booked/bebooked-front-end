/**
 * Shared email chrome. Email clients strip <style> blocks and ignore most
 * modern CSS, so everything here is inline and table-free by design —
 * a single centered container with block-level children survives Gmail,
 * Apple Mail and Outlook alike.
 */

const NEAR_BLACK = "#1a1209";
const WARM_CREAM = "#faf8f3";
const WARM_LINEN = "#ede8e0";
const STONE = "#d8d0c4";
const WARM_GRAY = "#5a5a56";
const MUTED = "#888888";
export const SAGE = "#5c7050";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * Slot times are stored as UTC. Email has no JS, so we can't render in the
 * recipient's local zone the way LocalSlotTime does in the browser.
 *
 * TODO: add a `timezone` column to stylists and pass it through. Hardcoding
 * Eastern is only correct while BeBooked is Charlotte-only.
 */
export const DEFAULT_TIMEZONE = "America/New_York";

/** "Tuesday, August 18 at 2:00 PM" */
export function formatSlotForEmail(
  utcDate: string,
  utcTime: string,
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  const dt = new Date(`${utcDate}T${utcTime}Z`);
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone,
  }).format(dt);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(dt);
  return `${date} at ${time}`;
}

/** Minimal HTML escape for any value interpolated into a template. */
export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * A label/value line inside the detail card.
 * Pass `href` to make the value tappable (tel:, mailto:, https:).
 */
export function detailRow(label: string, value: string, href?: string): string {
  const inner = href
    ? `<a href="${esc(href)}" style="color:${SAGE};text-decoration:none;font-weight:500;">${esc(value)}</a>`
    : esc(value);

  return `
    <div style="padding:11px 0;border-top:1px solid ${STONE};">
      <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};margin-bottom:3px;">${esc(label)}</div>
      <div style="font-size:15px;color:${NEAR_BLACK};font-weight:500;">${inner}</div>
    </div>`;
}

export interface LayoutArgs {
  /** Small uppercase label above the headline. */
  eyebrow: string;
  headline: string;
  /** Pre-built HTML for the message body. */
  body: string;
  cta?: { label: string; url: string };
  /** Small print under the CTA. */
  footnote?: string;
  /**
   * Inbox preview line. Without it, clients scrape the first visible text —
   * which is the wordmark and eyebrow, producing "BeBooked Slot filled ...".
   */
  preheader: string;
}

export function emailLayout({
  eyebrow,
  headline,
  body,
  cta,
  footnote,
  preheader,
}: LayoutArgs): string {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${WARM_LINEN};font-family:${FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(preheader)}</div>
  <div style="display:none;max-height:0;overflow:hidden;">&#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;</div>
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">

    <div style="font-size:20px;color:${NEAR_BLACK};margin-bottom:24px;">
      <span style="font-weight:700;">Be</span><span style="font-weight:300;">Booked</span>
    </div>

    <div style="background:${WARM_CREAM};padding:32px 28px;">
      <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${SAGE};margin-bottom:12px;">${esc(eyebrow)}</div>
      <h1 style="margin:0 0 18px;font-size:26px;line-height:1.2;font-weight:700;color:${NEAR_BLACK};">${esc(headline)}</h1>
      ${body}
      ${
        cta
          ? `<div style="margin-top:26px;">
               <a href="${esc(cta.url)}" style="display:inline-block;background:${SAGE};color:${WARM_CREAM};text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;">${esc(cta.label)}</a>
             </div>`
          : ""
      }
      ${
        footnote
          ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:${MUTED};">${footnote}</p>`
          : ""
      }
    </div>

    <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:${WARM_GRAY};text-align:center;">
      BeBooked · Charlotte, NC
    </p>
  </div>
</body>
</html>`;
}

/** Paragraph helper for building layout bodies. */
export function p(text: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${WARM_GRAY};">${text}</p>`;
}

/** Bordered card wrapper for appointment details. */
export function card(inner: string): string {
  return `<div style="background:${WARM_LINEN};padding:6px 18px 18px;margin-top:8px;">${inner}</div>`;
}

/**
 * Checkmark list. Email clients render <ul> inconsistently, so each item is
 * a block with the mark as a text glyph rather than a list marker.
 */
export function checkList(items: string[]): string {
  return `<div style="margin:18px 0 0;">${items
    .map(
      (item) => `
      <div style="font-size:15px;line-height:1.5;color:${NEAR_BLACK};margin-bottom:10px;">
        <span style="color:${SAGE};font-weight:700;">&#10003;</span>&nbsp;&nbsp;${esc(item)}
      </div>`,
    )
    .join("")}</div>`;
}

/** Emphasised block for a single important value, e.g. a booking link. */
export function highlight(label: string, value: string, href: string): string {
  return `
    <div style="background:${WARM_LINEN};padding:18px;margin:20px 0;">
      <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};margin-bottom:6px;">${esc(label)}</div>
      <a href="${esc(href)}" style="font-size:17px;font-weight:700;color:${NEAR_BLACK};text-decoration:none;word-break:break-all;">${esc(value)}</a>
    </div>`;
}
