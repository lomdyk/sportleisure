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

function FoodObstacles() {
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

  const { scene: apple } = useGLTF('/apple-detailled-normal.glb', true, true, setupLoader);
  const { scene: potion } = useGLTF('/potion-detailled-normal.glb', true, true, setupLoader);
  const { scene: pizza } = useGLTF('/pizza-detailled-normal.glb', true, true, setupLoader);
  const { scene: cheese } = useGLTF('/cheese-detailled-normal.glb', true, true, setupLoader);

  const apple2 = useMemo(() => apple.clone(), [apple]);
  const potion2 = useMemo(() => potion.clone(), [potion]);
  const pizza2 = useMemo(() => pizza.clone(), [pizza]);
  const cheese2 = useMemo(() => cheese.clone(), [cheese]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const p = scrollState.progress;

    // Formula phase: 0.548 - 0.689 (Matches UI panel 3 'Formula Power')
    const isFormula = p >= 0.548 && p <= 0.689;
    const fPhase = isFormula ? (p - 0.548) / 0.141 : 0;
    
    // Heavy phase: 0.395 - 0.547 (Matches UI panel 2 'Heavy Food')
    const isHeavy = p >= 0.395 && p <= 0.547;
    const hPhase = isHeavy ? (p - 0.395) / 0.152 : 0;

    if (isFormula) {
      apple.visible = true;
      potion.visible = true;
      apple2.visible = true;
      potion2.visible = true;
      
      const noseX = 2;
      const engineX = -2.0;
      const engineY = -0.2;
      const engineZ = 0;
      
      const smoothF = fPhase * fPhase * (3 - 2 * fPhase);
      
      let currentX = noseX + 8 - (smoothF * 10);
      let appleY = 1.0 + Math.sin(smoothF * Math.PI * 3) * 0.8;
      let appleZ = -1.0;
      let potionY = -1.5 - Math.sin(smoothF * Math.PI * 3) * 0.8;
      let potionZ = 1.0;
      
      let apple2Y = 0.5 + Math.cos(smoothF * Math.PI * 3) * 0.8;
      let apple2Z = 1.5;
      let potion2Y = -0.5 - Math.cos(smoothF * Math.PI * 3) * 0.8;
      let potion2Z = -1.5;

      let appleX = currentX;
      let potionX = currentX - 1.5;
      let apple2X = currentX - 0.5;
      let potion2X = currentX - 2.5;

      if (fPhase > 0.7) {
        const suctionP = (fPhase - 0.7) / 0.3; // 0 to 1
        const smoothSuction = suctionP * suctionP * (3 - 2 * suctionP);
        
        appleX = THREE.MathUtils.lerp(appleX, engineX, smoothSuction);
        appleY = THREE.MathUtils.lerp(appleY, engineY, smoothSuction);
        appleZ = THREE.MathUtils.lerp(appleZ, engineZ, smoothSuction);
        
        potionX = THREE.MathUtils.lerp(potionX, engineX, smoothSuction);
        potionY = THREE.MathUtils.lerp(potionY, engineY, smoothSuction);
        potionZ = THREE.MathUtils.lerp(potionZ, engineZ, smoothSuction);
        
        apple2X = THREE.MathUtils.lerp(apple2X, engineX, smoothSuction);
        apple2Y = THREE.MathUtils.lerp(apple2Y, engineY, smoothSuction);
        apple2Z = THREE.MathUtils.lerp(apple2Z, engineZ, smoothSuction);
        
        potion2X = THREE.MathUtils.lerp(potion2X, engineX, smoothSuction);
        potion2Y = THREE.MathUtils.lerp(potion2Y, engineY, smoothSuction);
        potion2Z = THREE.MathUtils.lerp(potion2Z, engineZ, smoothSuction);
      }
      
      apple.position.set(appleX, appleY, appleZ);
      potion.position.set(potionX, potionY, potionZ); 
      apple2.position.set(apple2X, apple2Y, apple2Z);
      potion2.position.set(potion2X, potion2Y, potion2Z);
      
      // Graceful tumbling
      apple.rotation.x += delta * 1.0;
      apple.rotation.y += delta * 1.2;
      potion.rotation.z -= delta * 1.0;
      potion.rotation.y += delta * 1.2;
      apple2.rotation.z += delta * 0.8;
      apple2.rotation.y += delta * 1.5;
      potion2.rotation.x += delta * 1.2;
      potion2.rotation.z -= delta * 0.8;

      const baseAppleScale = 3.0;
      const basePotionScale = 2.4;
      let scaleMult = 1;
      if (fPhase < 0.1) {
        scaleMult = fPhase / 0.1; 
      } else if (fPhase > 0.7) {
        scaleMult = 1 - (fPhase - 0.7) / 0.3; 
      }
      
      apple.scale.setScalar(baseAppleScale * scaleMult);
      potion.scale.setScalar(basePotionScale * scaleMult);
      apple2.scale.setScalar(baseAppleScale * scaleMult * 0.8);
      potion2.scale.setScalar(basePotionScale * scaleMult * 0.9);
    } else {
      apple.visible = false;
      potion.visible = false;
      apple2.visible = false;
      potion2.visible = false;
    }

    if (isHeavy) {
      pizza.visible = true;
      cheese.visible = true;
      pizza2.visible = true;
      cheese2.visible = true;
      
      const noseX = 2;
      const basePizzaScale = 1.5;
      const baseCheeseScale = 1.2;

      if (hPhase < 0.4) {
        const approachP = hPhase / 0.4; 
        const smoothApp = approachP * approachP * (3 - 2 * approachP);
        const currentX = noseX + 12 - (smoothApp * 12);
        
        pizza.position.set(currentX, -0.5, 0.8);
        cheese.position.set(currentX + 2.5, -1.5, -0.8);
        
        pizza2.position.set(currentX + 1.0, 1.2, -1.0);
        cheese2.position.set(currentX + 3.5, 0.5, 1.5);
        
        pizza.rotation.x += delta * 0.5;
        cheese.rotation.z += delta * 0.5;
        pizza2.rotation.y += delta * 0.4;
        cheese2.rotation.x -= delta * 0.6;
      } else {
        const bounceP = (hPhase - 0.4) / 0.6; 
        const easeBounce = 1 - (1 - bounceP) * (1 - bounceP);
        
        const currentX = noseX - (easeBounce * 10); 
        
        pizza.position.set(currentX, -0.5 + (easeBounce * 4), 0.8 + (easeBounce * 3));
        cheese.position.set(currentX + 2.5, -1.5 - (easeBounce * 4), -0.8 - (easeBounce * 3));
        
        pizza2.position.set(currentX + 1.0, 1.2 + (easeBounce * 3), -1.0 - (easeBounce * 2));
        cheese2.position.set(currentX + 3.5, 0.5 - (easeBounce * 5), 1.5 + (easeBounce * 4));

        pizza.rotation.x += delta * 1.5;
        pizza.rotation.y += delta * 1.0;
        cheese.rotation.y -= delta * 1.5;
        cheese.rotation.z += delta * 1.0;
        
        pizza2.rotation.x -= delta * 1.2;
        pizza2.rotation.z += delta * 0.8;
        cheese2.rotation.x += delta * 1.5;
        cheese2.rotation.y -= delta * 1.2;
      }
      
      let scaleMult = 1;
      if (hPhase < 0.1) {
        scaleMult = hPhase / 0.1; 
      } else if (hPhase > 0.9) {
        scaleMult = 1 - (hPhase - 0.9) / 0.1; 
      }
      
      pizza.scale.setScalar(basePizzaScale * scaleMult);
      cheese.scale.setScalar(baseCheeseScale * scaleMult);
      pizza2.scale.setScalar(basePizzaScale * scaleMult * 0.85);
      cheese2.scale.setScalar(baseCheeseScale * scaleMult * 0.9);
    } else {
      pizza.visible = false;
      cheese.visible = false;
      pizza2.visible = false;
      cheese2.visible = false;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={apple} />
      <primitive object={potion} />
      <primitive object={apple2} />
      <primitive object={potion2} />
      <primitive object={pizza} />
      <primitive object={cheese} />
      <primitive object={pizza2} />
      <primitive object={cheese2} />
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
          <FoodObstacles />
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
