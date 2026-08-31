'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GalaxyProps {
  insideColor?: string;
  outsideColor?: string;
  particleCount?: number;
}

export default function GalaxyBackground({
  insideColor = '#00f0ff', // Ice Cyan
  outsideColor = '#3b82f6', // Deep Ice Blue
  particleCount = 65000,
}: GalaxyProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#03050c');
    scene.fog = new THREE.FogExp2('#03050c', 0.04);

    // Sizes
    let width = mount.clientWidth || window.innerWidth;
    let height = mount.clientHeight || window.innerHeight;

    // Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.8);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight('#00f0ff', 4, 20);
    pointLight1.position.set(3, 4, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight('#10b981', 3, 20);
    pointLight2.position.set(-3, -2, -2);
    scene.add(pointLight2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    mount.appendChild(renderer.domElement);

    // ─── 1. Central 3D Floating Iceberg / Crystal Monolith (Igloo.inc Style) ───
    const crystalGeo = new THREE.OctahedronGeometry(1.6, 2);
    
    // Distort vertices slightly for organic glacial / crystal shard facets
    const posAttr = crystalGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);
      const noise = (Math.sin(x * 3) + Math.cos(y * 4) + Math.sin(z * 3)) * 0.08;
      posAttr.setXYZ(i, x + noise, y * 1.35 + noise, z + noise);
    }
    crystalGeo.computeVertexNormals();

    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: '#d0f4ff',
      emissive: '#041d33',
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.52,
      thickness: 1.5,
      transparent: true,
      opacity: 0.88,
      wireframe: false,
    });

    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.position.set(0, 0.4, 0);
    scene.add(crystalMesh);

    // Wireframe edge glow for the monolithic shard
    const wireframeGeo = new THREE.WireframeGeometry(crystalGeo);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: '#00f0ff',
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const wireframeMesh = new THREE.LineSegments(wireframeGeo, wireframeMat);
    crystalMesh.add(wireframeMesh);

    // ─── 2. Galaxy Particle System ───
    const parameters = {
      count: particleCount,
      size: 0.007,
      radius: 14,
      branches: 5,
      spin: 0.9,
      randomness: 0.85,
      randomnessPower: 4.5,
      insideColor: insideColor,
      outsideColor: outsideColor,
    };

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;

      const radius = Math.random() * parameters.radius;
      const spinAngle = radius * parameters.spin;
      const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

      const randomX =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius * 0.3;
      const randomY =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius * 0.22;
      const randomZ =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius * 0.3;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, radius / parameters.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: parameters.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const galaxyPoints = new THREE.Points(geometry, particleMaterial);
    scene.add(galaxyPoints);

    // ─── 3. Distant Background Stars ───
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 2000;
    const starsPos = new Float32Array(starsCount * 3);
    const starsColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3;
      const radius = 25 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starsPos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      starsPos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starsPos[i3 + 2] = radius * Math.cos(phi);

      starsColors[i3] = 0.8 + Math.random() * 0.2;
      starsColors[i3 + 1] = 0.9 + Math.random() * 0.1;
      starsColors[i3 + 2] = 1;
    }

    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(starsColors, 3));

    const starsMaterial = new THREE.PointsMaterial({
      size: 0.06,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const stars = new THREE.Points(starsGeo, starsMaterial);
    scene.add(stars);

    // ─── 4. Mouse Interactive Parallax ───
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // ─── 5. Resize Handler ───
    const handleResize = () => {
      if (!mount) return;
      width = mount.clientWidth || window.innerWidth;
      height = mount.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // ─── 6. Animation Loop ───
    const startTime = performance.now();
    let animationFrameId: number;

    const tick = () => {
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Medium smooth celestial rotation
      galaxyPoints.rotation.y = elapsedTime * 0.035;
      crystalMesh.rotation.y = elapsedTime * 0.12;
      crystalMesh.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;
      crystalMesh.position.y = 0.4 + Math.sin(elapsedTime * 0.6) * 0.08;

      stars.rotation.y = -elapsedTime * 0.005;

      // Smooth camera interpolation
      targetX = mouseX * 0.5;
      targetY = mouseY * 0.3;
      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (-targetY + 3.2 - camera.position.y) * 0.03;
      camera.lookAt(0, 0.4, 0);

      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(animationFrameId);

      crystalGeo.dispose();
      crystalMat.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      geometry.dispose();
      particleMaterial.dispose();
      starsGeo.dispose();
      starsMaterial.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [insideColor, outsideColor, particleCount]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden"
    />
  );
}
