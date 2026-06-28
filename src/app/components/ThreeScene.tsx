import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, useGLTF } from "@react-three/drei";
import React, { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useSnapshot } from 'valtio';
import { scrollState, keyframes } from "../store/rocketAnimation";

function ThrusterFlames({ targetRef }: { targetRef: React.MutableRefObject<THREE.Group | null> }) {
  const count = 800;
  const smokeCount = 300;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const smokeMeshRef = useRef<THREE.InstancedMesh>(null);
  
  const prevWorldPos = useRef(new THREE.Vector3());
  const smoothedVelocity = useRef(new THREE.Vector3());

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      t: Math.random(),
      speed: 1.5 + Math.random() * 2,
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * 0.5, 
    }));
  }, [count]);

  const smokeParticles = useMemo(() => {
    return Array.from({ length: smokeCount }, () => ({
      t: Math.random(),
      speed: 0.5 + Math.random() * 1.5,
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * 0.8,
    }));
  }, [smokeCount]);

  useFrame((state, delta) => {
    if (!meshRef.current || !targetRef.current || !smokeMeshRef.current) return;
    
    // --- PHYSICS BENDING (Scroll Trail) ---
    const currentWorldPos = new THREE.Vector3();
    targetRef.current.getWorldPosition(currentWorldPos);

    if (prevWorldPos.current.lengthSq() === 0) {
      prevWorldPos.current.copy(currentWorldPos);
    }
    
    const dt = delta || 0.016;
    const worldVel = new THREE.Vector3().subVectors(currentWorldPos, prevWorldPos.current).divideScalar(dt);
    prevWorldPos.current.copy(currentWorldPos);

    const localVel = worldVel.clone();
    const inverseWorldMatrix = meshRef.current.matrixWorld.clone().invert();
    localVel.transformDirection(inverseWorldMatrix);
    
    smoothedVelocity.current.lerp(localVel, 0.1);
    // ---------------------------------------

    const p = scrollState.progress;
    let ignition = Math.max(0.2, Math.min(p * 10, 1)); 
    let smokeIntensity = 0;

    // Heavy phase: 0.395 - 0.547 (Matches UI panel 2 'Heavy Food')
    if (p >= 0.395 && p <= 0.547) {
      const hP = (p - 0.395) / 0.152;
      if (hP < 0.2) {
        ignition = THREE.MathUtils.lerp(1, 0.05, hP / 0.2); // Sputter out
        smokeIntensity = hP / 0.2; // Smoke starts
      } else if (hP > 0.8) {
        ignition = THREE.MathUtils.lerp(0.05, 1, (hP - 0.8) / 0.2); // Reignite
        smokeIntensity = 1 - ((hP - 0.8) / 0.2); // Smoke clears
      } else {
        ignition = 0.05; // Almost dead, just smoke/embers
        smokeIntensity = 1.0; // Max smoke
      }
    }

    // HYPERJUMP effect: when p > 0.83, explode the flames!
    let hyperjumpMultiplier = 1;
    if (p > 0.83) {
      const hyperP = Math.max(0, Math.min(1, (p - 0.83) / (0.91 - 0.83)));
      hyperjumpMultiplier = 1 + Math.pow(hyperP, 3) * 20; 
    }

    // Update Fire Particles
    particles.forEach((pItem, i) => {
      pItem.t += delta * pItem.speed * (1 + (hyperjumpMultiplier - 1) * 0.5);
      if (pItem.t >= 1) {
        pItem.t %= 1;
        pItem.angle = Math.random() * Math.PI * 2;
        pItem.radius = Math.random() * 0.15 * (1 + hyperjumpMultiplier * 0.5);
      }

      const spread = 1 + pItem.t * 5; 
      let x = Math.cos(pItem.angle) * pItem.radius * spread;
      let z = Math.sin(pItem.angle) * pItem.radius * spread;
      
      const yMultiplier = 1 + Math.log(Math.max(1, hyperjumpMultiplier)) * 1.5;
      const y = -pItem.t * (4 + pItem.speed) * ignition * yMultiplier; 

      const shape = Math.sin(pItem.t * Math.PI) + 0.2 * (1 - pItem.t);
      const scaleInit = 1.2; 
      const scale = Math.max(0, shape * scaleInit * ignition * (1 + (hyperjumpMultiplier - 1) * 0.1));

      const flutterX = Math.sin(pItem.t * 15 + state.clock.elapsedTime * 25 + pItem.angle) * 0.08 * pItem.t;
      const flutterZ = Math.cos(pItem.t * 15 + state.clock.elapsedTime * 25 + pItem.angle) * 0.08 * pItem.t;
      x += flutterX;
      z += flutterZ;

      const bendFactor = pItem.t * pItem.t * 0.5;
      x += -smoothedVelocity.current.x * bendFactor;
      z += -smoothedVelocity.current.z * bendFactor;

      dummy.position.set(x, y, z);
      dummy.rotation.set(pItem.t * Math.PI, pItem.t * Math.PI * 2, pItem.t * Math.PI * 3);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      if (pItem.t < 0.2) {
          color.setHex(0xffffff); 
          color.lerp(new THREE.Color(0xffdd00), pItem.t / 0.2); 
      } else {
          color.setHex(0xffdd00); 
          color.lerp(new THREE.Color(0xff3300), (pItem.t - 0.2) / 0.8); 
      }
      
      if (hyperjumpMultiplier > 1) {
          const hyperRatio = (hyperjumpMultiplier - 1) / 20; 
          color.lerp(new THREE.Color(0xffffff), hyperRatio);
      }

      meshRef.current!.setColorAt(i, color);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
    }

    // Update Smoke Particles
    smokeParticles.forEach((pItem, i) => {
      if (smokeIntensity <= 0) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        smokeMeshRef.current!.setMatrixAt(i, dummy.matrix);
        return;
      }

      pItem.t += delta * pItem.speed * 0.8;
      if (pItem.t >= 1) {
        pItem.t %= 1;
        pItem.angle = Math.random() * Math.PI * 2;
        pItem.radius = Math.random() * 0.8;
      }

      const spread = 1 + pItem.t * 6;
      let x = Math.cos(pItem.angle) * pItem.radius * spread;
      let z = Math.sin(pItem.angle) * pItem.radius * spread;
      
      const y = -pItem.t * 6; // Falls slower than fire

      const shape = Math.sin(pItem.t * Math.PI); // Smooth fade in and out
      const scale = shape * 2.5 * smokeIntensity; 

      const bendFactor = pItem.t * pItem.t * 1.0;
      x += -smoothedVelocity.current.x * bendFactor;
      z += -smoothedVelocity.current.z * bendFactor;

      dummy.position.set(x, y, z);
      dummy.rotation.set(pItem.t * Math.PI, pItem.t * Math.PI * 2, pItem.t * Math.PI * 3);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      smokeMeshRef.current!.setMatrixAt(i, dummy.matrix);

      color.setHex(0x444444);
      color.lerp(new THREE.Color(0x111111), pItem.t);
      smokeMeshRef.current!.setColorAt(i, color);
    });

    smokeMeshRef.current.instanceMatrix.needsUpdate = true;
    if (smokeMeshRef.current.instanceColor) {
      smokeMeshRef.current.instanceColor.needsUpdate = true;
    }

  });

  return (
    <group position={[-0.9, -2.5, 0]}>
      {/* FIRE MESH */}
      <instancedMesh ref={meshRef} args={[null as any, null as any, count]}>
        <icosahedronGeometry args={[0.3, 0]} /> 
        <meshBasicMaterial transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} color="#ffffff" />
      </instancedMesh>

      {/* SMOKE MESH */}
      <instancedMesh ref={smokeMeshRef} args={[null as any, null as any, smokeCount]}>
        <icosahedronGeometry args={[0.3, 0]} /> 
        <meshBasicMaterial transparent opacity={0.4} blending={THREE.NormalBlending} depthWrite={false} color="#555555" />
      </instancedMesh>
    </group>
  );
}

