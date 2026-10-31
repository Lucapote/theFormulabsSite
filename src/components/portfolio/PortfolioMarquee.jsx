import PortfolioReelCard from "./PortfolioReelCard";

/**
 * PortfolioMarquee
 * Tira continua infinita de reels con animación horizontal suave.
 * Pausa la animación al pasar el cursor para permitir ver e interactuar con el video.
 */
export default function PortfolioMarquee({ reels = [] }) {
  // Duplicar el array para crear un bucle continuo de desplazamiento
  const doubledReels = [...reels, ...reels];

  return (
    <div className="w-full overflow-hidden py-4 relative group [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex gap-4 w-max animate-marquee group-hover:[animation-play-state:paused]">
        {doubledReels.map((reel, index) => (
          <div
            key={`${reel.id}-${index}`}
            className="w-[170px] sm:w-[195px] md:w-[215px] shrink-0"
          >
            <PortfolioReelCard reel={reel} autoPlayOnHover={false} />
          </div>
        ))}
      </div>
    </div>
  );
}

