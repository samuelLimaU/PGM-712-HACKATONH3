import React, { useMemo } from 'react';
import { extend } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// Un Shader simple para las líneas de escaneo CRT
const CRTShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    varying vec2 vUv;

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      
      // Efecto de líneas de escaneo (Scanlines)
      float scanline = sin(vUv.y * 800.0 + time * 5.0) * 0.04;
      
      // Ligera aberración cromática
      float r = texture2D(tDiffuse, vUv + vec2(0.001, 0.0)).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - vec2(0.001, 0.0)).b;
      
      gl_FragColor = vec4(vec3(r, g, b) - scanline, base.a);
    }
  `
};

const RetroEffects = () => {
  return (
    <EffectComposer disableNormalPass>
      {/* El Bloom da ese efecto de "Flare" o resplandor neón */}
      <Bloom 
        intensity={1.5} 
        luminanceThreshold={0.2} 
        luminanceSmoothing={0.9} 
        mipmapBlur 
      />
      
      {/* Ruido sutil para textura retro */}
      <Noise opacity={0.05} />
      
      {/* Viñeta para centrar la atención */}
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
      
      {/* Aquí podríamos añadir un shader pass personalizado si fuera necesario, 
          pero con Bloom y Noise ya tenemos gran parte de la estética retro neón */}
    </EffectComposer>
  );
};

export default RetroEffects;
