import localFont from "next/font/local";

// Police d'affichage pour les titres, chargée depuis src/app/fonts/
export const titlesFont = localFont({
  src: [
    { 
      path: "./Pilowlava-Regular.woff2",
      weight: "400",
      style: "normal"
    },
    { 
      path: "./Pilowlava-Atome.woff2",
      weight: "700",
      style: "normal"
    },
  ],
  variable: "--font-pilowlava",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "ascent-override", value: "100%" }]
});


