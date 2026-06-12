import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, useGLTF } from "@react-three/drei";
import React, { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useSnapshot } from 'valtio';
import { scrollState, keyframes } from "../store/rocketAnimation";

function ThrusterFlames() {
  const count = 250;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      t: Math.random(),
      speed: 1.5 + Math.random() * 2,
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * 0.5, 
    }));
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Scale fire based on scroll progress so it "ignites" when user starts scrolling
    const p = scrollState.progress;
    let ignition = Math.max(0.2, Math.min(p * 10, 1)); 

    // HYPERJUMP effect: when p > 0.83, explode the flames!
    let hyperjumpMultiplier = 1;
    if (p > 0.83) {
      // normalize from 0 to 1 between 0.83 and 0.91
      const hyperP = Math.max(0, Math.min(1, (p - 0.83) / (0.91 - 0.83)));
      // Ease in the multiplier to make it dramatic (up to 20x longer/faster)
      hyperjumpMultiplier = 1 + Math.pow(hyperP, 3) * 20; 
    }

    particles.forEach((pItem, i) => {
      // speed up the particles drastically
      pItem.t += delta * pItem.speed * (1 + (hyperjumpMultiplier - 1) * 0.5);
      if (pItem.t >= 1) {
        pItem.t = 0;
        pItem.angle = Math.random() * Math.PI * 2;
        // make them spread out more during hyperjump
        pItem.radius = Math.random() * 0.15 * (1 + hyperjumpMultiplier * 0.5);
      }

      // Widen slightly as it falls
      const spread = 1 + pItem.t * 3;
      const x = Math.cos(pItem.angle) * pItem.radius * spread;
      const z = Math.sin(pItem.angle) * pItem.radius * spread;
      // Downwards velocity
      const y = -pItem.t * 5 * ignition * hyperjumpMultiplier; 

      // Shrink scale
      const scaleInit = 0.8;
      const scale = Math.max(0, (1 - pItem.t) * scaleInit * ignition * Math.max(1, hyperjumpMultiplier * 0.3));

      dummy.position.set(x, y, z);
      // add a bit of rotation to the particles
      dummy.rotation.set(pItem.t * Math.PI, pItem.t * Math.PI * 2, 0);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // Interpolate color from white/yellow at the base to dark orange/red at the tip
      if (pItem.t < 0.2) {
          color.setHex(0xffffff); // White hot base
          color.lerp(new THREE.Color(0xffdd00), pItem.t / 0.2); // To yellow
      } else {
          color.setHex(0xffdd00); // Yellow
          color.lerp(new THREE.Color(0xff3300), (pItem.t - 0.2) / 0.8); // To red-orange
      }
      
      // During hyperjump, shift colors to blinding cyan/white
      if (hyperjumpMultiplier > 1) {
          const hyperRatio = (hyperjumpMultiplier - 1) / 20; // 0 to 1
          color.lerp(new THREE.Color(0x00ffff), hyperRatio * 0.5);
          color.lerp(new THREE.Color(0xffffff), hyperRatio * 0.5);
      }

      meshRef.current!.setColorAt(i, color);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]} position={[-0.9, -2.9, 0]}>
      {/* icosahedron looks good for low poly fire bits */}
      <icosahedronGeometry args={[0.3, 0]} /> 
      <meshBasicMaterial transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} color="#ffffff" />
    </instancedMesh>
  );
}

function AnimatedModel() {
  const { gl } = useThree();
  const { scene } = useGLTF('/rocket_new.glb', true, true, (loader) => {
    if (!(loader as any).ktx2LoaderAttached) {
        const ktx2Loader = new KTX2Loader();
        ktx2Loader.setTranscoderPath('https://unpkg.com/three@0.184.0/examples/jsm/libs/basis/');
        ktx2Loader.detectSupport(gl);
        (loader as unknown as GLTFLoader).setKTX2Loader(ktx2Loader);
      (loader as any).ktx2LoaderAttached = true;
    }
  });

  const [target, setTarget] = useState<THREE.Group | null>(null);

  useMemo(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          child.material.envMapIntensity = 1.5;
          child.material.needsUpdate = true;
        }
      }
    });
    return () => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    };
  }, [scene]);

  useFrame((state, delta) => {
    if (!target) return;
    
    // Scale down on mobile to fit the narrow viewport
    const isMobile = window.innerWidth < 768;
    const baseScale = isMobile ? 0.6 : 1.0;
    
    const p = scrollState.progress;
    
    const kfs = [...keyframes];
    if (kfs.length === 0) return;

    // Spline Interpolation logic between keyframes
    let k1 = kfs[0];
    let k2 = kfs[kfs.length - 1];
    let t = 0;

    if (p <= k1.p) {
        k2 = k1; t = 0;
    } else if (p >= k2.p) {
        k1 = k2; t = 1;
    } else {
        for (let i = 0; i < kfs.length - 1; i++) {
            if (p >= kfs[i].p && p <= kfs[i+1].p) {
                k1 = kfs[i];
                k2 = kfs[i+1];
                t = (p - k1.p) / (k2.p - k1.p);
                break;
            }
        }
    }

    // Vectors and lerping
    const pos1 = new THREE.Vector3(...k1.position);
    const pos2 = new THREE.Vector3(...k2.position);
    const targetPos = pos1.lerp(pos2, t);

    // Apply scale dynamically (only baseScale for the group)
    target.scale.setScalar(baseScale);

    // Quaternions and slerping
    const q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(...k1.rotation));
    const q2 = new THREE.Quaternion().setFromEuler(new THREE.Euler(...k2.rotation));
    const targetQuat = q1.slerp(q2, t);

    // Smooth dampening during real scroll
    target.position.lerp(targetPos, 5 * delta);
    target.quaternion.slerp(targetQuat, 5 * delta);
  });

  return (
    <group ref={setTarget}>
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <primitive object={scene} scale={4} position={[0, -1, 0]} rotation={[0, 0, Math.PI / 2]} />
        <ThrusterFlames />
      </Float>
    </group>
  );
}

export function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      // Keep rendering if within ~2000px of the viewport (e.g. during CrewGreeting section)
      // Pause only when scrolled far down.
      { rootMargin: "2000px 0px" } 
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full pointer-events-none drop-shadow-[0_30px_30px_rgba(0,0,0,0.8)]">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }}
        frameloop={inView ? "always" : "never"}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, 0, -5]} intensity={10} color="#3b82f6" />
        <Environment preset="night" />
        <React.Suspense fallback={null}>
          <AnimatedModel />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
