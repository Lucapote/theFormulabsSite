import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useState } from "react";
const geoUrlWorld = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
const geoUrlUS = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const clients = [
  { name: "Cliente 1", logo: "MV Mobile Notary", location: "Florida" },
  { name: "Cliente 2", logo: "Noah's Cleaners", location: "Florida" },
  { name: "Cliente 3", logo: "Yamamoto", location: "Mexico" },
  { name: "Cliente 4", logo: "Xochipilli", location: "Mexico" },
  { name: "Cliente 4", logo: "Lemonade", location: "Mexico" }
];
const ClientsSection = () => {
  const [hoveredLocation, setHoveredLocation] = useState(null);
  return <section className="w-full min-h-[90vh] lg:min-h-screen flex flex-col justify-center py-12 lg:py-0 relative overflow-hidden" id="clientes">
      <div className="container max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <motion.p
    className="text-center font-mono text-xs md:text-sm font-medium tracking-[0.15em] uppercase text-lab-text-secondary mb-10 mx-auto max-w-2xl"
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
          Nuestros diagnósticos no conocen fronteras
        </motion.p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-12 ">
          {clients.map((client, i) => <motion.div
    key={client.name}
    className="flex items-center justify-center font-display text-lg md:text-xl font-semibold text-lab-text-tertiary opacity-70 grayscale hover:grayscale-0 hover:opacity-100 hover:text-foreground transition-all duration-500 cursor-default"
    initial={{ opacity: 0, filter: "blur(4px)" }}
    whileInView={{ opacity: 1, filter: "blur(0px)" }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay: i * 0.15 }}
    onMouseEnter={() => setHoveredLocation(client.location)}
    onMouseLeave={() => setHoveredLocation(null)}
  >
              {
    /* Aquí irá la etiqueta <img> cuando tengas los logos */
  }
              {client.logo}
            </motion.div>)}
        </div>

        {
    /* Map Section */
  }
        <motion.div
    className="mt-8 md:mt-12 w-full max-w-3xl mx-auto opacity-90"
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay: 0.3 }}
  >
          <ComposableMap
    projection="geoMercator"
    projectionConfig={{
      scale: 550,
      center: [-95, 34]
    }}
    width={800}
    height={460}
    style={{ width: "100%", height: "auto" }}
  >
            {
    /* Draw US States */
  }
            <Geographies geography={geoUrlUS}>
              {({ geographies }) => geographies.map((geo) => {
    const isFlorida = geo.properties.name === "Florida";
    let opacity = 0.06;
    if (isFlorida) {
      opacity = hoveredLocation === "Florida" ? 1 : hoveredLocation ? 0.2 : 1;
    }
    return <Geography
      key={geo.rsmKey}
      geography={geo}
      className="transition-opacity duration-700"
      fill="hsl(var(--primary))"
      fillOpacity={opacity}
      stroke="hsl(var(--background))"
      strokeWidth={1}
      style={{
        default: { outline: "none", transition: "all 0.5s ease" },
        hover: { outline: "none", transition: "all 0.5s ease" },
        pressed: { outline: "none", transition: "all 0.5s ease" }
      }}
    />;
  })}
            </Geographies>

            {
    /* Draw Mexico */
  }
            <Geographies geography={geoUrlWorld}>
              {({ geographies }) => geographies.filter((geo) => geo.id === "484").map((geo) => <Geography
    key={geo.rsmKey}
    geography={geo}
    className="transition-opacity duration-700"
    fill="hsl(var(--primary))"
    fillOpacity={hoveredLocation === "Mexico" ? 1 : hoveredLocation ? 0.2 : 1}
    stroke="hsl(var(--background))"
    strokeWidth={1}
    style={{
      default: { outline: "none", transition: "all 0.5s ease" },
      hover: { outline: "none", transition: "all 0.5s ease" },
      pressed: { outline: "none", transition: "all 0.5s ease" }
    }}
  />)}
            </Geographies>
          </ComposableMap>
        </motion.div>
      </div>
    </section>;
};
export default ClientsSection;
