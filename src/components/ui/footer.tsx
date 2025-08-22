import { COLORS } from "@/lib/theme";
import { LAYOUT_CLASSES } from "@/lib/spacing";

export default function Footer() {
  return (
    <footer className={LAYOUT_CLASSES.standardFooter} style={{ background: COLORS.violet }}>
      <p className="text-white font-semibold text-lg">
        &copy; {new Date().getFullYear()} Pulse Festival — Tous droits réservés.
      </p>
    </footer>
  );
}