function SportsObstacles() {
  const { gl } = useThree();
  const setupLoader = (loader: any) => {
    if (!loader.ktx2LoaderAttached) {
      const ktx2Loader = new KTX2Loader();
      ktx2Loader.setTranscoderPath('https://unpkg.com/three@0.184.0/examples/jsm/libs/basis/');
      ktx2Loader.detectSupport(gl);
      (loader as unknown as GLTFLoader).setKTX2Loader(ktx2Loader);
      loader.ktx2LoaderAttached = true;
    }
  };

  const { scene: gantela } = useGLTF('/gantela.glb', true, true, setupLoader);
  const { scene: basket } = useGLTF('/basket.glb', true, true, setupLoader);
  const { scene: amfootball } = useGLTF('/amfootball.glb', true, true, setupLoader);
  const { scene: formula } = useGLTF('/formula_3d.glb', true, true, setupLoader);

  useMemo(() => {
    gantela.scale.setScalar(0.7);
    basket.scale.setScalar(0.7);
    amfootball.scale.setScalar(0.6);
    formula.scale.setScalar(0.85);
  }, [gantela, basket, amfootball, formula]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    // Slow drifting and rotating around the ship
    gantela.position.set(3, 2 + Math.sin(time * 0.8) * 0.5, -2 + Math.cos(time * 0.5) * 1);
    gantela.rotation.set(time * 0.5, time * 0.2, 0);

    basket.position.set(-2.5, -1.5 + Math.cos(time * 0.7) * 0.5, 1 + Math.sin(time * 0.6) * 1);
    basket.rotation.set(time * 0.3, time * 0.4, 0);

    amfootball.position.set(4, -1 + Math.sin(time * 0.9) * 0.5, 2 + Math.cos(time * 0.7) * 1);
    amfootball.rotation.set(time * 0.4, 0, time * 0.3);

    formula.position.set(-3, 2 + Math.cos(time * 0.8) * 0.5, -1 + Math.sin(time * 0.8) * 1);
    formula.rotation.set(0, time * 0.5, time * 0.2);
  });

  return (
    <group>
      <primitive object={gantela} />
      <primitive object={basket} />
      <primitive object={amfootball} />
      <primitive object={formula} />
    </group>
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

  const targetRef = useRef<THREE.Group>(null);
  const parallaxGroupRef = useRef<THREE.Group>(null);

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
    if (!targetRef.current) return;
    const target = targetRef.current;
    
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

    // --- Apply Effects BEFORE lerping the actual mesh ---
    
    // HEAVY FOOD "Sad/Sick" Effect (0.395 - 0.547)
    if (p >= 0.395 && p <= 0.547) {
      const hP = (p - 0.395) / 0.152;
      // Sag downwards
      targetPos.y -= 2.0 * Math.sin(hP * Math.PI); 
      // Point the nose down (sadness)
      const qSad = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.4 * Math.sin(hP * Math.PI)));
      targetQuat.multiplyQuaternions(targetQuat, qSad);
    }

    // Smooth dampening during real scroll
    target.position.lerp(targetPos, 5 * delta);
    target.quaternion.slerp(targetQuat, 5 * delta);

    // HYPERJUMP Shake Effect
    if (p > 0.83) {
      const hyperP = Math.max(0, Math.min(1, (p - 0.83) / (0.91 - 0.83)));
      const intensity = Math.pow(hyperP, 3) * 0.4;
      target.position.x += (Math.random() - 0.5) * intensity;
      target.position.y += (Math.random() - 0.5) * intensity;
      target.position.z += (Math.random() - 0.5) * intensity;
    }

    // HEAVY FOOD Shake Effect
    if (p >= 0.395 && p <= 0.547) {
      // Mild engine sputter shake
      const shakeIntensity = 0.05;
      target.position.x += (Math.random() - 0.5) * shakeIntensity;
      target.position.y += (Math.random() - 0.5) * shakeIntensity;
    }

    // Interactive Mouse Parallax (Tilts the whole ship towards the mouse)
    if (parallaxGroupRef.current) {
      // state.pointer is normalized -1 to +1
      const targetRotX = state.pointer.y * -0.3; // tilt up/down
      const targetRotY = state.pointer.x * 0.3;  // turn left/right
      
      parallaxGroupRef.current.rotation.x = THREE.MathUtils.lerp(parallaxGroupRef.current.rotation.x, targetRotX, 4 * delta);
      parallaxGroupRef.current.rotation.y = THREE.MathUtils.lerp(parallaxGroupRef.current.rotation.y, targetRotY, 4 * delta);
    }
  });

  return (
<group ref={parallaxGroupRef}>
      <group ref={targetRef}>
        <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.4}>
          <primitive object={scene} scale={4} position={[0, -1, 0]} rotation={[0, 0, Math.PI / 2]} />
          <ThrusterFlames targetRef={targetRef} />
          <SportsObstacles />
        </Float>
      </group>
    </group>
  );
}

export function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const { isGameActive } = useSnapshot(scrollState);

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
        frameloop={(inView && !isGameActive) ? "always" : "never"}
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

// Removed preload to prevent KTX2 crash
