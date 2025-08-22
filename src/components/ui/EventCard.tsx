import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { COLORS } from "@/lib/theme";
import { formatDate, formatDateOnly } from "@/lib/dateUtils";
import EventBadge from "./EventBadge";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    desc: string;
    start_date: string | Date;
    end_date?: string | null;
    genre: string;
    type: string;
    location: string | null;
    image_path: string | null;
    artist?: {
      id: number;
      name: string;
      image_path?: string | null;
    } | null;
  };
  index?: number;
  variant?: 'default' | 'compact' | 'timeline' | 'mini' | 'artist-timeline';
  showLink?: boolean;
  linkUrl?: string;
}

export default function EventCard({ 
  event, 
  index = 0, 
  variant = 'default', 
  showLink = true, 
  linkUrl 
}: EventCardProps) {
  const isCompact = variant === 'compact';
  const isTimeline = variant === 'timeline';
  const isMini = variant === 'mini';
  const isArtistTimeline = variant === 'artist-timeline';
  
  // Déterminer l'URL du lien
  const eventLink = linkUrl || `/events/${event.id}`;
  
  // Composant wrapper avec ou sans lien
  const CardWrapper = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    if (showLink) {
      return (
        <Link href={eventLink} className={`block ${className}`}>
          {children}
        </Link>
      );
    }
    return <div className={className}>{children}</div>;
  };

  // Variant mini pour les cartes d'événements dans les profils artistes
  if (isMini) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="border rounded-lg p-3 hover:shadow-sm transition-shadow"
        style={{ borderColor: COLORS.roseClair }}
      >
        <CardWrapper>
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-sm line-clamp-1" style={{ color: COLORS.violet }}>
              {event.title}
            </h4>
            <div className="flex gap-1 flex-shrink-0">
              <EventBadge type="genre" value={event.genre} size="sm" />
            </div>
          </div>
          
          <p className="text-gray-600 text-xs mb-2 line-clamp-2">
            {event.desc}
          </p>
          
          <div className="text-xs text-gray-500">
            <span>{formatDate(typeof event.start_date === 'string' ? event.start_date : event.start_date.toISOString())}</span>
            {event.location && (
              <span className="ml-2">• {event.location}</span>
            )}
          </div>
        </CardWrapper>
      </motion.div>
    );
  }

  // Variant artist-timeline pour remplacer les cartes dans la page artiste individuel
  if (isArtistTimeline) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 hover:shadow-xl transition-all"
        style={{ borderColor: COLORS.roseClair }}
      >
        <CardWrapper>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image de l'événement */}
            {event.image_path && (
              <div className="md:w-48 h-32 flex-shrink-0">
                <Image
                  src={event.image_path}
                  alt={event.title}
                  width={192}
                  height={128}
                  className="w-full h-full object-cover rounded-lg"
                  quality={85}
                  sizes="192px"
                />
              </div>
            )}
            
            {/* Détails de l'événement */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-bold" style={{ color: COLORS.violet }}>
                  {event.title}
                </h3>
                <div className="flex gap-2 flex-shrink-0">
                  <EventBadge type="genre" value={event.genre} size="md" />
                  <EventBadge type="eventType" value={event.type} size="md" />
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {event.desc}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">📅 Date:</span>
                  <span className="text-gray-600">{formatDate(typeof event.start_date === 'string' ? event.start_date : event.start_date.toISOString())}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">📍 Lieu:</span>
                    <span className="text-gray-600">{event.location}</span>
                  </div>
                )}
                {event.artist && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">🎤 Artiste:</span>
                    <span className="text-gray-600">{event.artist.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardWrapper>
      </motion.div>
    );
  }

  if (isTimeline) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 hover:shadow-xl transition-all"
        style={{ borderColor: COLORS.roseClair }}
      >
        <CardWrapper>
          <div className="flex flex-col md:flex-row gap-6">
          {/* Image de l'événement */}
          {event.image_path && (
            <div className="md:w-48 h-32 flex-shrink-0">
              <Image
                src={event.image_path}
                alt={event.title}
                width={192}
                height={128}
                className="w-full h-full object-cover rounded-lg"
                quality={85}
                sizes="192px"
              />
            </div>
          )}
          
          {/* Détails de l'événement */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-2xl font-bold" style={{ color: COLORS.violet }}>
                {event.title}
              </h3>
              <div className="flex gap-2 flex-shrink-0">
                <EventBadge type="genre" value={event.genre} size="md" />
                <EventBadge type="eventType" value={event.type} size="md" />
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 leading-relaxed">
              {event.desc}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">📅 Date:</span>
                <span className="text-gray-600">{formatDate(typeof event.start_date === 'string' ? event.start_date : event.start_date.toISOString())}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">📍 Lieu:</span>
                  <span className="text-gray-600">{event.location}</span>
                </div>
              )}
              {event.artist && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">🎤 Artiste:</span>
                  <span className="text-gray-600">{event.artist.name}</span>
                </div>
              )}
            </div>
          </div>
          </div>
        </CardWrapper>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 hover:shadow-xl transition-all duration-300 ${
        isCompact ? 'h-auto' : ''
      }`}
      style={{ borderColor: COLORS.lavande }}
    >
      <CardWrapper>
        {/* Image de l'événement */}
        {event.image_path && (
          <div className={`relative overflow-hidden ${isCompact ? 'h-32' : 'h-48'}`}>
            <Image
              src={event.image_path}
              alt={event.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              quality={85}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Date en overlay */}
            <div className="absolute top-4 left-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-xs font-medium text-gray-600">
                  {formatDateOnly(typeof event.start_date === 'string' ? event.start_date : event.start_date.toISOString()).split(' ').slice(0, 2).join(' ')}
                </div>
              </div>
            </div>
            
            {/* Badges en overlay */}
            <div className="absolute top-4 right-4 flex gap-2">
              <EventBadge type="genre" value={event.genre} size="sm" />
              <EventBadge type="eventType" value={event.type} size="sm" />
            </div>
          </div>
        )}

        {/* Contenu */}
        <div className={`p-${isCompact ? '4' : '6'}`}>
          <div className="flex items-start justify-between mb-3">
            <h3 className={`font-bold font-display ${isCompact ? 'text-lg' : 'text-xl'}`} style={{ color: COLORS.violet }}>
              {event.title}
            </h3>
          </div>
          
          <p className={`text-gray-600 mb-4 leading-relaxed ${isCompact ? 'text-sm line-clamp-2' : 'line-clamp-3'}`}>
            {event.desc}
          </p>
          
          {/* Informations de l'événement */}
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{formatDate(typeof event.start_date === 'string' ? event.start_date : event.start_date.toISOString())}</span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{event.location}</span>
              </div>
            )}
            
            {event.artist && (
              <div className="flex items-center gap-2">
                <span>🎤</span>
                <span>{event.artist.name}</span>
              </div>
            )}
          </div>
          
          {/* Action button */}
          {showLink && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div
                className="w-full px-4 py-2 rounded-lg text-white font-medium text-center text-sm"
                style={{ backgroundColor: COLORS.violet }}
              >
                Voir les détails
              </div>
            </div>
          )}
        </div>
      </CardWrapper>
    </motion.div>
  );
}
