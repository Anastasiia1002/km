import { withBase } from "./routes.js";

export function InternalLink({ href, navigate, className, children, onNavigate, ...rest }) {
  return (
    <a
      {...rest}
      className={className}
      href={withBase(href)}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        onNavigate?.();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
