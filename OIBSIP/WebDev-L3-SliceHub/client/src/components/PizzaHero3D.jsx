import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, ContactShadows, Sparkles, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Realistic Crust Shader & Texture Generator
function createCrustTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base golden brown
  const grad = ctx.createRadialGradient(256, 256, 100, 256, 256, 256);
  grad.addColorStop(0, '#df9b52');
  grad.addColorStop(0.7, '#c97c2e');
  grad.addColorStop(0.9, '#a45719');
  grad.addColorStop(1, '#5c2a08'); // charred rim
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Char marks / blisters
  for (let i = 0; i < 45; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const dist = Math.hypot(x - 256, y - 256);
    if (dist > 160) {
      ctx.fillStyle = `rgba(${30 + Math.random() * 30}, ${15 + Math.random() * 15}, 5, ${0.4 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, 4 + Math.random() * 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural Rich Cheese & Sauce Texture
function createCheeseTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Melted blend
  ctx.fillStyle = '#fce588';
  ctx.fillRect(0, 0, 512, 512);

  // Golden baked patches
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const rad = 10 + Math.random() * 35;
    const grad = ctx.createRadialGradient(x, y, 2, x, y, rad);
    grad.addColorStop(0, 'rgba(217, 119, 6, 0.7)');
    grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
    grad.addColorStop(1, 'rgba(252, 229, 136, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tomato sauce peek-through swirls
  for (let i = 0; i < 16; i++) {
    const x = 100 + Math.random() * 312;
    const y = 100 + Math.random() * 312;
    const rad = 15 + Math.random() * 30;
    const grad = ctx.createRadialGradient(x, y, 1, x, y, rad);
    grad.addColorStop(0, 'rgba(185, 28, 28, 0.85)');
    grad.addColorStop(0.6, 'rgba(220, 38, 38, 0.5)');
    grad.addColorStop(1, 'rgba(252, 229, 136, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Realistic Pepperoni Slice with curved rim
function Pepperoni({ position, rotation, scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.44, 0.05, 32]} />
        <meshStandardMaterial
          color="#b91c1c"
          roughness={0.35}
          metalness={0.15}
          bumpScale={0.04}
        />
      </mesh>
      {/* Pepperoni Fat Specks & Glisten */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.39, 0.41, 0.01, 24]} />
        <meshStandardMaterial
          color="#991b1b"
          roughness={0.25}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}

// Organic Handcrafted Mushroom
function Mushroom({ position, rotation, scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Mushroom Cap */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <sphereGeometry args={[0.26, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
        <meshStandardMaterial color="#6b5b4e" roughness={0.75} />
      </mesh>
      {/* Gills */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.02, 20]} />
        <meshStandardMaterial color="#3f332a" roughness={0.9} />
      </mesh>
      {/* Stem Slice */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.08, 0.09, 0.12, 16]} />
        <meshStandardMaterial color="#d6cfc7" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Glossy Kalamata Olive Ring
function Olive({ position, rotation, scale = 1 }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow>
      <torusGeometry args={[0.18, 0.08, 16, 28]} />
      <meshStandardMaterial
        color="#171717"
        roughness={0.2}
        metalness={0.4}
      />
    </mesh>
  );
}

// Curved Genovese Basil Leaf
function BasilLeaf({ position, rotation, scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow>
        <cylinderGeometry args={[0.26, 0.14, 0.015, 18]} />
        <meshStandardMaterial
          color="#15803d"
          roughness={0.35}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Leaf stem/spine */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.35, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.5} />
      </mesh>
    </group>
  );
}

// Slow-Roasted Cherry Tomato Half
function CherryTomato({ position, rotation, scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[0.22, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#dc2626"
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <circleGeometry args={[0.21, 20]} />
        <meshStandardMaterial
          color="#ef4444"
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

// 3D Master Artisan Pizza Model
function ArtisanPizza({ scrollProgress, mousePos, activeToppingFilter }) {
  const mainGroup = useRef();
  const crustTex = useMemo(() => createCrustTexture(), []);
  const cheeseTex = useMemo(() => createCheeseTexture(), []);

  useFrame((state, delta) => {
    if (!mainGroup.current) return;

    // Scroll-driven dynamic 3D choreography
    // Progress 0.0 -> Hero stage
    // Progress 0.33 -> Crust & Dough spotlight
    // Progress 0.66 -> Melt & Topping close-up
    // Progress 1.0 -> Stone-fired perspective
    const p = scrollProgress;

    // Target positions & rotations based on scroll
    let targetX = 0;
    let targetY = 0;
    let targetZ = 0;
    let targetRotX = 0.55;
    let targetRotY = state.clock.getElapsedTime() * 0.25;
    let targetRotZ = 0;
    let targetScale = 1.35;

    if (p < 0.25) {
      // Hero stage: centered, proud hero tilt, subtle float
      targetX = 1.2 + mousePos.x * 0.4;
      targetY = 0.1 - mousePos.y * 0.4;
      targetRotX = 0.6 + mousePos.y * 0.3;
      targetRotY += mousePos.x * 0.5;
      targetScale = 1.4;
    } else if (p < 0.55) {
      // Story 1: Pan right to showcase handcrafted rim
      targetX = 1.8 + mousePos.x * 0.3;
      targetY = -0.1;
      targetRotX = 0.9;
      targetRotY = 0.8 + state.clock.getElapsedTime() * 0.15;
      targetRotZ = -0.2;
      targetScale = 1.6;
    } else if (p < 0.8) {
      // Story 2: Top-down culinary inspection
      targetX = -1.6 + mousePos.x * 0.3;
      targetY = 0.2;
      targetRotX = 1.35;
      targetRotY = state.clock.getElapsedTime() * 0.3;
      targetRotZ = 0.1;
      targetScale = 1.5;
    } else {
      // Story 3: Dynamic angled stone-oven finish
      targetX = 0;
      targetY = -0.2;
      targetRotX = 0.45;
      targetRotY = state.clock.getElapsedTime() * 0.4;
      targetScale = 1.45;
    }

    // Smooth damping / lerp
    mainGroup.current.position.x = THREE.MathUtils.damp(mainGroup.current.position.x, targetX, 3.5, delta);
    mainGroup.current.position.y = THREE.MathUtils.damp(mainGroup.current.position.y, targetY, 3.5, delta);
    mainGroup.current.position.z = THREE.MathUtils.damp(mainGroup.current.position.z, targetZ, 3.5, delta);
    mainGroup.current.rotation.x = THREE.MathUtils.damp(mainGroup.current.rotation.x, targetRotX, 3.5, delta);
    mainGroup.current.rotation.y = THREE.MathUtils.damp(mainGroup.current.rotation.y, targetRotY, 3.5, delta);
    mainGroup.current.rotation.z = THREE.MathUtils.damp(mainGroup.current.rotation.z, targetRotZ, 3.5, delta);
    mainGroup.current.scale.setScalar(
      THREE.MathUtils.damp(mainGroup.current.scale.x, targetScale, 3.5, delta)
    );
  });

  return (
    <group ref={mainGroup}>
      
      {/* 1. Stone-Baked Artisan Crust (Double Beveled) */}
      <mesh position={[0, -0.08, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.5, 2.55, 0.24, 64]} />
        <meshStandardMaterial
          map={crustTex}
          roughness={0.7}
          metalness={0.05}
          bumpScale={0.08}
        />
      </mesh>

      {/* 2. Puffy Raised Cornicione Rim (Torus with blisters) */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <torusGeometry args={[2.35, 0.28, 32, 64]} />
        <meshStandardMaterial
          map={crustTex}
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      {/* 3. Deep San Marzano Marinara Sauce Base */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[2.22, 2.22, 0.04, 64]} />
        <meshStandardMaterial
          color="#991b1b"
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>

      {/* 4. Fior di Latte & Cheddar Melt Pool */}
      <mesh position={[0, 0.09, 0]} receiveShadow>
        <cylinderGeometry args={[2.18, 2.18, 0.05, 64]} />
        <meshStandardMaterial
          map={cheeseTex}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* 5. Charred Blister Details on Crust Rim */}
      {[
        [2.35, 0.16, 0.3, 0.14],
        [-2.2, 0.18, 0.8, 0.18],
        [1.2, 0.17, -2.1, 0.16],
        [-1.6, 0.16, -1.8, 0.15],
        [0.4, 0.18, 2.38, 0.17],
        [-0.8, 0.17, 2.3, 0.13],
      ].map(([x, y, z, r], i) => (
        <mesh key={`char-${i}`} position={[x, y, z]}>
          <sphereGeometry args={[r, 12, 12]} />
          <meshStandardMaterial color="#2d1305" roughness={0.9} />
        </mesh>
      ))}

      {/* 6. Pepperoni Slices Layer */}
      {(!activeToppingFilter || activeToppingFilter === 'all' || activeToppingFilter === 'meat') && (
        <group>
          <Pepperoni position={[0.8, 0.14, 0.7]} rotation={[0.04, 0.5, -0.02]} />
          <Pepperoni position={[-0.9, 0.14, 0.6]} rotation={[-0.03, -0.8, 0.05]} />
          <Pepperoni position={[0.3, 0.14, -1.1]} rotation={[0.06, 1.2, 0.02]} />
          <Pepperoni position={[-0.8, 0.14, -0.9]} rotation={[-0.04, 2.1, -0.03]} />
          <Pepperoni position={[1.3, 0.14, -0.4]} rotation={[0.02, 0.3, 0.04]} />
          <Pepperoni position={[-1.3, 0.14, -0.2]} rotation={[0.05, -1.4, -0.02]} />
          <Pepperoni position={[0.0, 0.14, 0.2]} rotation={[-0.02, 0.9, 0.01]} />
          <Pepperoni position={[-0.2, 0.14, -0.4]} rotation={[0.03, -0.6, 0.03]} />
          <Pepperoni position={[1.0, 0.14, 1.2]} rotation={[0.05, 1.8, -0.04]} />
        </group>
      )}

      {/* 7. Button Mushrooms Layer */}
      {(!activeToppingFilter || activeToppingFilter === 'all' || activeToppingFilter === 'veggies') && (
        <group>
          <Mushroom position={[1.1, 0.13, 0.2]} rotation={[0, 0.6, 0.1]} scale={1.1} />
          <Mushroom position={[-0.5, 0.13, 1.1]} rotation={[0, 1.8, -0.1]} scale={1.05} />
          <Mushroom position={[-1.1, 0.13, 0.9]} rotation={[0, -0.9, 0.15]} scale={1.0} />
          <Mushroom position={[0.6, 0.13, -0.7]} rotation={[0, 2.4, -0.05]} scale={1.15} />
          <Mushroom position={[-0.3, 0.13, -1.1]} rotation={[0, -1.2, 0.1]} scale={1.0} />
          <Mushroom position={[0.2, 0.13, 0.9]} rotation={[0, 0.3, -0.1]} scale={0.95} />
        </group>
      )}

      {/* 8. Kalamata Olives Layer */}
      {(!activeToppingFilter || activeToppingFilter === 'all' || activeToppingFilter === 'veggies') && (
        <group>
          <Olive position={[1.4, 0.14, 0.6]} rotation={[Math.PI / 2.2, 0.4, 0]} />
          <Olive position={[-1.1, 0.14, -0.6]} rotation={[Math.PI / 1.9, -0.8, 0.2]} />
          <Olive position={[0.1, 0.14, 1.2]} rotation={[Math.PI / 2.1, 1.5, -0.1]} />
          <Olive position={[-0.2, 0.14, -0.9]} rotation={[Math.PI / 2.3, -0.3, 0.3]} />
          <Olive position={[0.9, 0.14, -1.2]} rotation={[Math.PI / 2.0, 2.2, 0.1]} />
          <Olive position={[-1.4, 0.14, 0.4]} rotation={[Math.PI / 2.1, -1.1, -0.2]} />
        </group>
      )}

      {/* 9. Slow-Roasted Cherry Tomatoes */}
      <group>
        <CherryTomato position={[0.7, 0.15, -0.2]} rotation={[0.1, 0.8, 0.05]} />
        <CherryTomato position={[-0.7, 0.15, -0.2]} rotation={[-0.1, -1.4, 0.05]} />
        <CherryTomato position={[-0.4, 0.15, 0.6]} rotation={[0.05, 2.1, -0.1]} />
        <CherryTomato position={[0.5, 0.15, 0.8]} rotation={[-0.05, -0.5, 0.1]} />
      </group>

      {/* 10. Fresh Genovese Basil Leaves */}
      <group>
        <BasilLeaf position={[0.35, 0.18, 0.4]} rotation={[0.3, 0.8, 0.2]} scale={1.2} />
        <BasilLeaf position={[-0.5, 0.18, -0.3]} rotation={[0.2, -1.5, 0.1]} scale={1.1} />
        <BasilLeaf position={[0.7, 0.18, -0.6]} rotation={[0.15, 2.3, -0.2]} scale={1.15} />
        <BasilLeaf position={[-0.75, 0.18, 0.5]} rotation={[0.25, -0.4, 0.15]} scale={1.05} />
        <BasilLeaf position={[0.1, 0.18, -0.7]} rotation={[0.35, 1.1, -0.1]} scale={1.1} />
        <BasilLeaf position={[-0.1, 0.18, 0.8]} rotation={[0.2, -2.1, 0.25]} scale={1.0} />
      </group>

    </group>
  );
}

// Floating Airborne Ingredients around the pizza in 3D space
function FloatingIngredients({ scrollProgress }) {
  const leavesRef = useRef();

  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group ref={leavesRef}>
      {/* Floating Basil Leaves drifting in the air */}
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2}>
        <BasilLeaf position={[-3.2, 1.8, 0.8]} rotation={[0.5, 1.2, 0.3]} scale={0.9} />
      </Float>
      <Float speed={3} rotationIntensity={2} floatIntensity={2.5}>
        <BasilLeaf position={[3.5, 2.2, -0.5]} rotation={[0.8, -0.9, 0.4]} scale={1.1} />
      </Float>
      <Float speed={2} rotationIntensity={1.2} floatIntensity={1.8}>
        <BasilLeaf position={[-2.8, -1.6, 1.2]} rotation={[-0.4, 2.1, -0.2]} scale={0.8} />
      </Float>

      {/* Floating Pepperoni Slices drifting */}
      <Float speed={2.2} rotationIntensity={1.8} floatIntensity={2}>
        <Pepperoni position={[3.2, -1.5, 0.5]} rotation={[0.6, 0.3, 0.5]} scale={0.85} />
      </Float>
      <Float speed={2.8} rotationIntensity={1.5} floatIntensity={2.2}>
        <Mushroom position={[-3.4, 0.2, -0.8]} rotation={[0.4, 1.8, -0.3]} scale={0.9} />
      </Float>
      <Float speed={3.2} rotationIntensity={2.2} floatIntensity={2.8}>
        <Olive position={[2.8, 0.8, 1.5]} rotation={[Math.PI / 2, 0.8, 0.4]} scale={0.8} />
      </Float>
    </group>
  );
}

// Main Interactive 3D Canvas Scene
const PizzaHero3D = ({ activeToppingFilter = 'all' }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
        setScrollProgress(progress);
      }
    };

    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[500px] lg:min-h-[720px] relative pointer-events-auto cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 1.8, 5.2], fov: 42 }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        shadows
      >
        {/* Dynamic Studio Lighting */}
        <ambientLight intensity={1.1} />
        
        {/* Key Light (Warm Oven Glow) */}
        <directionalLight
          position={[6, 9, 6]}
          intensity={2.2}
          color="#fff6e5"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Rim Light (Burnt Orange Glow) */}
        <pointLight position={[-6, 3, -4]} intensity={2.8} color="#e8590c" />
        <pointLight position={[6, -2, -3]} intensity={1.8} color="#f59e0b" />
        <pointLight position={[0, 5, 2]} intensity={1.4} color="#fef08a" />

        {/* Golden Embers & Floating Seasoning particles */}
        <Sparkles
          count={60}
          scale={7}
          size={3.5}
          speed={0.8}
          opacity={0.6}
          color="#f59e0b"
        />

        {/* 3D Model with scroll & cursor tracking */}
        <ArtisanPizza
          scrollProgress={scrollProgress}
          mousePos={mousePos}
          activeToppingFilter={activeToppingFilter}
        />

        {/* Floating Airborne Ingredients */}
        <FloatingIngredients scrollProgress={scrollProgress} />

        {/* Soft Contact Shadow beneath the pizza */}
        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.7}
          scale={8}
          blur={2.4}
          far={5}
          color="#000000"
        />
      </Canvas>
    </div>
  );
};

export default PizzaHero3D;
