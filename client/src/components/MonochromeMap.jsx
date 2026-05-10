import React from 'react';
import { motion } from 'framer-motion';

const MonochromeMap = ({ stops }) => {
  // A very simplified artistic map representation
  // In a real app, this would be a Mapbox component with a custom style
  return (
    <div className="relative w-full h-full bg-serene-charcoal overflow-hidden flex items-center justify-center">
      {/* Background Grid Lines for texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <svg className="w-full h-full max-w-4xl max-h-[80%] relative z-10" viewBox="0 0 800 400">
        {/* Connection Lines (Routes) */}
        {stops.length > 1 && stops.map((stop, i) => {
          if (i === stops.length - 1) return null;
          const next = stops[i+1];
          // Deterministic pseudo-coordinates based on city name for artistic effect
          const getX = (name) => (name.charCodeAt(0) * 7) % 700 + 50;
          const getY = (name) => (name.charCodeAt(1) * 3) % 300 + 50;
          
          return (
            <motion.line
              key={`line-${i}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 3, delay: i * 0.5 }}
              x1={getX(stop.cityName)} y1={getY(stop.cityName)}
              x2={getX(next.cityName)} y2={getY(next.cityName)}
              stroke="white"
              strokeWidth="0.5"
              strokeDasharray="4 2"
            />
          );
        })}

        {/* Destination Dots (Glowing Nodes) */}
        {stops.map((stop, i) => {
          const getX = (name) => (name.charCodeAt(0) * 7) % 700 + 50;
          const getY = (name) => (name.charCodeAt(1) * 3) % 300 + 50;
          const x = getX(stop.cityName);
          const y = getY(stop.cityName);

          return (
            <g key={`dot-${i}`}>
              <motion.circle
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.5 + 1 }}
                cx={x} cy={y} r="3"
                fill="white"
                className="shadow-[0_0_10px_white]"
              />
              <motion.circle
                animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                cx={x} cy={y} r="8"
                fill="white"
                opacity="0.2"
              />
              <motion.text
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: i * 0.5 + 2 }}
                x={x + 8} y={y + 4}
                fill="white"
                className="text-[8px] font-light uppercase tracking-widest pointer-events-none"
              >
                {stop.cityName}
              </motion.text>
            </g>
          );
        })}
      </svg>

      {/* Decorative Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-t from-serene-charcoal via-transparent to-serene-charcoal/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-serene-charcoal/40 via-transparent to-serene-charcoal/40 pointer-events-none" />
    </div>
  );
};

export default MonochromeMap;
