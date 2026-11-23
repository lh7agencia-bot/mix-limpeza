import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Eye, EyeOff, Layers, RotateCw, Sparkles } from 'lucide-react';

type CameraPreset = 'overview' | 'spray' | 'kit';

interface CameraTargetState {
  position: [number, number, number];
  lookAt: [number, number, number];
}

const CAMERA_PRESETS: Record<CameraPreset, CameraTargetState> = {
  overview: { position: [2.65, 1.95, 3.35], lookAt: [0.05, 0.72, 0.05] },
  spray: { position: [1.75, 1.5, 2.85], lookAt: [-0.25, 0.92, 0.08] },
  kit: { position: [-2.35, 1.8, 2.85], lookAt: [0.22, 0.62, 0.05] },
};

// Scratch math objects allocated once outside render loop (Zero GC)
const _camGoal = new THREE.Vector3();
const _lookGoal = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _colorScratch = new THREE.Color();

function createLabelCanvasTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle pepperoni accent stripe
    ctx.fillStyle = '#E63946';
    ctx.fillRect(0, 0, canvas.width, 28);
    ctx.fillRect(0, canvas.height - 18, canvas.width, 18);

    // Clean brand typography
    ctx.fillStyle = '#18181B';
    ctx.font = 'bold 52px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('mix limpeza', canvas.width / 2, 118);

    ctx.fillStyle = '#E63946';
    ctx.font = '600 26px "DM Sans", system-ui, sans-serif';
    ctx.fillText('LIMPEZA QUE BRILHA', canvas.width / 2, 166);

    ctx.fillStyle = '#52525B';
    ctx.font = '500 18px "DM Sans", system-ui, sans-serif';
    ctx.fillText('Fórmula Profissional · Alto Brilho', canvas.width / 2, 206);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createMicrofiberBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 8) {
      for (let x = 0; x < 128; x += 8) {
        const checker = ((x + y) / 8) % 2 === 0;
        ctx.fillStyle = checker ? '#b8b8b8' : '#585858';
        ctx.fillRect(x, y, 7, 7);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

function createStoneBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#969696';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 650; i++) {
      const x = (i * 73) % 256;
      const y = (i * 137) % 256;
      const w = 2 + (i % 5);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(60,60,60,0.14)';
      ctx.fillRect(x, y, w, 1);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 124);
    grad.addColorStop(0, 'rgba(24, 24, 27, 0.42)');
    grad.addColorStop(0.55, 'rgba(24, 24, 27, 0.16)');
    grad.addColorStop(1, 'rgba(24, 24, 27, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }

  return new THREE.CanvasTexture(canvas);
}

export function ThreeCleaningScene() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [preset, setPreset] = useState<CameraPreset>('overview');
  const [exploded, setExploded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  const presetRef = useRef<CameraPreset>('overview');
  const explodedRef = useRef(false);
  const autoRotateRef = useRef(false);
  const triggerCameraTransitionRef = useRef<((p: CameraPreset) => void) | null>(null);
  const requestRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    presetRef.current = preset;
    triggerCameraTransitionRef.current?.(preset);
  }, [preset]);

  useEffect(() => {
    explodedRef.current = exploded;
    requestRenderRef.current?.();
  }, [exploded]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    requestRenderRef.current?.();
  }, [autoRotate]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // Software WebGL probe (renderer string only, never userAgent)
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    const scene = new THREE.Scene();
    const bgHex = 0xf5f5f5;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.032);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 60);
    camera.position.set(...CAMERA_PRESETS.overview.position);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.setAttribute('aria-label', 'Cena 3D interativa de equipamentos da mix limpeza');
    container.appendChild(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
      requestRender();
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    // Mandatory studio reflection map on every device
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Warm key light + cool hemisphere fill + subtle rim highlight
    const hemiLight = new THREE.HemisphereLight(0xeef4ff, 0xd4cfc9, 0.72);
    hemiLight.position.set(0, 8, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.2);
    keyLight.position.set(4.5, 6.5, 4.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 18;
    keyLight.shadow.camera.left = -3.2;
    keyLight.shadow.camera.right = 3.2;
    keyLight.shadow.camera.top = 3.2;
    keyLight.shadow.camera.bottom = -3.2;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xdbeafe, 0.9);
    rimLight.position.set(-4.5, 3.2, -3.5);
    scene.add(rimLight);

    // Procedural textures
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const labelTex = createLabelCanvasTexture();
    labelTex.anisotropy = maxAnisotropy;
    const microfiberBump = createMicrofiberBumpTexture();
    const stoneBump = createStoneBumpTexture();
    const contactShadowTex = createContactShadowTexture();

    // Shared PBR materials with calibrated roughness/metalness variation
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xe4e2dd,
      roughness: 0.74,
      metalness: 0.05,
      bumpMap: stoneBump,
      bumpScale: 0.01,
    });
    const brushedMetalMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      roughness: 0.2,
      metalness: 0.92,
    });
    const pepperoniPolymerMat = new THREE.MeshPhysicalMaterial({
      color: 0xe63946,
      roughness: 0.26,
      metalness: 0.04,
      clearcoat: 0.75,
      clearcoatRoughness: 0.14,
    });
    const icePolymerMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.52,
      metalness: 0.05,
    });
    const charcoalGripMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.78,
      metalness: 0.08,
    });
    const brassNozzleMat = new THREE.MeshStandardMaterial({
      color: 0xe4b86a,
      roughness: 0.18,
      metalness: 0.95,
    });
    const labelMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: labelTex,
      roughness: 0.42,
      metalness: 0.04,
    });
    const glassBottleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0.0,
      transmission: isSoftwareGl ? 0 : 0.86,
      transparent: true,
      opacity: isSoftwareGl ? 0.38 : 1.0,
      ior: 1.52,
      thickness: 0.45,
      clearcoat: 1.0,
      depthWrite: !isSoftwareGl,
    });
    const liquidCoreMat = new THREE.MeshStandardMaterial({
      color: 0xe63946,
      roughness: 0.18,
      metalness: 0.05,
      transparent: true,
      opacity: 0.85,
    });
    const microfiberClothMat = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.88,
      metalness: 0.0,
      bumpMap: microfiberBump,
      bumpScale: 0.018,
    });
    const microfiberRedMat = new THREE.MeshStandardMaterial({
      color: 0xe63946,
      roughness: 0.85,
      metalness: 0.0,
      bumpMap: microfiberBump,
      bumpScale: 0.018,
    });

    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const registerGeo = <T extends THREE.BufferGeometry>(geo: T): T => {
      geometriesToDispose.push(geo);
      return geo;
    };

    // Ground studio floor plane + soft radial contact shadow
    const floorGeo = registerGeo(new THREE.CircleGeometry(14, 48));
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.92,
      metalness: 0.0,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const contactGeo = registerGeo(new THREE.CircleGeometry(2.45, 40));
    const contactMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    });
    const contactShadow = new THREE.Mesh(contactGeo, contactMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.015;
    scene.add(contactShadow);

    // Root Showcase Group (pivoted at bottom-center y=0)
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // 1. Studio Plinth (3-part composite pedestal)
    const plinthGroup = new THREE.Group();
    const plinthBaseGeo = registerGeo(new THREE.CylinderGeometry(1.78, 1.88, 0.14, 48));
    const plinthBase = new THREE.Mesh(plinthBaseGeo, stoneMat);
    plinthBase.position.y = 0.07;
    plinthBase.receiveShadow = true;
    plinthBase.castShadow = true;
    plinthGroup.add(plinthBase);

    const plinthRingGeo = registerGeo(new THREE.TorusGeometry(1.77, 0.024, 16, 64));
    const plinthRing = new THREE.Mesh(plinthRingGeo, brushedMetalMat);
    plinthRing.rotation.x = Math.PI / 2;
    plinthRing.position.y = 0.142;
    plinthGroup.add(plinthRing);

    const accentInlayGeo = registerGeo(new THREE.RingGeometry(1.42, 1.47, 48));
    const accentInlayMat = new THREE.MeshStandardMaterial({
      color: 0xe63946,
      roughness: 0.35,
      metalness: 0.15,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const accentInlay = new THREE.Mesh(accentInlayGeo, accentInlayMat);
    accentInlay.rotation.x = -Math.PI / 2;
    accentInlay.position.y = 0.145;
    plinthGroup.add(accentInlay);
    stageGroup.add(plinthGroup);

    // 2. Hero Spray Bottle (7-part composite THREE.Group, bottom flush on plinth y=0.14)
    const sprayBottleGroup = new THREE.Group();
    sprayBottleGroup.position.set(-0.36, 0.14, 0.12);
    sprayBottleGroup.rotation.y = 0.35;

    const bottleProfile: THREE.Vector2[] = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.32, 0.0),
      new THREE.Vector2(0.37, 0.08),
      new THREE.Vector2(0.39, 0.45),
      new THREE.Vector2(0.36, 0.78),
      new THREE.Vector2(0.24, 0.96),
      new THREE.Vector2(0.14, 1.12),
      new THREE.Vector2(0.135, 1.24),
      new THREE.Vector2(0.0, 1.24),
    ];
    const bottleGeo = registerGeo(new THREE.LatheGeometry(bottleProfile, 36));
    const bottleMesh = new THREE.Mesh(bottleGeo, pepperoniPolymerMat);
    bottleMesh.castShadow = true;
    bottleMesh.receiveShadow = true;
    sprayBottleGroup.add(bottleMesh);

    // Brand label cylinder wrap
    const labelGeo = registerGeo(
      new THREE.CylinderGeometry(0.382, 0.394, 0.46, 36, 1, true, -Math.PI * 0.48, Math.PI * 0.96),
    );
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.y = 0.48;
    labelMesh.rotation.y = -0.15;
    sprayBottleGroup.add(labelMesh);

    // Base stainless foot rim
    const footRimGeo = registerGeo(new THREE.TorusGeometry(0.34, 0.02, 12, 36));
    const footRim = new THREE.Mesh(footRimGeo, brushedMetalMat);
    footRim.rotation.x = Math.PI / 2;
    footRim.position.y = 0.025;
    sprayBottleGroup.add(footRim);

    // Collar + Trigger head assembly (separates upward in Exploded View)
    const sprayHeadGroup = new THREE.Group();
    sprayHeadGroup.position.y = 1.24;

    const collarGeo = registerGeo(new THREE.CylinderGeometry(0.155, 0.155, 0.11, 28));
    const collarMesh = new THREE.Mesh(collarGeo, brushedMetalMat);
    collarMesh.position.y = 0.055;
    collarMesh.castShadow = true;
    sprayHeadGroup.add(collarMesh);

    // Extruded beveled trigger housing
    const headShape = new THREE.Shape();
    headShape.moveTo(-0.18, 0.0);
    headShape.lineTo(0.34, 0.05);
    headShape.lineTo(0.38, 0.22);
    headShape.lineTo(-0.14, 0.26);
    headShape.quadraticCurveTo(-0.24, 0.14, -0.18, 0.0);

    const headGeo = registerGeo(
      new THREE.ExtrudeGeometry(headShape, {
        depth: 0.16,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.02,
        bevelSegments: 3,
      }),
    );
    headGeo.translate(0, 0, -0.08);
    const headMesh = new THREE.Mesh(headGeo, icePolymerMat);
    headMesh.position.set(0, 0.11, 0);
    headMesh.rotation.y = -Math.PI / 2;
    headMesh.castShadow = true;
    sprayHeadGroup.add(headMesh);

    // Trigger lever
    const triggerShape = new THREE.Shape();
    triggerShape.moveTo(0, 0);
    triggerShape.lineTo(0.06, 0);
    triggerShape.quadraticCurveTo(0.14, -0.16, 0.08, -0.34);
    triggerShape.lineTo(0.02, -0.33);
    triggerShape.quadraticCurveTo(0.06, -0.16, 0, 0);

    const triggerGeo = registerGeo(
      new THREE.ExtrudeGeometry(triggerShape, {
        depth: 0.07,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelSegments: 2,
      }),
    );
    triggerGeo.translate(0, 0, -0.035);
    const triggerMesh = new THREE.Mesh(triggerGeo, charcoalGripMat);
    triggerMesh.position.set(0, 0.13, 0.19);
    triggerMesh.rotation.y = -Math.PI / 2;
    triggerMesh.castShadow = true;
    sprayHeadGroup.add(triggerMesh);

    // Precision atomizing brass nozzle
    const nozzleGeo = registerGeo(new THREE.CylinderGeometry(0.048, 0.062, 0.09, 20));
    const nozzleMesh = new THREE.Mesh(nozzleGeo, brassNozzleMat);
    nozzleMesh.rotation.x = Math.PI / 2;
    nozzleMesh.position.set(0, 0.25, 0.39);
    sprayHeadGroup.add(nozzleMesh);

    sprayBottleGroup.add(sprayHeadGroup);
    stageGroup.add(sprayBottleGroup);

    // 3. Glass Shine Dispenser Bottle (4-part composite THREE.Group)
    const glassBottleGroup = new THREE.Group();
    glassBottleGroup.position.set(0.68, 0.14, -0.22);

    const glassProfile: THREE.Vector2[] = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.24, 0),
      new THREE.Vector2(0.26, 0.06),
      new THREE.Vector2(0.26, 0.62),
      new THREE.Vector2(0.11, 0.78),
      new THREE.Vector2(0.11, 0.88),
      new THREE.Vector2(0, 0.88),
    ];
    const glassGeo = registerGeo(new THREE.LatheGeometry(glassProfile, 28));
    const glassMesh = new THREE.Mesh(glassGeo, glassBottleMat);
    glassMesh.renderOrder = 2;
    glassMesh.castShadow = true;
    glassBottleGroup.add(glassMesh);

    const liquidGeo = registerGeo(new THREE.CylinderGeometry(0.205, 0.205, 0.48, 24));
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidCoreMat);
    liquidMesh.position.y = 0.29;
    liquidMesh.renderOrder = 1;
    glassBottleGroup.add(liquidMesh);

    const pumpGroup = new THREE.Group();
    pumpGroup.position.y = 0.88;
    const pumpCollarGeo = registerGeo(new THREE.CylinderGeometry(0.125, 0.125, 0.09, 24));
    const pumpCollar = new THREE.Mesh(pumpCollarGeo, brushedMetalMat);
    pumpCollar.position.y = 0.045;
    pumpGroup.add(pumpCollar);

    const pumpSpoutGeo = registerGeo(new THREE.BoxGeometry(0.06, 0.045, 0.22));
    const pumpSpout = new THREE.Mesh(pumpSpoutGeo, charcoalGripMat);
    pumpSpout.position.set(0, 0.13, 0.08);
    pumpGroup.add(pumpSpout);
    glassBottleGroup.add(pumpGroup);
    stageGroup.add(glassBottleGroup);

    // 4. Folded Microfiber Cloth Stack & Detail Brush (4-part composite THREE.Group)
    const clothGroup = new THREE.Group();
    clothGroup.position.set(0.32, 0.14, 0.64);
    clothGroup.rotation.y = -0.4;

    const clothShape = new THREE.Shape();
    const cw = 0.42;
    const cd = 0.34;
    const cr = 0.05;
    clothShape.moveTo(-cw + cr, -cd);
    clothShape.lineTo(cw - cr, -cd);
    clothShape.quadraticCurveTo(cw, -cd, cw, -cd + cr);
    clothShape.lineTo(cw, cd - cr);
    clothShape.quadraticCurveTo(cw, cd, cw - cr, cd);
    clothShape.lineTo(-cw + cr, cd);
    clothShape.quadraticCurveTo(-cw, cd, -cw, cd - cr);
    clothShape.lineTo(-cw, -cd + cr);
    clothShape.quadraticCurveTo(-cw, -cd, -cw + cr, -cd);

    const clothGeo = registerGeo(
      new THREE.ExtrudeGeometry(clothShape, {
        depth: 0.075,
        bevelEnabled: true,
        bevelThickness: 0.018,
        bevelSize: 0.015,
        bevelSegments: 2,
      }),
    );
    clothGeo.rotateX(Math.PI / 2);

    const lowerCloth = new THREE.Mesh(clothGeo, microfiberClothMat);
    lowerCloth.position.y = 0.093;
    lowerCloth.castShadow = true;
    lowerCloth.receiveShadow = true;
    clothGroup.add(lowerCloth);

    const upperCloth = new THREE.Mesh(clothGeo, microfiberRedMat);
    upperCloth.position.set(0.03, 0.19, -0.02);
    upperCloth.rotation.y = 0.14;
    upperCloth.scale.set(0.92, 0.9, 0.92);
    upperCloth.castShadow = true;
    clothGroup.add(upperCloth);

    // Detail brush resting neatly on top
    const brushGroup = new THREE.Group();
    brushGroup.position.set(-0.04, 0.215, 0.02);
    brushGroup.rotation.y = 0.48;
    const handleGeo = registerGeo(new THREE.CapsuleGeometry(0.036, 0.42, 6, 14));
    const handleMesh = new THREE.Mesh(handleGeo, charcoalGripMat);
    handleMesh.rotation.z = Math.PI / 2;
    handleMesh.castShadow = true;
    brushGroup.add(handleMesh);

    const bristleGeo = registerGeo(new THREE.BoxGeometry(0.18, 0.055, 0.075));
    const bristleMesh = new THREE.Mesh(bristleGeo, icePolymerMat);
    bristleMesh.position.set(0.16, -0.03, 0);
    brushGroup.add(bristleMesh);

    clothGroup.add(brushGroup);
    stageGroup.add(clothGroup);

    // 5. InstancedMesh Clean Shine Bubbles (> 20 items shared into 1 draw call)
    const bubbleCount = 26;
    const bubbleGeo = registerGeo(new THREE.SphereGeometry(1, 16, 12));
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.05,
      clearcoat: 1.0,
      iridescence: isSoftwareGl ? 0 : 0.9,
      transparent: true,
      opacity: 0.52,
    });
    const bubbleMesh = new THREE.InstancedMesh(bubbleGeo, bubbleMat, bubbleCount);
    bubbleMesh.frustumCulled = false;

    const bubbleData = Array.from({ length: bubbleCount }, (_, i) => {
      const angle = (i / bubbleCount) * Math.PI * 2;
      const radius = 0.85 + ((i * 37) % 100) * 0.009;
      return {
        angle,
        radius,
        baseY: 0.35 + ((i * 53) % 100) * 0.019,
        scale: 0.028 + ((i * 19) % 10) * 0.005,
        speed: 0.22 + (i % 5) * 0.07,
      };
    });

    const updateBubbles = (elapsed: number, explodeProgress: number) => {
      for (let i = 0; i < bubbleCount; i++) {
        const b = bubbleData[i];
        const a = b.angle + elapsed * b.speed * 0.35;
        const yOffset = Math.sin(elapsed * b.speed + i) * 0.14 + explodeProgress * 0.35;
        _dummy.position.set(
          Math.cos(a) * b.radius,
          b.baseY + yOffset,
          Math.sin(a) * b.radius,
        );
        _dummy.scale.setScalar(b.scale * (1 + explodeProgress * 0.2));
        _dummy.updateMatrix();
        bubbleMesh.setMatrixAt(i, _dummy.matrix);
        _colorScratch.setHex(i % 4 === 0 ? 0xfdecee : 0xffffff);
        bubbleMesh.setColorAt(i, _colorScratch);
      }
      bubbleMesh.instanceMatrix.needsUpdate = true;
      if (bubbleMesh.instanceColor) bubbleMesh.instanceColor.needsUpdate = true;
    };
    updateBubbles(0, 0);
    bubbleMesh.computeBoundingSphere();
    stageGroup.add(bubbleMesh);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // OrbitControls with exponential damping on GPU (disabled damping on software GL)
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(...CAMERA_PRESETS.overview.lookAt);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 2.0;
    controls.maxDistance = 6.8;
    controls.minPolarAngle = 0.28;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.update();

    let camTransitionActive = false;
    let explodeFactor = 0;
    let simTime = 0;
    let lastTickMs = performance.now();
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;

    const onControlStart = () => {
      camTransitionActive = false;
    };
    const onControlChange = () => {
      requestRender();
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('change', onControlChange);

    triggerCameraTransitionRef.current = (targetPreset: CameraPreset) => {
      const cfg = CAMERA_PRESETS[targetPreset];
      _camGoal.set(...cfg.position);
      _lookGoal.set(...cfg.lookAt);
      camTransitionActive = true;
      requestRender();
    };

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function applySceneKinematics(dt: number) {
      const targetExplode = explodedRef.current ? 1 : 0;
      const dampAlpha = 1 - Math.exp(-7.5 * dt);
      explodeFactor += (targetExplode - explodeFactor) * dampAlpha;

      // Exploded separation of composite parts
      sprayHeadGroup.position.y = 1.24 + explodeFactor * 0.42;
      pumpGroup.position.y = 0.88 + explodeFactor * 0.34;
      upperCloth.position.y = 0.19 + explodeFactor * 0.18;
      brushGroup.position.y = 0.215 + explodeFactor * 0.36;

      if (autoRotateRef.current) {
        stageGroup.rotation.y += dt * 0.45;
        simTime += dt;
        updateBubbles(simTime, explodeFactor);
      } else {
        updateBubbles(simTime, explodeFactor);
      }

      if (camTransitionActive) {
        const camAlpha = isSoftwareGl ? 1 : 1 - Math.exp(-6.5 * dt);
        camera.position.lerp(_camGoal, camAlpha);
        controls.target.lerp(_lookGoal, camAlpha);
        if (
          camera.position.distanceTo(_camGoal) < 0.015 &&
          controls.target.distanceTo(_lookGoal) < 0.015
        ) {
          camera.position.copy(_camGoal);
          controls.target.copy(_lookGoal);
          camTransitionActive = false;
        }
      }

      controls.update();

      const needsMoreFrames =
        autoRotateRef.current ||
        camTransitionActive ||
        Math.abs(targetExplode - explodeFactor) > 0.004;

      return needsMoreFrames;
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        if (disposed) return;
        renderDirty = false;
        const dt = Math.min((now - lastTickMs) / 1000, 0.05);
        lastTickMs = now;

        const keepGoing = applySceneKinematics(dt || 0.016);
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (!disposed && (renderDirty || keepGoing)) {
            requestRender();
          }
        };

        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    }

    requestRenderRef.current = requestRender;
    requestRender();

    let lastWidth = width;
    let lastHeight = height;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(Math.round(entry.contentRect.width), 200);
        const h = Math.max(Math.round(entry.contentRect.height), 200);
        if (w === lastWidth && h === lastHeight) continue;
        lastWidth = w;
        lastHeight = h;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        requestRender();
      }
    });
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      controls.dispose();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      geometriesToDispose.forEach((g) => g.dispose());
      [
        floorMat,
        contactMat,
        stoneMat,
        brushedMetalMat,
        pepperoniPolymerMat,
        icePolymerMat,
        charcoalGripMat,
        brassNozzleMat,
        labelMat,
        glassBottleMat,
        liquidCoreMat,
        microfiberClothMat,
        microfiberRedMat,
        accentInlayMat,
        bubbleMat,
      ].forEach((m) => m.dispose());
      labelTex.dispose();
      microfiberBump.dispose();
      stoneBump.dispose();
      contactShadowTex.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      className="relative w-full h-full min-h-[380px] sm:min-h-[440px] lg:min-h-[540px] rounded-2xl overflow-hidden border border-zinc-200 bg-[#F5F5F5]"
      data-testid="three-cleaning-stage"
      data-exploded={String(exploded)}
      data-preset={preset}
    >
      {/* Dedicated WebGL Mount Container outside sibling React UI overlays */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

      {/* WebGL Context Lost Fallback */}
      {contextLost && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F5F5F5] p-6 text-center z-20">
          <Sparkles className="w-8 h-8 text-[#E63946] mb-3" />
          <p className="font-display font-semibold text-zinc-900">
            Visualização 3D pausada temporariamente
          </p>
          <p className="text-sm text-zinc-600 mt-1">
            Arraste ou recarregue a página para restaurar o palco interativo.
          </p>
        </div>
      )}

      {/* Subtle Top-Left Instruction Tag (No pulsing dots, solid/rgba fill without backdrop-filter) */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-white/90 border border-zinc-200/80 text-xs font-medium text-zinc-700">
        Arraste para girar o kit 3D · Zoom com scroll
      </div>

      {/* Collapsible Unified Bottom Control Dock (<=15% footprint, zero backdrop-filter over WebGL) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-24px)] max-w-[560px] flex flex-col items-center gap-1.5 pointer-events-none">
        <button
          type="button"
          onClick={() => setControlsCollapsed((prev) => !prev)}
          aria-expanded={!controlsCollapsed}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/95 border border-zinc-200 text-xs font-medium text-zinc-700 hover:text-[#E63946] shadow-sm transition-colors whitespace-nowrap"
        >
          {controlsCollapsed ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Mostrar Controles 3D</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Ocultar Controles</span>
            </>
          )}
        </button>

        {!controlsCollapsed && (
          <div className="pointer-events-auto w-full flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/95 border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-1" role="group" aria-label="Ângulos da câmera 3D">
              {(
                [
                  { id: 'overview', label: 'Geral' },
                  { id: 'spray', label: 'Spray' },
                  { id: 'kit', label: 'Microfibra' },
                ] as { id: CameraPreset; label: string }[]
              ).map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => setPreset(cam.id)}
                  aria-pressed={preset === cam.id}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    preset === cam.id
                      ? 'bg-[#E63946] text-white'
                      : 'bg-[#F5F5F5] text-zinc-700 hover:text-zinc-900'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setExploded((prev) => !prev)}
                aria-pressed={exploded}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  exploded
                    ? 'bg-zinc-900 text-white'
                    : 'bg-[#F5F5F5] text-zinc-700 hover:text-zinc-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Explodir</span>
              </button>

              <button
                type="button"
                onClick={() => setAutoRotate((prev) => !prev)}
                aria-pressed={autoRotate}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  autoRotate
                    ? 'bg-zinc-900 text-white'
                    : 'bg-[#F5F5F5] text-zinc-700 hover:text-zinc-900'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Girar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
