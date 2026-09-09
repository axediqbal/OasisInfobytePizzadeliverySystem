import React, { useEffect, useRef } from 'react';

const ThreePizzaBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Wait until THREE and gsap are loaded on window
    if (!window.THREE || !window.gsap) {
      console.warn('[ThreePizzaBackground] THREE or GSAP not found on window, retrying in 200ms...');
      const timeout = setTimeout(() => {
        // Trigger re-run if needed
      }, 200);
      return () => clearTimeout(timeout);
    }

    const THREE = window.THREE;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    const container = containerRef.current;
    if (!container) return;

    // Clear previous children if any
    container.innerHTML = '';

    // --- SCENE & CAMERA SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.035);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3.8, 7.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    
    // Ensure canvas stays in background and allows clicks through to UI
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.style.pointerEvents = 'none';

    container.appendChild(renderer.domElement);

    // --- LIGHTING SETUP ---
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.9);
    scene.add(ambientLight);

    // Key Warm Oven Directional Light
    const keyLight = new THREE.DirectionalLight(0xff9d00, 2.8);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Fill Warm Light
    const fillLight = new THREE.PointLight(0xff4500, 2.2, 12);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    // Rim Highlight
    const rimLight = new THREE.DirectionalLight(0x4080ff, 1.0);
    rimLight.position.set(0, -5, -6);
    scene.add(rimLight);

    // --- PROCEDURAL CHEESE & SAUCE TEXTURE GENERATOR ---
    function createCheeseTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Golden cheese melt base
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(0, 0, 512, 512);

      // Baked golden-brown spots / bubbles
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = Math.random() * 12 + 2;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, 'rgba(120, 40, 5, 0.85)');
        grad.addColorStop(0.6, 'rgba(215, 120, 20, 0.45)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sauce swirl accents
      for (let i = 0; i < 25; i++) {
        const x = 50 + Math.random() * 412;
        const y = 50 + Math.random() * 412;
        const rad = 8 + Math.random() * 22;
        const grad = ctx.createRadialGradient(x, y, 1, x, y, rad);
        grad.addColorStop(0, 'rgba(185, 28, 28, 0.9)');
        grad.addColorStop(0.7, 'rgba(220, 38, 38, 0.4)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    }

    const cheeseTexture = createCheeseTexture();

    // --- PIZZA SLICES DECONSTRUCTION SETUP ---
    const pizzaGroup = new THREE.Group();
    scene.add(pizzaGroup);

    const slices = [];
    const NUM_SLICES = 8;
    const PIZZA_RADIUS = 2.4;
    const PIZZA_THICKNESS = 0.22;

    function createSliceGeometry(radius, angleStep) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.arc(0, 0, radius, -angleStep / 2, angleStep / 2, false);
      shape.lineTo(0, 0);

      const extrudeSettings = {
        depth: PIZZA_THICKNESS,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.05,
        bevelThickness: 0.04
      };

      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }

    const angleStep = (Math.PI * 2) / NUM_SLICES;

    // Materials
    const crustMaterial = new THREE.MeshStandardMaterial({
      color: 0xc87d32,
      roughness: 0.85,
      metalness: 0.1
    });

    const cheeseMaterial = new THREE.MeshStandardMaterial({
      map: cheeseTexture,
      color: 0xffcc44,
      roughness: 0.3,
      metalness: 0.1,
      bumpMap: cheeseTexture,
      bumpScale: 0.03
    });

    const pepperoniMaterial = new THREE.MeshStandardMaterial({
      color: 0xb3241c,
      roughness: 0.3,
      metalness: 0.15
    });

    const basilMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e7e34,
      roughness: 0.45,
      side: THREE.DoubleSide
    });

    // Build 8 Slices
    for (let i = 0; i < NUM_SLICES; i++) {
      const sliceContainer = new THREE.Group();
      const angle = i * angleStep;

      // Base Wedge (Crust & Cheese)
      const geom = createSliceGeometry(PIZZA_RADIUS, angleStep);
      geom.rotateX(-Math.PI / 2);

      const sliceMesh = new THREE.Mesh(geom, [cheeseMaterial, crustMaterial]);
      sliceMesh.castShadow = true;
      sliceMesh.receiveShadow = true;
      sliceContainer.add(sliceMesh);

      // Outer Puffy Crust Rim (Torus)
      const crustRimGeom = new THREE.TorusGeometry(PIZZA_RADIUS + 0.01, 0.18, 12, 16, angleStep);
      const crustRim = new THREE.Mesh(crustRimGeom, crustMaterial);
      crustRim.rotation.x = Math.PI / 2;
      crustRim.rotation.z = -angleStep / 2;
      crustRim.position.y = PIZZA_THICKNESS / 2;
      crustRim.castShadow = true;
      sliceContainer.add(crustRim);

      // Add Pepperoni per slice
      const pepperoniCount = 3;
      for (let p = 0; p < pepperoniCount; p++) {
        const r = 0.7 + (p * 0.55);
        const pAngle = ((p % 2 === 0 ? 0.3 : -0.3)) * (angleStep * 0.6);
        const pepGeom = new THREE.CylinderGeometry(0.26, 0.28, 0.035, 24);
        const pep = new THREE.Mesh(pepGeom, pepperoniMaterial);
        pep.position.set(Math.cos(pAngle) * r, PIZZA_THICKNESS + 0.03, Math.sin(pAngle) * r);
        pep.rotation.y = Math.random() * Math.PI;
        pep.castShadow = true;
        sliceContainer.add(pep);
      }

      // Basil Leaf
      const basilGeom = new THREE.ConeGeometry(0.14, 0.02, 5);
      const basil = new THREE.Mesh(basilGeom, basilMaterial);
      basil.position.set(Math.cos(0) * (PIZZA_RADIUS * 0.45), PIZZA_THICKNESS + 0.045, 0);
      basil.scale.set(1, 1, 2.2);
      sliceContainer.add(basil);

      // Position in Ring
      sliceContainer.rotation.y = angle;

      slices.push({
        group: sliceContainer,
        angle: angle,
        dirX: Math.cos(angle),
        dirZ: Math.sin(angle)
      });

      pizzaGroup.add(sliceContainer);
    }

    // Initial angled perspective
    pizzaGroup.rotation.x = 0.45;
    pizzaGroup.position.y = -0.1;

    // --- STEAM & GOLDEN EMBER PARTICLES ---
    const particleCount = 70;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;
      positions[i + 1] = Math.random() * 3.5;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.06,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // --- GSAP SCROLLTRIGGER ANIMATION PIPELINE ---
    let timeline = null;
    if (ScrollTrigger) {
      timeline = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2
        }
      });

      // Step 1: Hero Scroll — Smooth rotation & camera tracking
      timeline.to(pizzaGroup.rotation, {
        y: Math.PI * 1.5,
        x: 0.65,
        duration: 2
      }, 0);

      // Step 2: EXPLODE 8 SLICES RADIALLY (Mid-scroll deconstruction)
      slices.forEach((slice) => {
        const explodeDistance = 1.7;
        timeline.to(slice.group.position, {
          x: slice.dirX * explodeDistance,
          z: slice.dirZ * explodeDistance,
          y: Math.sin(slice.angle) * 0.35,
          duration: 3.5
        }, 1.5);
      });

      // Step 3: Re-assemble Slices for Checkout / Bottom CTA
      slices.forEach((slice) => {
        timeline.to(slice.group.position, {
          x: 0,
          z: 0,
          y: 0,
          duration: 2.5
        }, 5.5);
      });

      timeline.to(pizzaGroup.rotation, {
        x: 0.8,
        y: Math.PI * 4,
        duration: 3
      }, 5.5);
    }

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let animationFrameId;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      // Gentle continuous ambient rotation
      pizzaGroup.rotation.y += 0.0025;

      // Animate steam & embers rising
      const posArray = particleGeometry.attributes.position.array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        posArray[i] += 0.009;
        if (posArray[i] > 3.5) {
          posArray[i] = 0;
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();

    // --- RESIZE LISTENER ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- CLEANUP ON UNMOUNT ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (timeline) {
        timeline.kill();
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      id="canvas-container"
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ThreePizzaBackground;
