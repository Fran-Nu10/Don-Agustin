import React from "react";
import "./whatsapp-float.css";

type Props = {
  /** número con código país, sin + ni espacios. Ej: Uruguay 59899123456 */
  phone: string;
  /** mensaje inicial */
  message?: string;
  /** separación del borde inferior en px (por si tenés otro widget) */
  bottomOffset?: number;
  /** "right" | "left" */
  side?: "right" | "left";
  ariaLabel?: string;
};

export default function WhatsAppFloat({
  phone,
  message = "Hola, quiero info sobre próximos viajes.",
  bottomOffset = 18,
  side = "right",
  ariaLabel = "Chat por WhatsApp",
}: Props) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const style: React.CSSProperties =
    side === "right" ? { right: 18, bottom: bottomOffset } : { left: 18, bottom: bottomOffset };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="wa-float"
      style={style}
    >
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <path
          fill="currentColor"
          d="M19.11 17.45c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.47.13-.62.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.62-.93-2.22-.24-.58-.49-.5-.68-.5-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.28.3-1.06 1.04-1.06 2.54 0 1.5 1.09 2.95 1.24 3.15.15.2 2.14 3.27 5.18 4.58.72.31 1.28.49 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35zM16 3c7.18 0 13 5.82 13 13 0 2.55-.73 4.93-2 6.93L26 29l-6.22-1.64C17.9 27.78 17 28 16 28 8.82 28 3 22.18 3 15S8.82 3 16 3zm0-2C7.72 1 1 7.72 1 16c0 3.03.89 5.86 2.42 8.23L2 31l7.03-1.85C10.96 29.7 13.42 30 16 30c8.28 0 15-6.72 15-15S24.28 1 16 1z"
        />
      </svg>
    </a>
  );
}
