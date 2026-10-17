import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades and lifts its children the first time they scroll into view.
 *
 * A storefront that is completely static reads as a document rather than a
 * product. One restrained entrance per block is enough — anything busier
 * fights the invitations, which are the thing meant to feel alive.
 *
 * Respects prefers-reduced-motion by rendering visible from the start.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "li" | "header";
  className?: string;
} & Record<string, unknown>) {
  const node = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = node.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={node as never}
      className={`reveal ${shown ? "is-shown" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
