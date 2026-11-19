import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * FORJA-BOT — mascote holográfico 3D.
 * Robô treinador montado proceduralmente: corpo grafite, núcleo e visor
 * em menta emissiva, anéis de holograma girando sob ele.
 * - Cabeça acompanha o ponteiro do mouse
 * - Prop `pulse` incrementado dispara uma saudação com o braço
 * - Funciona com prefers-reduced-motion (animações paradas)
 */

interface Mascot3DProps {
  /** Incremente para fazer o mascote acenar */
  pulse?: number;
  /** Raio da cena (altura em px do container) */
  className?: string;
}

const MINT = 0x2ee6a8;
const BODY = 0x1c2126;
const DARK = 0x10141a;

export default function Mascot3D({ pulse = 0, className }: Mascot3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const stateRef = useRef<{ waveUntil: number; pointer: THREE.Vector2 }>({
    waveUntil: 0,
    pointer: new THREE.Vector2(0, 0),
  });

  useEffect(() => {
    if (pulse > 0) stateRef.current.waveUntil = performance.now() + 1800;
  }, [pulse]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // WebGL indisponível → mantém apenas o pôster (nunca um canvas preto, nunca um crash)
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') ?? probe.getContext('webgl');
    if (!gl) {
      setFailed(true);
      return;
    }
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(DARK, 6, 14);

    const camera = new THREE.PerspectiveCamera(
      38,
      mount.clientWidth / mount.clientHeight,
      0.1,
      60
    );
    camera.position.set(0, 2.1, 9.6);
    camera.lookAt(0, 1.15, 0);

    // Luzes — chave fria + preenchimento menta
    scene.add(new THREE.AmbientLight(0x8899aa, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new THREE.PointLight(MINT, 26, 12);
    rim.position.set(-2.4, 2.2, 2.2);
    scene.add(rim);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: BODY,
      metalness: 0.85,
      roughness: 0.32,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: DARK,
      metalness: 0.7,
      roughness: 0.5,
    });
    const glowMat = new THREE.MeshStandardMaterial({
      color: MINT,
      emissive: MINT,
      emissiveIntensity: 2.2,
      metalness: 0.1,
      roughness: 0.35,
    });
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x06231a,
      emissive: MINT,
      emissiveIntensity: 1.4,
      metalness: 0.2,
      roughness: 0.2,
      transparent: true,
      opacity: 0.92,
    });

    // ---- Robô ----
    const bot = new THREE.Group();
    scene.add(bot);

    const addPart = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      x: number,
      y: number,
      z: number,
      parent: THREE.Object3D = bot
    ) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // Torso (caixa arredondada)
    addPart(new RoundedBoxGeometry(1.5, 1.7, 0.95, 5, 0.22), bodyMat, 0, 0, 0);
    // Núcleo emissivo no peito
    const core = addPart(new THREE.SphereGeometry(0.21, 32, 32), glowMat, 0, 0.28, 0.46);
    const coreRing = addPart(new THREE.TorusGeometry(0.3, 0.028, 16, 48), glowMat, 0, 0.28, 0.44);
    // Painel abdominal
    addPart(new RoundedBoxGeometry(0.9, 0.42, 0.12, 4, 0.06), darkMat, 0, -0.52, 0.44);

    // Pescoço + cabeça (grupo para seguir o mouse)
    addPart(new THREE.CylinderGeometry(0.18, 0.22, 0.28, 24), darkMat, 0, 0.98, 0);
    const head = new THREE.Group();
    head.position.set(0, 1.42, 0);
    bot.add(head);
    addPart(new RoundedBoxGeometry(1.15, 0.92, 0.95, 5, 0.26), bodyMat, 0, 0, 0, head);
    addPart(new RoundedBoxGeometry(0.86, 0.34, 0.16, 4, 0.08), visorMat, 0, 0.03, 0.44, head);
    // Olhos — pontos no visor
    addPart(new THREE.SphereGeometry(0.055, 16, 16), glowMat, -0.19, 0.04, 0.53, head);
    addPart(new THREE.SphereGeometry(0.055, 16, 16), glowMat, 0.19, 0.04, 0.53, head);
    // Antena com ponta emissiva
    addPart(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 12), darkMat, 0.34, 0.6, 0, head);
    addPart(new THREE.SphereGeometry(0.07, 16, 16), glowMat, 0.34, 0.83, 0, head);

    // Braços (grupos articulados no ombro)
    const makeArm = (side: 1 | -1) => {
      const arm = new THREE.Group();
      arm.position.set(side * 0.92, 0.62, 0);
      bot.add(arm);
      addPart(new THREE.SphereGeometry(0.2, 20, 20), darkMat, 0, 0, 0, arm);
      addPart(new THREE.CapsuleGeometry(0.14, 0.62, 8, 20), bodyMat, 0, -0.42, 0, arm);
      addPart(new THREE.SphereGeometry(0.17, 20, 20), darkMat, 0, -0.86, 0, arm);
      // faixa luminosa no antebraço
      addPart(new THREE.TorusGeometry(0.145, 0.02, 12, 32), glowMat, 0, -0.62, 0, arm);
      return arm;
    };
    const armR = makeArm(1);
    const armL = makeArm(-1);

    // Pernas
    const makeLeg = (side: 1 | -1) => {
      const leg = new THREE.Group();
      leg.position.set(side * 0.42, -0.9, 0);
      bot.add(leg);
      addPart(new THREE.CapsuleGeometry(0.16, 0.62, 8, 20), bodyMat, 0, -0.4, 0, leg);
      addPart(new RoundedBoxGeometry(0.42, 0.22, 0.62, 4, 0.08), darkMat, 0, -0.86, 0.08, leg);
      return leg;
    };
    makeLeg(1);
    makeLeg(-1);

    bot.position.y = 1.62;
    bot.scale.setScalar(0.92);

    // ---- Base holográfica ----
    const base = new THREE.Group();
    scene.add(base);
    const ringMat = new THREE.MeshBasicMaterial({
      color: MINT,
      transparent: true,
      opacity: 0.5,
    });
    const rings: THREE.Mesh[] = [1.7, 2.15, 2.6].map((radius, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.015 + i * 0.004, 8, 90),
        ringMat.clone()
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.32 - i * 0.14;
      base.add(ring);
      return ring;
    });
    // Disco de luz sob o robô
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(1.35, 48),
      new THREE.MeshBasicMaterial({ color: MINT, transparent: true, opacity: 0.08 })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.31;
    base.add(disc);
    // Grade de chão
    const grid = new THREE.GridHelper(30, 44, 0x1f4d3e, 0x16211d);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.5;
    grid.position.y = 0;
    scene.add(grid);

    // Partículas flutuantes
    const particleCount = 120;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = Math.random() * 5.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ color: MINT, size: 0.035, transparent: true, opacity: 0.65 })
    );
    scene.add(particles);

    // ---- Interação ----
    const onPointer = (ev: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      stateRef.current.pointer.set(
        ((ev.clientX - rect.left) / rect.width) * 2 - 1,
        ((ev.clientY - rect.top) / rect.height) * 2 - 1
      );
    };
    window.addEventListener('pointermove', onPointer);

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    let raf = 0;
    const clock = new THREE.Clock();
    let t = 0;

    const renderFrame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      t += dt;
      const { pointer, waveUntil } = stateRef.current;
      const waving = performance.now() < waveUntil;

      if (!reduced) {
        // Flutuação suave
        bot.position.y = 1.62 + Math.sin(t * 1.4) * 0.09;
        bot.rotation.y = Math.sin(t * 0.5) * 0.08 + pointer.x * 0.12;
        // Cabeça segue o ponteiro
        head.rotation.y += (pointer.x * 0.45 - head.rotation.y) * 0.08;
        head.rotation.x += (-pointer.y * 0.25 - head.rotation.x) * 0.08;
        // Braço direito: aceno quando `pulse` dispara
        const targetWave = waving ? Math.sin(t * 10) * 0.55 - 1.4 : Math.sin(t * 1.4) * 0.06;
        armR.rotation.z += (targetWave - armR.rotation.z) * 0.14;
        armR.rotation.x += ((waving ? 0.3 : 0) - armR.rotation.x) * 0.1;
        armL.rotation.z = Math.sin(t * 1.4 + 1.2) * 0.06;
        // Núcleo pulsante
        const pulseScale = 1 + Math.sin(t * 3.2) * 0.12;
        core.scale.setScalar(pulseScale);
        (core.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.9 + Math.sin(t * 3.2) * 0.7;
        coreRing.rotation.z = t * 1.3;
        // Anéis
        rings.forEach((ring, i) => {
          ring.rotation.z = t * (0.25 + i * 0.18) * (i % 2 === 0 ? 1 : -1);
          (ring.material as THREE.MeshBasicMaterial).opacity = 0.32 + Math.sin(t * 2 + i) * 0.14;
        });
        particles.rotation.y = t * 0.02;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(renderFrame);
    };
    raf = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      mount.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className={className ?? 'relative'} aria-hidden="true">
      {/* Pôster estático por trás do canvas — nunca um canvas preto */}
      <div className="holo-ring absolute inset-0" />
      {!failed && <div ref={mountRef} className="absolute inset-0" />}
    </div>
  );
}
