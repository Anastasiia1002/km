import { useCallback, useState } from "react";

const PLACEHOLDER_HREF = "#";
const REL = "nofollow noopener noreferrer";

function openInNewTab(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Outbound link that stays clickable for people but is not a ranking signal.
 * Crawlers see href="#" (plus nofollow). The real URL is assigned only after
 * a user hovers or focuses, and click / middle-click always open a new tab.
 */
export function SeoNeutralLink({ to, className, children, onClick, ...rest }) {
  const [href, setHref] = useState(PLACEHOLDER_HREF);
  const reveal = useCallback(() => setHref(to), [to]);

  const handleClick = useCallback(
    (event) => {
      event.preventDefault();
      onClick?.(event);
      openInNewTab(to);
    },
    [onClick, to],
  );

  return (
    <a
      {...rest}
      className={className}
      href={href}
      rel={REL}
      referrerPolicy="no-referrer"
      target={href === PLACEHOLDER_HREF ? undefined : "_blank"}
      onPointerEnter={reveal}
      onFocus={reveal}
      onClick={handleClick}
      onAuxClick={(event) => {
        if (event.button === 1) handleClick(event);
      }}
    >
      {children}
    </a>
  );
}
