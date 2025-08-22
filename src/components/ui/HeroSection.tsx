import { motion } from "framer-motion";
import { COLORS } from "@/lib/theme";
import { ReactNode } from "react";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  stats?: ReactNode;
  backgroundGradient?: string;
  children?: ReactNode;
}

export default function HeroSection({ 
  title, 
  subtitle, 
  stats, 
  backgroundGradient,
  children 
}: HeroSectionProps) {
  const defaultGradient = `linear-gradient(135deg, ${COLORS.violet}60, ${COLORS.lavande}60)`;
  
  return (
    <section 
      className="pt-20 pb-16 px-4 text-center relative overflow-hidden" 
      style={{ background: backgroundGradient || defaultGradient }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <h1 
          className="text-4xl md:text-6xl font-bold mb-6 font-display" 
          style={{ color: COLORS.violet }}
        >
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            {subtitle}
          </p>
        )}
        
        {stats && (
          <div className="text-lg text-gray-500">
            {stats}
          </div>
        )}
        
        {children}
      </motion.div>
      
      {/* Élément décoratif */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: COLORS.rose }}
      ></div>
    </section>
  );
}
