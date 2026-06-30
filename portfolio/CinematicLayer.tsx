'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './Hero.module.css';

export default function CinematicLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scene setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 80;

    // Particle system — warm orange + cool cyan bokeh
    const PARTICLE_COUNT = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);

    // Warm orange: #FF8C42, Cool cyan: #42C8FF, Deep teal: #1AFFDB
    const palette = [
      new THREE.Color(0xFF8C42),
      new THREE.Color(0xFF6B1A),
      new THREE.Color(0x42C8FF),
      new THREE.Color(0x1AFFDB),
      new THREE.Color(0xFFAA55),
      new THREE.Color(0x00BFFF),
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Spread particles across wide field
      positions[i * 3] = (Math.random() - 0.5) * 180;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Vary sizes for depth feel
      sizes[i] = Math.random() * 3.5 + 0.5;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = Math.random() * 0.3 + 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('pColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Soft glowing bokeh shader
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 pColor;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;

        void main() {
          vColor = pColor;
          vec3 pos = position;
          
          // Sine-wave float
          float idx = float(gl_VertexID);
          pos.y += sin(uTime * 0.4 + idx * 0.7) * 2.5;
          pos.x += cos(uTime * 0.25 + idx * 0.5) * 1.8;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (180.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          // Fade edges of field
          float distFromCenter = length(position.xy) / 90.0;
          vAlpha = smoothstep(1.0, 0.3, distFromCenter) * 0.65;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          // Soft bokeh circle
          vec2 uv = gl_PointCoord - 0.5;
          float dist = length(uv);
          if (dist > 0.5) discard;

          // Gaussian glow falloff
          float alpha = exp(-dist * dist * 8.0) * vAlpha;
          // Soft halo
          float halo = exp(-dist * dist * 3.0) * vAlpha * 0.3;

          gl_FragColor = vec4(vColor, alpha + halo);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse parallax
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Resize handler
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // Animate
    const clock = new THREE.Clock();
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      material.uniforms.uTime.value = t;

      // Smooth camera parallax — high-mass, slow
      camera.position.x += (mouseRef.current.x * 6 - camera.position.x) * 0.025;
      camera.position.y += (mouseRef.current.y * 3 - camera.position.y) * 0.025;
      camera.lookAt(scene.position);

      // Gentle rotation of whole field
      particles.rotation.z = Math.sin(t * 0.05) * 0.015;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.cinematicCanvas} />;
}
