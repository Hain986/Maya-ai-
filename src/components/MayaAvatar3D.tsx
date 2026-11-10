import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

export const MayaAvatar3D: React.FC<{ 
  color?: number; 
  shape?: string; 
  animationState?: 'idle' | 'speaking' | 'thinking' | 'nodding' | 'waving' | 'checking-watch' | 'hugging';
  outfitId?: string;
  fadeKey?: any;
}> = ({ 
  color = 0x00ffff, 
  animationState = 'idle',
  outfitId,
  fadeKey,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animStateRef = useRef(animationState);
  const colorRef = useRef(color);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const fadeProgressRef = useRef<number>(1.0);

  useEffect(() => {
    animStateRef.current = animationState;
  }, [animationState]);

  // Smoothly trigger fade-in transition when outfit or color changes
  useEffect(() => {
    colorRef.current = color;
    if (materialRef.current) {
      materialRef.current.uniforms.color.value.setHex(color);
      fadeProgressRef.current = 0.0;
    }
  }, [color, outfitId, fadeKey]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Camera setup for Full Body view
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1000);
    camera.position.set(0, 0.2, 7.8); 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 600);
    currentMount.appendChild(renderer.domElement);

    // Root Humanoid Rig
    const avatarGroup = new THREE.Group();
    avatarGroup.position.y = -0.1;

    // Shader Material with holographic pulse, scanlines, and fadeAlpha
    const material = new THREE.ShaderMaterial({
      uniforms: { 
        time: { value: 0 }, 
        color: { value: new THREE.Color(color) },
        fadeAlpha: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv; 
        varying vec3 vNormal;
        void main() { 
          vUv = uv; 
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
        }
      `,
      fragmentShader: `
        uniform float time; 
        uniform vec3 color; 
        uniform float fadeAlpha;
        varying vec2 vUv; 
        varying vec3 vNormal;
        void main() { 
          float pulse = 0.82 + 0.18 * sin(time * 3.0); 
          float intensity = 0.5 + 0.5 * sin(vUv.y * 14.0 + time * 3.5); 
          float scanline = 0.92 + 0.08 * sin(vUv.y * 80.0 + time * 6.0);
          float rim = 1.0 - max(0.0, abs(vNormal.z));
          float alpha = fadeAlpha * pulse * (0.6 + intensity * 0.4 + rim * 0.4) * scanline;
          gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.95)); 
        }
      `,
      transparent: true, 
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    materialRef.current = material;
    fadeProgressRef.current = 0.0;

    // Accent darker material for hair and boots
    const accentMaterial = material.clone();

    // ==========================================
    // ANATOMICAL HIERARCHICAL SKELETAL RIG
    // ==========================================

    // 1. Pelvis / Hips (Root of torso & legs)
    const pelvisGroup = new THREE.Group();
    pelvisGroup.position.y = 0.05;

    const hipsGeom = new THREE.CylinderGeometry(0.24, 0.28, 0.35, 32);
    const hipsMesh = new THREE.Mesh(hipsGeom, material);
    pelvisGroup.add(hipsMesh);

    // 2. Spine & Waist (curves organically from pelvis)
    const spineGroup = new THREE.Group();
    spineGroup.position.y = 0.25;

    const waistGeom = new THREE.CylinderGeometry(0.21, 0.24, 0.32, 32);
    const waistMesh = new THREE.Mesh(waistGeom, material);
    waistMesh.position.y = 0.12;
    spineGroup.add(waistMesh);
    pelvisGroup.add(spineGroup);

    // 3. Chest & Ribcage (Bust, breathing expansion & shoulders)
    const chestGroup = new THREE.Group();
    chestGroup.position.y = 0.32;

    const chestGeom = new THREE.CylinderGeometry(0.25, 0.21, 0.36, 32);
    const chestMesh = new THREE.Mesh(chestGeom, material);
    chestMesh.position.y = 0.16;
    chestGroup.add(chestMesh);

    // Subtle bust contour
    const bustGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const leftBust = new THREE.Mesh(bustGeom, material);
    leftBust.position.set(0.1, 0.15, 0.15);
    const rightBust = new THREE.Mesh(bustGeom, material);
    rightBust.position.set(-0.1, 0.15, 0.15);
    chestGroup.add(leftBust, rightBust);

    // 4. Neck & Head
    const neckGroup = new THREE.Group();
    neckGroup.position.y = 0.36;

    const neckGeom = new THREE.CylinderGeometry(0.08, 0.1, 0.18, 16);
    const neckMesh = new THREE.Mesh(neckGeom, material);
    neckMesh.position.y = 0.08;
    neckGroup.add(neckMesh);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.22;

    const headGeom = new THREE.SphereGeometry(0.26, 32, 32);
    const headMesh = new THREE.Mesh(headGeom, material);
    headMesh.scale.set(0.95, 1.15, 1.0);
    headGroup.add(headMesh);

    // Hair silhouette (feminine long flowing hair)
    const hairGeom = new THREE.SphereGeometry(0.29, 24, 24);
    const hairMesh = new THREE.Mesh(hairGeom, accentMaterial);
    hairMesh.position.set(0, 0.05, -0.06);
    hairMesh.scale.set(1.02, 1.1, 1.1);

    const hairPonytailGeom = new THREE.CylinderGeometry(0.08, 0.14, 0.65, 16);
    const hairPonytail = new THREE.Mesh(hairPonytailGeom, accentMaterial);
    hairPonytail.position.set(0, -0.25, -0.22);
    hairPonytail.rotation.x = -0.2;

    headGroup.add(hairMesh, hairPonytail);
    neckGroup.add(headGroup);
    chestGroup.add(neckGroup);

    // 5. Left Arm Hierarchy (Clavicle -> Upper Arm -> Forearm -> Hand)
    const leftShoulderGroup = new THREE.Group();
    leftShoulderGroup.position.set(0.32, 0.28, 0);

    const leftUpperArm = new THREE.Group();
    const upperArmGeom = new THREE.CylinderGeometry(0.05, 0.045, 0.42, 16);
    const leftUpperArmMesh = new THREE.Mesh(upperArmGeom, material);
    leftUpperArmMesh.position.y = -0.2;
    leftUpperArm.add(leftUpperArmMesh);

    const leftForearm = new THREE.Group();
    leftForearm.position.y = -0.42;
    const forearmGeom = new THREE.CylinderGeometry(0.045, 0.04, 0.4, 16);
    const leftForearmMesh = new THREE.Mesh(forearmGeom, material);
    leftForearmMesh.position.y = -0.19;
    leftForearm.add(leftForearmMesh);

    const leftHand = new THREE.Group();
    leftHand.position.y = -0.38;
    const handGeom = new THREE.SphereGeometry(0.045, 16, 16);
    const leftHandMesh = new THREE.Mesh(handGeom, material);
    leftHandMesh.scale.set(0.7, 1.2, 0.5);
    leftHand.add(leftHandMesh);

    leftForearm.add(leftHand);
    leftUpperArm.add(leftForearm);
    leftShoulderGroup.add(leftUpperArm);
    chestGroup.add(leftShoulderGroup);

    // 6. Right Arm Hierarchy (Clavicle -> Upper Arm -> Forearm -> Hand)
    const rightShoulderGroup = new THREE.Group();
    rightShoulderGroup.position.set(-0.32, 0.28, 0);

    const rightUpperArm = new THREE.Group();
    const rightUpperArmMesh = new THREE.Mesh(upperArmGeom, material);
    rightUpperArmMesh.position.y = -0.2;
    rightUpperArm.add(rightUpperArmMesh);

    const rightForearm = new THREE.Group();
    rightForearm.position.y = -0.42;
    const rightForearmMesh = new THREE.Mesh(forearmGeom, material);
    rightForearmMesh.position.y = -0.19;
    rightForearm.add(rightForearmMesh);

    const rightHand = new THREE.Group();
    rightHand.position.y = -0.38;
    const rightHandMesh = new THREE.Mesh(handGeom, material);
    rightHandMesh.scale.set(0.7, 1.2, 0.5);
    rightHand.add(rightHandMesh);

    rightForearm.add(rightHand);
    rightUpperArm.add(rightForearm);
    rightShoulderGroup.add(rightUpperArm);
    chestGroup.add(rightShoulderGroup);

    spineGroup.add(chestGroup);

    // 7. Left Leg Hierarchy (Hip -> Thigh -> Knee/Shin -> Foot)
    const leftHipGroup = new THREE.Group();
    leftHipGroup.position.set(0.16, -0.15, 0);

    const leftThigh = new THREE.Group();
    const thighGeom = new THREE.CylinderGeometry(0.075, 0.055, 0.65, 16);
    const leftThighMesh = new THREE.Mesh(thighGeom, material);
    leftThighMesh.position.y = -0.32;
    leftThigh.add(leftThighMesh);

    const leftShin = new THREE.Group();
    leftShin.position.y = -0.65;
    const shinGeom = new THREE.CylinderGeometry(0.055, 0.045, 0.62, 16);
    const leftShinMesh = new THREE.Mesh(shinGeom, material);
    leftShinMesh.position.y = -0.31;
    leftShin.add(leftShinMesh);

    const leftFoot = new THREE.Group();
    leftFoot.position.y = -0.62;
    const footGeom = new THREE.BoxGeometry(0.08, 0.05, 0.18);
    const leftFootMesh = new THREE.Mesh(footGeom, material);
    leftFootMesh.position.set(0, -0.02, 0.05);
    leftFoot.add(leftFootMesh);

    leftShin.add(leftFoot);
    leftThigh.add(leftShin);
    leftHipGroup.add(leftThigh);
    pelvisGroup.add(leftHipGroup);

    // 8. Right Leg Hierarchy (Hip -> Thigh -> Knee/Shin -> Foot)
    const rightHipGroup = new THREE.Group();
    rightHipGroup.position.set(-0.16, -0.15, 0);

    const rightThigh = new THREE.Group();
    const rightThighMesh = new THREE.Mesh(thighGeom, material);
    rightThighMesh.position.y = -0.32;
    rightThigh.add(rightThighMesh);

    const rightShin = new THREE.Group();
    rightShin.position.y = -0.65;
    const rightShinMesh = new THREE.Mesh(shinGeom, material);
    rightShinMesh.position.y = -0.31;
    rightShin.add(rightShinMesh);

    const rightFoot = new THREE.Group();
    rightFoot.position.y = -0.62;
    const rightFootMesh = new THREE.Mesh(footGeom, material);
    rightFootMesh.position.set(0, -0.02, 0.05);
    rightFoot.add(rightFootMesh);

    rightShin.add(rightFoot);
    rightThigh.add(rightShin);
    rightHipGroup.add(rightThigh);
    pelvisGroup.add(rightHipGroup);

    // 9. Soft Radial Contact Shadow Grounding Plane
    const shadowGeom = new THREE.PlaneGeometry(1.6, 1.6);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.7,
    });
    const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.55;
    avatarGroup.add(shadowMesh);

    avatarGroup.add(pelvisGroup);
    scene.add(avatarGroup);

    // Studio Lighting Rig
    scene.add(new THREE.AmbientLight(0x303030, 2.5));
    const dir = new THREE.DirectionalLight(color, 2.8);
    dir.position.set(2, 3, 5);
    scene.add(dir);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(-3, 2, -4);
    scene.add(rimLight);

    // Cursor tracking
    const clock = new THREE.Clock();
    const mouse = new THREE.Vector2();
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let animationFrameId: number;

    // ==========================================
    // REAL-GIRL FULL BODY BIOMECHANICS & KINEMATICS LOOP
    // ==========================================
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      material.uniforms.time.value = time;
      accentMaterial.uniforms.time.value = time;

      // Smooth fade-in progress easing
      if (fadeProgressRef.current < 1.0) {
        fadeProgressRef.current = Math.min(1.0, fadeProgressRef.current + delta * 2.2);
      }
      material.uniforms.fadeAlpha.value = fadeProgressRef.current;
      accentMaterial.uniforms.fadeAlpha.value = fadeProgressRef.current;

      const state = animStateRef.current;

      // 1. Natural Contrapposto Weight Shift & Hip Sway
      // In real life, women gently shift their weight from one leg to the other
      const weightShift = Math.sin(time * 0.55); // ~11s natural stance cycle
      const breath = Math.sin(time * 1.5); // ~4.2s natural breathing cycle

      // Hip translation and tilt
      pelvisGroup.position.x = weightShift * 0.055;
      pelvisGroup.position.y = 0.05 + breath * 0.012;
      pelvisGroup.rotation.z = -weightShift * 0.045;
      pelvisGroup.rotation.y = Math.sin(time * 0.28) * 0.03;

      // Spine & Waist naturally counter-rotates to maintain balance
      spineGroup.rotation.z = weightShift * 0.035;
      spineGroup.rotation.y = -pelvisGroup.rotation.y * 0.6;

      // Chest & Ribcage rises with breathing & soft secondary rotation
      chestGroup.scale.set(1 + breath * 0.024, 1 + breath * 0.018, 1 + breath * 0.032);
      chestGroup.position.y = 0.32 + breath * 0.008;
      chestGroup.rotation.z = weightShift * 0.015;

      // Natural Leg Posture (One weight-bearing leg, one relaxed leg)
      if (weightShift > 0) {
        // Weight on Left Leg (left straight, right relaxed/bent)
        leftThigh.rotation.z = -0.04 - weightShift * 0.03;
        leftShin.rotation.x = 0.02;
        rightThigh.rotation.z = 0.08 + weightShift * 0.05;
        rightShin.rotation.x = 0.15 + weightShift * 0.1;
      } else {
        // Weight on Right Leg (right straight, left relaxed/bent)
        rightThigh.rotation.z = 0.04 - weightShift * 0.03;
        rightShin.rotation.x = 0.02;
        leftThigh.rotation.z = -0.08 + weightShift * 0.05;
        leftShin.rotation.x = 0.15 - weightShift * 0.1;
      }

      // Hair soft secondary inertia sway
      hairPonytail.rotation.z = Math.sin(time * 1.5 - 0.5) * 0.05 - weightShift * 0.04;
      hairPonytail.rotation.x = -0.2 + Math.cos(time * 1.5) * 0.03;

      // 2. Behavioral Movement States
      if (state === 'speaking') {
        // SPEAKING STATE: Conversational full-body gestures & expressive hands
        // Attentive body lean towards the user
        spineGroup.rotation.x = 0.06;

        // Head nods rhythmically with conversational cadence
        headGroup.rotation.x = Math.sin(time * 7.5) * 0.06 + Math.sin(time * 2.5) * 0.04;
        headGroup.rotation.y = mouse.x * 0.25 + Math.sin(time * 4.0) * 0.05;
        headGroup.rotation.z = Math.sin(time * 3.5) * 0.04;
        headGroup.scale.set(1 + Math.sin(time * 25) * 0.04, 1 + Math.cos(time * 20) * 0.04, 1);

        // Right Arm gestures gracefully emphasizing words
        rightUpperArm.rotation.x = 0.35 + Math.sin(time * 5.0) * 0.15;
        rightUpperArm.rotation.z = -0.45 - Math.sin(time * 3.5) * 0.1;
        rightForearm.rotation.x = 0.75 + Math.cos(time * 5.0) * 0.25;
        rightForearm.rotation.y = -0.3 + Math.sin(time * 4.0) * 0.15;
        rightHand.rotation.z = Math.sin(time * 5.0) * 0.2;

        // Left Arm relaxed near hip with gentle counter-sway
        leftUpperArm.rotation.x = Math.sin(time * 2.0) * 0.05;
        leftUpperArm.rotation.z = 0.25 + Math.sin(time * 3.0) * 0.05;
        leftForearm.rotation.x = 0.2 + Math.sin(time * 2.5) * 0.05;

      } else if (state === 'thinking') {
        // THINKING STATE: Hand raised thoughtfully toward chin, head tilted
        spineGroup.rotation.x = -0.02;

        // Head tilts curiously upward and to the side
        headGroup.rotation.z = 0.24 + Math.sin(time * 1.8) * 0.03;
        headGroup.rotation.y = 0.18 + mouse.x * 0.15;
        headGroup.rotation.x = -0.12 + Math.sin(time * 2.0) * 0.03;
        headGroup.scale.set(1, 1, 1);

        // Right Arm raises up towards chin in thinking posture
        rightUpperArm.rotation.x = 0.85 + Math.sin(time * 1.5) * 0.03;
        rightUpperArm.rotation.z = -0.3;
        rightForearm.rotation.x = 1.35 + Math.sin(time * 1.8) * 0.04;
        rightForearm.rotation.y = -0.45;
        rightHand.rotation.x = 0.2;

        // Left Arm tucked across lower ribs supporting posture
        leftUpperArm.rotation.x = 0.25;
        leftUpperArm.rotation.z = 0.35;
        leftForearm.rotation.x = 0.65;
        leftForearm.rotation.y = 0.4;

      } else if (state === 'waving') {
        // WAVING STATE: Right arm raised waving cheerfully
        headGroup.rotation.y = Math.sin(time * 6.0) * 0.1 + mouse.x * 0.2;
        headGroup.rotation.z = 0.15;
        rightUpperArm.rotation.x = 0.9;
        rightUpperArm.rotation.z = -0.8;
        rightForearm.rotation.x = 1.1 + Math.sin(time * 12.0) * 0.3;
        rightHand.rotation.z = Math.sin(time * 12.0) * 0.4;
      } else if (state === 'checking-watch') {
        // CHECKING WATCH STATE: Right arm raised to wrist, head tilted down looking at wrist
        headGroup.rotation.x = 0.3;
        headGroup.rotation.z = -0.2;
        rightUpperArm.rotation.x = 0.4;
        rightUpperArm.rotation.z = -0.3;
        rightForearm.rotation.x = 1.4;
        rightForearm.rotation.y = 0.5;
      } else if (state === 'hugging') {
        // HUGGING STATE: Both arms opening/reaching forward for a warm hug
        chestGroup.position.z = 0.15;
        leftUpperArm.rotation.x = 0.5;
        leftUpperArm.rotation.z = -0.8;
        leftForearm.rotation.x = 1.2;
        rightUpperArm.rotation.x = 0.5;
        rightUpperArm.rotation.z = 0.8;
        rightForearm.rotation.x = 1.2;
      } else {
        // IDLE STATE: Lifelike feminine relaxed posture, breathing, soft arm sway
        spineGroup.rotation.x = 0;

        // Head naturally follows mouse cursor with soft tilt
        headGroup.rotation.y = mouse.x * 0.28 + Math.sin(time * 0.65) * 0.03;
        headGroup.rotation.x = -mouse.y * 0.20 + Math.sin(time * 0.8) * 0.02;
        headGroup.rotation.z = -weightShift * 0.025 + Math.sin(time * 0.7) * 0.015;
        headGroup.scale.set(1, 1, 1);

        // Relaxed natural arms gently resting near hips with breathing pulse
        leftUpperArm.rotation.x = Math.sin(time * 1.5) * 0.03;
        leftUpperArm.rotation.z = 0.24 + Math.sin(time * 0.55) * 0.03;
        leftForearm.rotation.x = 0.18 + Math.sin(time * 1.5 - 0.5) * 0.02;

        rightUpperArm.rotation.x = -Math.sin(time * 1.5) * 0.03;
        rightUpperArm.rotation.z = -0.24 - Math.sin(time * 0.55) * 0.03;
        rightForearm.rotation.x = 0.18 + Math.sin(time * 1.5 - 0.5) * 0.02;
      }

      // 3D Cinematic Camera Dolly Focus Zoom
      let targetCamZ = 7.8;
      let targetCamY = 0.2;

      if (state === 'thinking') {
        targetCamZ = 5.2; // Cinematic close-up on Maya's face & eyes during reflection
        targetCamY = 0.52;
      } else if (state === 'speaking') {
        targetCamZ = 6.3; // Intimate portrait camera distance during conversation
        targetCamY = 0.38;
      }

      camera.position.z += (targetCamZ - camera.position.z) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;

      // Smooth avatar group mouse follow & breathing balance sway
      const targetRotY = mouse.x * 0.22 + Math.sin(time * 0.35) * 0.02;
      const targetRotX = -mouse.y * 0.15;
      const targetPosY = -0.1 + breath * 0.015;

      avatarGroup.rotation.y += (targetRotY - avatarGroup.rotation.y) * 0.05;
      avatarGroup.rotation.x += (targetRotX - avatarGroup.rotation.x) * 0.05;
      avatarGroup.position.y += (targetPosY - avatarGroup.position.y) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
      accentMaterial.dispose();
    };
  }, []); // Stable lifecycle, animation updates handled inside rAF loop

  return (
    <motion.div 
      key={`avatar3d-${outfitId || color}-${fadeKey || 0}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      ref={mountRef} 
      className="w-full h-[600px] flex justify-center items-center" 
    />
  );
};
