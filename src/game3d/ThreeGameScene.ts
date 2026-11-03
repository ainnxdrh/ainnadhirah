import * as THREE from 'three';
import { BirdType } from '../types';
import { BIRD_CONFIGS } from '../data/birds';
import { sound } from '../audio/soundEngine';

export interface TowerBlock {
  id: number;
  mesh: THREE.Mesh;
  type: 'glass' | 'wood' | 'concrete' | 'tnt';
  width: number;
  height: number;
  depth: number;
  mass: number;
  velocity: THREE.Vector3;
  rotVelocity: THREE.Vector3;
  initialPos: THREE.Vector3;
  hp: number;
  maxHp: number;
  isPillar: boolean;
  isBeam: boolean;
  isStatic?: boolean;
  isAwake: boolean;
  supportLeftId?: number;
  supportRightId?: number;
  destroyed: boolean;
}

export interface TargetChick {
  id: number;
  group: THREE.Group;
  initialPos: THREE.Vector3;
  velocity: THREE.Vector3;
  isHit: boolean;
  isMoving: boolean;
  moveRange: number;
  moveSpeed: number;
  moveTimer: number;
}

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
}

export class ThreeGameScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animFrameId: number = 0;

  // Slingshot & Bird Positions
  public readonly originPos = new THREE.Vector3(-9, 2.8, 0);
  public readonly forkLeftPos = new THREE.Vector3(-9.2, 3.5, 0.45);
  public readonly forkRightPos = new THREE.Vector3(-9.2, 3.5, -0.45);

  private slingshotGroup: THREE.Group;
  private rubberLeft: THREE.Line;
  private rubberRight: THREE.Line;
  private pouchMesh: THREE.Mesh;

  // Bird actors
  private currentBirdType: BirdType = 1;
  private heroBirds: THREE.Group[] = [];
  private heroVelocities: THREE.Vector3[] = [];
  private heroInFlight: boolean = false;
  private powerActivated: boolean = false;

  // Trajectory guides
  private trajectoryDots: THREE.Mesh[] = [];
  private aimArrow: THREE.Group;

  // Obstacles & Targets
  private blocks: TowerBlock[] = [];
  private targets: TargetChick[] = [];
  private particles: Particle[] = [];

  // Wind
  public wind: number = 0;


  // State flags
  private isDragging: boolean = false;
  private dragScreenPos = { x: 0, y: 0 };
  private canLaunch: boolean = false;
  private roundSuccessTriggered: boolean = false;
  private flightTimer: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x70c5ff);
    this.scene.fog = new THREE.Fog(0x70c5ff, 22, 70);

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.updateCameraForDevice();

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // 4. Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x4caf50, 0.85);
    hemiLight.position.set(0, 30, 0);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.15);
    sunLight.position.set(16, 26, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 70;
    sunLight.shadow.camera.left = -18;
    sunLight.shadow.camera.right = 24;
    sunLight.shadow.camera.top = 24;
    sunLight.shadow.camera.bottom = -8;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xffcc80, 0.4);
    rimLight.position.set(-15, 10, -10);
    this.scene.add(rimLight);

    // 5. Environment
    this.buildEnvironment();

    // 6. Slingshot
    const { group, rubberL, rubberR, pouch } = this.createSlingshot();
    this.slingshotGroup = group;
    this.rubberLeft = rubberL;
    this.rubberRight = rubberR;
    this.pouchMesh = pouch;
    this.scene.add(this.slingshotGroup);

    // 7. Aim Trajectory
    const { dots, arrow } = this.createAimGuides();
    this.trajectoryDots = dots;
    this.aimArrow = arrow;
    this.scene.add(this.aimArrow);
    this.trajectoryDots.forEach((d) => this.scene.add(d));

    // 8. Bind Events
    this.setupEvents();

    // 9. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  // Callbacks
  private onChickHitCallback?: (chickIndex: number, remaining: number) => void;
  private onRoundSuccessCallback?: () => void;
  private onShotMissedCallback?: () => void;
  private onLaunchCallback?: () => void;
  private onFlightEndCallback?: () => void;
  private onPowerActivatedCallback?: () => void;

  public setCallbacks(
    onChickHit: (chickIndex: number, remaining: number) => void,
    onSuccess: () => void,
    onMiss: () => void,
    onLaunch?: () => void,
    onFlightEnd?: () => void,
    onPowerActivated?: () => void
  ) {
    this.onChickHitCallback = onChickHit;
    this.onRoundSuccessCallback = onSuccess;
    this.onShotMissedCallback = onMiss;
    this.onLaunchCallback = onLaunch;
    this.onFlightEndCallback = onFlightEnd;
    this.onPowerActivatedCallback = onPowerActivated;
  }

  public updateCameraForDevice() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    if (w < 640) {
      this.camera.position.set(0.5, 7.5, 30);
      this.camera.lookAt(1.8, 3.8, 0);
    } else if (w < 1024) {
      this.camera.position.set(0, 7.0, 26);
      this.camera.lookAt(1.8, 3.6, 0);
    } else {
      this.camera.position.set(-0.5, 6.8, 24);
      this.camera.lookAt(1.8, 3.5, 0);
    }
    this.camera.updateProjectionMatrix();
  }

  public resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.updateCameraForDevice();
    this.renderer.setSize(w, h);
  }

  // -------------------------------------------------------------
  // HERO BIRD MESH GENERATOR
  // -------------------------------------------------------------
  private createHeroBirdMesh(type: BirdType): THREE.Group {
    const group = new THREE.Group();
    const cfg = BIRD_CONFIGS[type];

    // Body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.color),
      roughness: 0.35,
      metalness: 0.08
    });
    const body = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius, 28, 28), bodyMat);
    body.castShadow = true;
    group.add(body);

    // Belly
    const bellyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.secondaryColor),
      roughness: 0.45
    });
    const belly = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius * 0.72, 20, 20), bellyMat);
    belly.scale.set(1.1, 0.9, 0.45);
    belly.position.set(cfg.radius * 0.42, -cfg.radius * 0.28, 0);
    belly.rotation.y = Math.PI / 2;
    group.add(belly);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const eyeSpacing = cfg.radius * 0.32;
    const eyeRadius = cfg.radius * 0.26;

    [-eyeSpacing, eyeSpacing].forEach((zOff) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius, 16, 16), eyeMat);
      eye.position.set(cfg.radius * 0.72, cfg.radius * 0.18, zOff);
      group.add(eye);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius * 0.48, 12, 12), pupilMat);
      pupil.position.set(cfg.radius * 0.88, cfg.radius * 0.18, zOff * 0.8);
      group.add(pupil);

      const glint = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius * 0.16, 8, 8), eyeMat);
      glint.position.set(cfg.radius * 0.93, cfg.radius * 0.24, zOff * 0.8 + 0.03);
      group.add(glint);
    });

    // Beak
    const beakColor = type === 5 ? 0xffb300 : 0xff9100;
    const beakMat = new THREE.MeshStandardMaterial({ color: beakColor, roughness: 0.25 });
    const topBeak = new THREE.Mesh(
      new THREE.ConeGeometry(cfg.radius * 0.3, type === 5 ? cfg.radius * 1.1 : cfg.radius * 0.7, 6),
      beakMat
    );
    topBeak.rotation.z = -Math.PI / 2;
    topBeak.position.set(cfg.radius * (type === 5 ? 1.4 : 1.1), cfg.radius * 0.04, 0);
    group.add(topBeak);

    const bottomBeak = new THREE.Mesh(
      new THREE.ConeGeometry(cfg.radius * 0.2, cfg.radius * 0.45, 6),
      beakMat
    );
    bottomBeak.rotation.z = -Math.PI / 2;
    bottomBeak.position.set(cfg.radius * 1.0, -cfg.radius * 0.12, 0);
    group.add(bottomBeak);

    // Eyebrows
    const browMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const browL = new THREE.Mesh(new THREE.BoxGeometry(0.08, cfg.radius * 0.2, cfg.radius * 0.45), browMat);
    browL.position.set(cfg.radius * 0.82, cfg.radius * 0.42, eyeSpacing);
    browL.rotation.x = 0.35;
    browL.rotation.y = -0.15;
    group.add(browL);

    const browR = new THREE.Mesh(new THREE.BoxGeometry(0.08, cfg.radius * 0.2, cfg.radius * 0.45), browMat);
    browR.position.set(cfg.radius * 0.82, cfg.radius * 0.42, -eyeSpacing);
    browR.rotation.x = -0.35;
    browR.rotation.y = 0.15;
    group.add(browR);

    // Head Crest
    if (type === 1) {
      const crestMat = new THREE.MeshStandardMaterial({ color: 0xff6d00, roughness: 0.4 });
      const crest = new THREE.Mesh(new THREE.ConeGeometry(0.12, cfg.radius * 0.9, 5), crestMat);
      crest.position.set(-cfg.radius * 0.4, cfg.radius * 1.1, 0);
      crest.rotation.z = 0.65;
      group.add(crest);
    } else if (type === 2) {
      const crest1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.5, 8), bodyMat);
      crest1.position.set(-0.25, cfg.radius * 1.1, 0.08);
      crest1.rotation.z = 0.45;
      group.add(crest1);
    } else if (type === 4) {
      const fuseStem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
      );
      fuseStem.position.set(0, cfg.radius * 1.1, 0);
      group.add(fuseStem);

      const spark = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffab00 })
      );
      spark.position.set(0, cfg.radius * 1.3, 0);
      group.add(spark);
    } else {
      const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.1, 0.4, 6), bodyMat);
      crest.position.set(-0.2, cfg.radius * 1.1, 0);
      crest.rotation.z = 0.5;
      group.add(crest);
    }

    // Tail Feathers
    const tailMat = new THREE.MeshStandardMaterial({ color: 0x212121 });
    for (let i = -1; i <= 1; i++) {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.1), tailMat);
      tail.position.set(-cfg.radius * 1.1, -0.05 + i * 0.08, 0);
      tail.rotation.z = -0.3 + i * 0.25;
      group.add(tail);
    }

    return group;
  }

  // -------------------------------------------------------------
  // PROCEDURAL CUTE TARGET CHICK (Burung Kecil Sasaran)
  // -------------------------------------------------------------
  private createTargetChick(colorHex: number = 0xffd54f): THREE.Group {
    const chick = new THREE.Group();

    // Body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.45
    });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), bodyMat);
    body.castShadow = true;
    chick.add(body);

    // Cream Belly
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xfff9c4, roughness: 0.5 });
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.4, 18, 18), bellyMat);
    belly.scale.set(1.1, 0.9, 0.5);
    belly.position.set(0.24, -0.14, 0);
    belly.rotation.y = Math.PI / 2;
    chick.add(belly);

    // Big innocent eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    [-0.16, 0.16].forEach((z) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), eyeMat);
      eye.position.set(0.4, 0.15, z);
      chick.add(eye);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), pupilMat);
      pupil.position.set(0.51, 0.15, z * 0.85);
      chick.add(pupil);

      const glint1 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), glintMat);
      glint1.position.set(0.56, 0.21, z * 0.85 + 0.03);
      chick.add(glint1);

      // Blush
      const blushMat = new THREE.MeshBasicMaterial({ color: 0xff80ab });
      const blush = new THREE.Mesh(new THREE.CircleGeometry(0.08, 12), blushMat);
      blush.position.set(0.44, -0.04, z * 1.3);
      blush.rotation.y = z > 0 ? 0.35 : -0.35;
      chick.add(blush);
    });

    // Beak
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xff9800, roughness: 0.3 });
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 4), beakMat);
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.62, 0.03, 0);
    chick.add(beak);

    // Wings
    [-0.52, 0.52].forEach((z) => {
      const wing = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 12), bodyMat);
      wing.scale.set(1.2, 0.6, 0.3);
      wing.position.set(0, -0.05, z);
      wing.rotation.x = z > 0 ? 0.2 : -0.2;
      chick.add(wing);
    });

    // Hair Tuft
    const tuftMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
    [-0.08, 0, 0.08].forEach((z, i) => {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), tuftMat);
      tuft.position.set(-0.05, 0.62, z);
      tuft.rotation.z = 0.2 + (i - 1) * 0.15;
      chick.add(tuft);
    });

    // Feet
    const footMat = new THREE.MeshStandardMaterial({ color: 0xff9800 });
    [-0.15, 0.15].forEach((z) => {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.14), footMat);
      foot.position.set(0.08, -0.54, z);
      chick.add(foot);
    });

    return chick;
  }

  // -------------------------------------------------------------
  // SLINGSHOT & DYNAMIC RUBBER BANDS
  // -------------------------------------------------------------
  private createSlingshot() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.85 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 3.4, 14), woodMat);
    base.position.set(-9.2, 1.2, 0);
    base.castShadow = true;
    group.add(base);

    const forkL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 1.8, 12), woodMat);
    forkL.position.set(-9.2, 2.8, 0.52);
    forkL.rotation.x = 0.45;
    forkL.castShadow = true;
    group.add(forkL);

    const forkR = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 1.8, 12), woodMat);
    forkR.position.set(-9.2, 2.8, -0.52);
    forkR.rotation.x = -0.45;
    forkR.castShadow = true;
    group.add(forkR);

    const pouchMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.6), pouchMat);
    pouch.position.copy(this.originPos);
    group.add(pouch);

    const rubberMat = new THREE.LineBasicMaterial({ color: 0x2b1d0c, linewidth: 5 });
    const geomL = new THREE.BufferGeometry().setFromPoints([this.forkLeftPos, this.originPos]);
    const rubberL = new THREE.Line(geomL, rubberMat);
    group.add(rubberL);

    const geomR = new THREE.BufferGeometry().setFromPoints([this.forkRightPos, this.originPos]);
    const rubberR = new THREE.Line(geomR, rubberMat);
    group.add(rubberR);

    return { group, rubberL, rubberR, pouch };
  }

  // -------------------------------------------------------------
  // ENVIRONMENT & BACKGROUND
  // -------------------------------------------------------------
  private buildEnvironment() {
    const cliffGeo = new THREE.BoxGeometry(80, 5, 34);
    const cliffMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.95 });
    const cliff = new THREE.Mesh(cliffGeo, cliffMat);
    cliff.position.set(0, -2.55, 0);
    cliff.receiveShadow = true;
    this.scene.add(cliff);

    const grassGeo = new THREE.PlaneGeometry(80, 34);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.7 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.04;
    grass.receiveShadow = true;
    this.scene.add(grass);

    const hillMat1 = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.85 });
    const hillMat2 = new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.9 });

    const hillPositions = [
      { x: -22, y: -6, z: -18, r: 18, mat: hillMat1 },
      { x: -2, y: -7, z: -22, r: 22, mat: hillMat2 },
      { x: 18, y: -6, z: -17, r: 19, mat: hillMat1 },
      { x: 35, y: -8, z: -25, r: 25, mat: hillMat2 }
    ];

    hillPositions.forEach((h) => {
      const hill = new THREE.Mesh(new THREE.SphereGeometry(h.r, 24, 16), h.mat);
      hill.position.set(h.x, h.y, h.z);
      this.scene.add(hill);
    });

    const makeTree = (x: number, z: number, s: number) => {
      const tree = new THREE.Group();
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4e342e });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.2, 10), trunkMat);
      trunk.position.y = 1.1;
      tree.add(trunk);

      const leafMat = new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.6 });
      const fol1 = new THREE.Mesh(new THREE.SphereGeometry(1.4, 14, 14), leafMat);
      fol1.position.y = 2.4;
      tree.add(fol1);

      const fol2 = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 12), leafMat);
      fol2.position.set(0.3, 3.2, 0.2);
      tree.add(fol2);

      tree.position.set(x, 0, z);
      tree.scale.set(s, s, s);
      this.scene.add(tree);
    };

    makeTree(-16, -4, 1.2);
    makeTree(-13, -7, 0.9);
    makeTree(18, -4, 1.1);
    makeTree(22, -6, 1.3);

    for (let i = 0; i < 7; i++) {
      const cloud = new THREE.Group();
      const cMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
      for (let j = 0; j < 5; j++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1.2 + Math.random() * 0.8, 12, 12), cMat);
        puff.position.set(j * 1.3, Math.sin(j) * 0.4, (Math.random() - 0.5) * 0.8);
        cloud.add(puff);
      }
      cloud.position.set(-35 + i * 14 + Math.random() * 3, 15 + Math.random() * 4, -12 + Math.random() * 6);
      this.scene.add(cloud);
    }
  }

  // -------------------------------------------------------------
  // AIM GUIDES
  // -------------------------------------------------------------
  private createAimGuides() {
    const dots: THREE.Mesh[] = [];
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });

    for (let i = 0; i < 24; i++) {
      const sz = Math.max(0.04, 0.12 - i * 0.003);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(sz, 8, 8), dotMat);
      dot.visible = false;
      dots.push(dot);
    }

    const arrow = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 10), new THREE.MeshBasicMaterial({ color: 0xff3d00 }));
    shaft.position.y = 1.1;
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 12), new THREE.MeshBasicMaterial({ color: 0xffea00 }));
    head.position.y = 2.3;
    arrow.add(shaft);
    arrow.add(head);
    arrow.rotation.z = -Math.PI / 2;
    arrow.visible = false;

    return { dots, arrow };
  }

  // -------------------------------------------------------------
  // MATERIALS
  // -------------------------------------------------------------
  private getBlockMaterial(type: 'glass' | 'wood' | 'concrete' | 'tnt'): THREE.Material {
    if (type === 'glass') {
      return new THREE.MeshPhysicalMaterial({
        color: 0x80deea,
        transparent: true,
        opacity: 0.65,
        roughness: 0.04,
        metalness: 0.1,
        transmission: 0.8,
        clearcoat: 1.0
      });
    } else if (type === 'wood') {
      return new THREE.MeshStandardMaterial({
        color: 0x8d6e63,
        roughness: 0.72,
        metalness: 0.05
      });
    } else if (type === 'concrete') {
      return new THREE.MeshStandardMaterial({
        color: 0x546e7a,
        roughness: 0.95,
        metalness: 0.15
      });
    } else {
      return new THREE.MeshStandardMaterial({
        color: 0xd32f2f,
        roughness: 0.5,
        metalness: 0.2
      });
    }
  }

  // -------------------------------------------------------------
  // ROCK-SOLID TOWER ARCHITECTURE & CUTE CHICKS
  // Level 1 - 5: Glass Fortress (Kaca)
  // Level 6 - 10: Wood Fortress (Kayu)
  // Level 11 - 15: Concrete Citadel (Konkrit)
  // -------------------------------------------------------------
  public setupLevel(level: number, roundIndex: number, birdType: BirdType) {
    this.currentBirdType = birdType;
    this.roundSuccessTriggered = false;
    this.flightTimer = 0;

    // Clear previous objects
    this.clearFortress();

    // Spawn Hero Bird in Slingshot
    const hero = this.createHeroBirdMesh(birdType);
    hero.position.copy(this.originPos);
    this.scene.add(hero);
    this.heroBirds = [hero];
    this.heroVelocities = [new THREE.Vector3(0, 0, 0)];
    this.heroInFlight = false;
    this.powerActivated = false;

    // Wind for Level 10+
    if (level >= 10) {
      const sign = (level + roundIndex) % 2 === 0 ? 1 : -1;
      this.wind = sign * (0.005 + (level - 10) * 0.002);
    } else {
      this.wind = 0;
    }

    // Material selection:
    let primaryMaterial: 'glass' | 'wood' | 'concrete' = 'glass';
    if (level >= 11) {
      primaryMaterial = 'concrete';
    } else if (level >= 6) {
      primaryMaterial = 'wood';
    } else {
      primaryMaterial = 'glass';
    }

    const baseX = 7.5;
    let blockIdCounter = 1;
    let chickIdCounter = 1;
    const baseMat = this.getBlockMaterial(primaryMaterial);

    // Number of tiers:
    // Level 1-4: 1 spacious room
    // Level 5-8: 2 tiered rooms
    // Level 9-12: 3 tiered rooms
    // Level 13-15: 3 tiers + front battlement
    const numTiers = level <= 4 ? 1 : level <= 8 ? 2 : 3;

    // 1. Solid Foundation Base (Grounded, perfectly static)
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 2.2), baseMat);
    foundation.position.set(baseX, 0.2, 0);
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    this.scene.add(foundation);
    this.blocks.push({
      id: blockIdCounter++,
      mesh: foundation,
      type: primaryMaterial,
      width: 4.8,
      height: 0.4,
      depth: 2.2,
      mass: 10.0,
      velocity: new THREE.Vector3(),
      rotVelocity: new THREE.Vector3(),
      initialPos: foundation.position.clone(),
      hp: 10,
      maxHp: 10,
      isPillar: false,
      isBeam: false,
      isStatic: true,
      isAwake: false,
      destroyed: false
    });

    let currentFloorY = 0.4;

    // 2. Build Tiers with reinforced pillars & exact chick count
    const totalChicksNeeded = level <= 5 ? 1 : 2;
    let chicksSpawned = 0;

    for (let t = 0; t < numTiers; t++) {
      const pillarHeight = 2.2;
      const pillarY = currentFloorY + pillarHeight / 2;
      const pillarSpacing = 1.6;

      const pWidth = primaryMaterial === 'glass' ? 0.65 : primaryMaterial === 'wood' ? 0.75 : 0.90;
      const pDepth = primaryMaterial === 'glass' ? 0.85 : primaryMaterial === 'wood' ? 1.0 : 1.25;
      const pMass = primaryMaterial === 'glass' ? 1.8 : primaryMaterial === 'wood' ? 3.8 : 8.0;
      const pHP = primaryMaterial === 'glass' ? 1 : primaryMaterial === 'wood' ? 2 : 4;

      // Left Pillar
      const postL = new THREE.Mesh(new THREE.BoxGeometry(pWidth, pillarHeight, pDepth), baseMat);
      postL.position.set(baseX - pillarSpacing, pillarY, 0);
      postL.castShadow = true;
      postL.receiveShadow = true;
      this.scene.add(postL);
      const leftPillarId = blockIdCounter++;
      this.blocks.push({
        id: leftPillarId,
        mesh: postL,
        type: primaryMaterial,
        width: pWidth,
        height: pillarHeight,
        depth: pDepth,
        mass: pMass,
        velocity: new THREE.Vector3(),
        rotVelocity: new THREE.Vector3(),
        initialPos: postL.position.clone(),
        hp: pHP,
        maxHp: pHP,
        isPillar: true,
        isBeam: false,
        isAwake: false,
        destroyed: false
      });

      // Right Pillar
      const postR = new THREE.Mesh(new THREE.BoxGeometry(pWidth, pillarHeight, pDepth), baseMat);
      postR.position.set(baseX + pillarSpacing, pillarY, 0);
      postR.castShadow = true;
      postR.receiveShadow = true;
      this.scene.add(postR);
      const rightPillarId = blockIdCounter++;
      this.blocks.push({
        id: rightPillarId,
        mesh: postR,
        type: primaryMaterial,
        width: pWidth,
        height: pillarHeight,
        depth: pDepth,
        mass: pMass,
        velocity: new THREE.Vector3(),
        rotVelocity: new THREE.Vector3(),
        initialPos: postR.position.clone(),
        hp: pHP,
        maxHp: pHP,
        isPillar: true,
        isBeam: false,
        isAwake: false,
        destroyed: false
      });

      // PLACE CUTE TARGET CHICK INSIDE THIS ROOM!
      if (chicksSpawned < totalChicksNeeded) {
        const chickColors = [0xffd54f, 0x81d4fa, 0xce93d8, 0xffb74d];
        const chickCol = chickColors[(t + roundIndex) % chickColors.length];
        const chickGroup = this.createTargetChick(chickCol);
        chickGroup.position.set(baseX, currentFloorY + 0.55, 0);
        this.scene.add(chickGroup);

        this.targets.push({
          id: chickIdCounter++,
          group: chickGroup,
          initialPos: chickGroup.position.clone(),
          velocity: new THREE.Vector3(),
          isHit: false,
          isMoving: level >= 10,
          moveRange: 0.6,
          moveSpeed: 1.2,
          moveTimer: Math.random() * 5
        });
        chicksSpawned++;
      }

      // Horizontal Beam resting on top of Left & Right Pillars
      const beamY = pillarY + pillarHeight / 2 + 0.22;
      const beamWidth = 4.4;
      const bMass = primaryMaterial === 'glass' ? 2.2 : primaryMaterial === 'wood' ? 4.5 : 9.5;
      const bHP = primaryMaterial === 'glass' ? 1 : primaryMaterial === 'wood' ? 3 : 5;

      const beamMesh = new THREE.Mesh(new THREE.BoxGeometry(beamWidth, 0.44, pDepth + 0.2), baseMat);
      beamMesh.position.set(baseX, beamY, 0);
      beamMesh.castShadow = true;
      beamMesh.receiveShadow = true;
      this.scene.add(beamMesh);
      this.blocks.push({
        id: blockIdCounter++,
        mesh: beamMesh,
        type: primaryMaterial,
        width: beamWidth,
        height: 0.44,
        depth: pDepth + 0.2,
        mass: bMass,
        velocity: new THREE.Vector3(),
        rotVelocity: new THREE.Vector3(),
        initialPos: beamMesh.position.clone(),
        hp: bHP,
        maxHp: bHP,
        isPillar: false,
        isBeam: true,
        supportLeftId: leftPillarId,
        supportRightId: rightPillarId,
        isAwake: false,
        destroyed: false
      });

      currentFloorY = beamY + 0.22;
    }

    // Place second target chick on upper floor if needed
    if (chicksSpawned < totalChicksNeeded) {
      const topChickGroup = this.createTargetChick(0xffb74d);
      topChickGroup.position.set(baseX, currentFloorY + 0.55, 0);
      this.scene.add(topChickGroup);
      this.targets.push({
        id: chickIdCounter++,
        group: topChickGroup,
        initialPos: topChickGroup.position.clone(),
        velocity: new THREE.Vector3(),
        isHit: false,
        isMoving: level >= 10,
        moveRange: 0.8,
        moveSpeed: 1.5,
        moveTimer: Math.random() * 5
      });
      chicksSpawned++;
    }

    // Concrete Level Front Defense Barrier (Shields lower pillars on Levels 11-15!)
    if (level >= 11) {
      const wallMat = this.getBlockMaterial('concrete');
      const shieldMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 1.2), wallMat);
      shieldMesh.position.set(baseX - 2.8, 0.7, 0);
      shieldMesh.castShadow = true;
      shieldMesh.receiveShadow = true;
      this.scene.add(shieldMesh);
      this.blocks.push({
        id: blockIdCounter++,
        mesh: shieldMesh,
        type: 'concrete',
        width: 0.8,
        height: 1.4,
        depth: 1.2,
        mass: 7.0,
        velocity: new THREE.Vector3(),
        rotVelocity: new THREE.Vector3(),
        initialPos: shieldMesh.position.clone(),
        hp: 3,
        maxHp: 3,
        isPillar: false,
        isBeam: false,
        isAwake: false,
        destroyed: false
      });
    }

    // Decorative roof blocks (sleeping at start)
    const roofL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.8), baseMat);
    roofL.position.set(baseX - 1.5, currentFloorY + 0.35, 0);
    roofL.castShadow = true;
    this.scene.add(roofL);
    this.blocks.push({
      id: blockIdCounter++,
      mesh: roofL,
      type: primaryMaterial,
      width: 0.8,
      height: 0.7,
      depth: 0.8,
      mass: primaryMaterial === 'glass' ? 0.8 : 1.8,
      velocity: new THREE.Vector3(),
      rotVelocity: new THREE.Vector3(),
      initialPos: roofL.position.clone(),
      hp: 1,
      maxHp: 1,
      isPillar: false,
      isBeam: false,
      isAwake: false,
      destroyed: false
    });

    const roofR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.8), baseMat);
    roofR.position.set(baseX + 1.5, currentFloorY + 0.35, 0);
    roofR.castShadow = true;
    this.scene.add(roofR);
    this.blocks.push({
      id: blockIdCounter++,
      mesh: roofR,
      type: primaryMaterial,
      width: 0.8,
      height: 0.7,
      depth: 0.8,
      mass: primaryMaterial === 'glass' ? 0.8 : 1.8,
      velocity: new THREE.Vector3(),
      rotVelocity: new THREE.Vector3(),
      initialPos: roofR.position.clone(),
      hp: 1,
      maxHp: 1,
      isPillar: false,
      isBeam: false,
      isAwake: false,
      destroyed: false
    });

    // Special TNT Box on selected levels (7, 9, 12, 14)
    if ([7, 9, 12, 14].includes(level)) {
      const tntMat = this.getBlockMaterial('tnt');
      const tntMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), tntMat);
      tntMesh.position.set(baseX, 0.82, 0);
      tntMesh.castShadow = true;
      this.scene.add(tntMesh);
      this.blocks.push({
        id: blockIdCounter++,
        mesh: tntMesh,
        type: 'tnt',
        width: 0.85,
        height: 0.85,
        depth: 0.85,
        mass: 1.2,
        velocity: new THREE.Vector3(),
        rotVelocity: new THREE.Vector3(),
        initialPos: tntMesh.position.clone(),
        hp: 1,
        maxHp: 1,
        isPillar: false,
        isBeam: false,
        isAwake: false,
        destroyed: false
      });
    }

    this.resetSling();
    this.canLaunch = true;
  }

  // Reload slingshot for another shot (keeping current damaged fortress intact)
  public reloadSlingshotForAnotherShot() {
    this.heroBirds.forEach((h) => this.scene.remove(h));
    this.heroBirds = [];
    this.heroVelocities = [];

    const hero = this.createHeroBirdMesh(this.currentBirdType);
    hero.position.copy(this.originPos);
    this.scene.add(hero);
    this.heroBirds = [hero];
    this.heroVelocities = [new THREE.Vector3(0, 0, 0)];
    this.heroInFlight = false;
    this.powerActivated = false;
    this.flightTimer = 0;
    this.onFlightEndCallback?.();

    this.resetSling();
    this.canLaunch = true;
  }

  private clearFortress() {
    this.blocks.forEach((b) => this.scene.remove(b.mesh));
    this.targets.forEach((t) => this.scene.remove(t.group));
    this.heroBirds.forEach((h) => this.scene.remove(h));
    this.particles.forEach((p) => this.scene.remove(p.mesh));
    this.blocks = [];
    this.targets = [];
    this.heroBirds = [];
    this.heroVelocities = [];
    this.particles = [];
  }

  public resetSling() {
    this.isDragging = false;
    this.rubberLeft.geometry.setFromPoints([this.forkLeftPos, this.originPos]);
    this.rubberRight.geometry.setFromPoints([this.forkRightPos, this.originPos]);
    this.pouchMesh.position.copy(this.originPos);
    this.trajectoryDots.forEach((d) => (d.visible = false));
    this.aimArrow.visible = false;
  }

  // -------------------------------------------------------------
  // SLINGSHOT TOUCH & MOUSE CONTROLS (PULL BACKWARDS TO SHOOT FORWARD)
  // -------------------------------------------------------------
  private setupEvents() {
    const el = this.renderer.domElement;

    const onStart = (clientX: number, clientY: number) => {
      // If bird is currently in flight, tapping/clicking anywhere activates its special power!
      if (this.heroInFlight && !this.powerActivated && this.currentBirdType !== 0) {
        this.activatePower();
        return;
      }
      if (!this.canLaunch || this.heroInFlight) return;
      this.isDragging = true;
      this.dragScreenPos = { x: clientX, y: clientY };
      sound.stretch();
    };

    const onMove = (clientX: number, clientY: number) => {
      if (!this.isDragging || !this.heroBirds[0]) return;

      const dx = (clientX - this.dragScreenPos.x) * 0.016;
      const dy = (clientY - this.dragScreenPos.y) * 0.016;

      const newX = THREE.MathUtils.clamp(this.originPos.x + dx, this.originPos.x - 3.8, this.originPos.x + 0.4);
      const newY = THREE.MathUtils.clamp(this.originPos.y - dy, this.originPos.y - 2.6, this.originPos.y + 1.4);

      this.heroBirds[0].position.set(newX, newY, 0);
      this.pouchMesh.position.set(newX, newY, 0);

      const pullPos = new THREE.Vector3(newX - 0.25, newY, 0);
      this.rubberLeft.geometry.setFromPoints([this.forkLeftPos, pullPos]);
      this.rubberRight.geometry.setFromPoints([this.forkRightPos, pullPos]);

      const forceX = (this.originPos.x - newX) * 11.5;
      const forceY = (this.originPos.y - newY) * 11.5;

      let simX = newX;
      let simY = newY;
      let simVx = forceX * 0.038;
      let simVy = forceY * 0.038;
      const simGravity = 0.007;

      this.trajectoryDots.forEach((dot) => {
        dot.visible = true;
        simVy -= simGravity;
        simVx += this.wind * 0.1;
        simX += simVx;
        simY += simVy;
        dot.position.set(simX, simY, 0);
      });

      this.aimArrow.visible = true;
      this.aimArrow.position.set(newX + 0.6, newY + 0.2, 0);
      const angle = Math.atan2(forceY, forceX);
      this.aimArrow.rotation.z = angle - Math.PI / 2;
    };

    const onEnd = () => {
      if (!this.isDragging || !this.heroBirds[0]) return;
      this.isDragging = false;

      const pullX = (this.originPos.x - this.heroBirds[0].position.x) * 11.5;
      const pullY = (this.originPos.y - this.heroBirds[0].position.y) * 11.5;

      this.trajectoryDots.forEach((d) => (d.visible = false));
      this.aimArrow.visible = false;
      this.resetSling();

      if (pullX < 1.2 && Math.abs(pullY) < 1.2) {
        this.heroBirds[0].position.copy(this.originPos);
        return;
      }

      this.heroInFlight = true;
      this.canLaunch = false;
      this.flightTimer = 0;
      this.heroVelocities[0] = new THREE.Vector3(Math.max(pullX, 3.2), pullY, 0);
      sound.launch();
      this.onLaunchCallback?.();
    };

    el.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', () => onEnd());

    el.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) onStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    window.addEventListener('touchend', () => onEnd());
  }

  // -------------------------------------------------------------
  // MID-AIR SPECIAL BIRD POWERS
  // -------------------------------------------------------------
  public activatePower(): boolean {
    if (!this.heroInFlight || this.powerActivated || this.heroBirds.length === 0) return false;
    const cfg = BIRD_CONFIGS[this.currentBirdType];
    if (!cfg || cfg.power === 'none') return false;

    this.powerActivated = true;
    sound.power(cfg.power);
    this.onPowerActivatedCallback?.();

    if (cfg.power === 'boost') {
      this.heroVelocities.forEach((v) => {
        v.x = Math.max(v.x * 2.2, 28);
        v.y = Math.min(v.y + 4, 12);
      });
      this.spawnPowerAura(this.heroBirds[0].position, 0xffeb3b);
    } else if (cfg.power === 'slam') {
      this.heroVelocities.forEach((v) => {
        v.x = Math.max(v.x * 0.4, 4);
        v.y = -26;
      });
      this.spawnPowerAura(this.heroBirds[0].position, 0xd32f2f);
    } else if (cfg.power === 'split') {
      const leadBird = this.heroBirds[0];
      const leadVel = this.heroVelocities[0];

      const birdUp = this.createHeroBirdMesh(3);
      birdUp.position.copy(leadBird.position);
      this.scene.add(birdUp);
      this.heroBirds.push(birdUp);
      this.heroVelocities.push(new THREE.Vector3(leadVel.x * 1.1, leadVel.y + 5.5, 0.5));

      const birdDown = this.createHeroBirdMesh(3);
      birdDown.position.copy(leadBird.position);
      this.scene.add(birdDown);
      this.heroBirds.push(birdDown);
      this.heroVelocities.push(new THREE.Vector3(leadVel.x * 1.1, leadVel.y - 5.5, -0.5));

      this.spawnPowerAura(leadBird.position, 0x00b0ff);
    } else if (cfg.power === 'bomb') {
      const blastCenter = this.heroBirds[0].position.clone();
      this.detonateExplosion(blastCenter, 7.5, 4.0);
    } else if (cfg.power === 'boomerang') {
      this.heroVelocities.forEach((v) => {
        v.x = -16;
        v.y += 8;
      });
      this.spawnPowerAura(this.heroBirds[0].position, 0x00c853);
    }

    return true;
  }

  // Radial TNT / Bomb Detonation
  private detonateExplosion(pos: THREE.Vector3, radius: number = 6.0, power: number = 3.0) {
    sound.power('bomb');

    for (let i = 0; i < 35; i++) {
      const col = i % 2 === 0 ? 0xff5722 : 0xffea00;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.24 + Math.random() * 0.22, 8, 8),
        new THREE.MeshBasicMaterial({ color: col })
      );
      mesh.position.copy(pos);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 15,
          Math.random() * 12 + 2,
          (Math.random() - 0.5) * 15
        ),
        life: 0,
        maxLife: 35,
        color: new THREE.Color(col)
      });
    }

    this.blocks.forEach((b) => {
      if (b.isStatic) return;
      const dist = pos.distanceTo(b.mesh.position);
      if (dist < radius) {
        b.isAwake = true;
        const dir = b.mesh.position.clone().sub(pos).normalize();
        const blastImpulse = (radius - dist) * power;
        b.velocity.add(dir.multiplyScalar(blastImpulse));
        b.rotVelocity.set(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        );
        b.hp -= 2;
        if (b.hp <= 0 && b.type === 'glass') {
          b.destroyed = true;
          this.shatterGlass(b.mesh.position);
        }
      }
    });

    this.targets.forEach((t, idx) => {
      if (!t.isHit && pos.distanceTo(t.group.position) < radius) {
        this.eliminateChick(idx, pos);
      }
    });
  }

  // Shatter Glass
  private shatterGlass(pos: THREE.Vector3) {
    sound.shatter();
    for (let i = 0; i < 16; i++) {
      const shardGeo = new THREE.ConeGeometry(0.12, 0.25, 4);
      const shardMat = new THREE.MeshBasicMaterial({
        color: 0x80deea,
        transparent: true,
        opacity: 0.8
      });
      const shard = new THREE.Mesh(shardGeo, shardMat);
      shard.position.copy(pos);
      this.scene.add(shard);
      this.particles.push({
        mesh: shard,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 7,
          Math.random() * 6 + 1,
          (Math.random() - 0.5) * 7
        ),
        life: 0,
        maxLife: 30,
        color: new THREE.Color(0x80deea)
      });
    }
  }

  // Wood Splinters
  private spawnWoodSplinters(pos: THREE.Vector3) {
    for (let i = 0; i < 10; i++) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.22, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
      );
      mesh.position.copy(pos);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          Math.random() * 5 + 1,
          (Math.random() - 0.5) * 5
        ),
        life: 0,
        maxLife: 30,
        color: new THREE.Color(0x8d6e63)
      });
    }
  }

  // Concrete Dust
  private spawnConcreteDust(pos: THREE.Vector3) {
    for (let i = 0; i < 12; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x90a4ae, transparent: true, opacity: 0.7 })
      );
      mesh.position.copy(pos);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          Math.random() * 3 + 1,
          (Math.random() - 0.5) * 3
        ),
        life: 0,
        maxLife: 25,
        color: new THREE.Color(0x90a4ae)
      });
    }
  }

  // Eliminate target chick
  private eliminateChick(chickIndex: number, impactPoint: THREE.Vector3) {
    const t = this.targets[chickIndex];
    if (!t || t.isHit) return;

    t.isHit = true;
    sound.targetHit();

    // Star poof animation
    const colors = [0xffeb3b, 0xff80ab, 0x00e676, 0xff9100];
    for (let i = 0; i < 18; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.16 + Math.random() * 0.12, 8, 8),
        new THREE.MeshBasicMaterial({ color: col })
      );
      mesh.position.copy(t.group.position);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          Math.random() * 8 + 3,
          (Math.random() - 0.5) * 8
        ),
        life: 0,
        maxLife: 40,
        color: new THREE.Color(col)
      });
    }

    const dir = t.group.position.clone().sub(impactPoint).normalize();
    t.velocity.set(dir.x * 6 + 3, Math.max(7, dir.y * 6), (Math.random() - 0.5) * 4);

    const remainingChicks = this.targets.filter((chick) => !chick.isHit).length;
    this.onChickHitCallback?.(chickIndex, remainingChicks);

    if (remainingChicks === 0 && !this.roundSuccessTriggered) {
      this.roundSuccessTriggered = true;
      setTimeout(() => {
        this.onRoundSuccessCallback?.();
      }, 1200);
    }
  }

  private spawnPowerAura(pos: THREE.Vector3, colHex: number) {
    for (let i = 0; i < 12; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        new THREE.MeshBasicMaterial({ color: colHex })
      );
      mesh.position.copy(pos);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        ),
        life: 0,
        maxLife: 25,
        color: new THREE.Color(colHex)
      });
    }
  }

  // -------------------------------------------------------------
  // ANIMATION & REALISTIC ANGRY BIRDS PHYSICS ENGINE
  // -------------------------------------------------------------
  private animate() {
    this.animFrameId = requestAnimationFrame(this.animate);

    // 1. Moving Targets
    this.targets.forEach((t) => {
      if (t.isMoving && !t.isHit) {
        t.moveTimer += 0.04;
        t.group.position.x = t.initialPos.x + Math.sin(t.moveTimer) * t.moveRange;
      }
    });

    // 2. Bird Flight Physics
    if (this.heroInFlight) {
      this.flightTimer++;
      let allBirdsSettled = true;

      this.heroBirds.forEach((bird, i) => {
        const vel = this.heroVelocities[i];

        vel.y -= 0.24; // Gravity
        vel.x += this.wind * 0.4; // Wind

        bird.position.x += vel.x * 0.038;
        bird.position.y += vel.y * 0.038;
        bird.position.z += vel.z * 0.038;

        bird.rotation.z -= 0.12;

        // DIRECT Collision: Bird with Target Chicks (clean sphere-sphere check)
        this.targets.forEach((t, tIdx) => {
          if (!t.isHit && bird.position.distanceTo(t.group.position) < 1.15) {
            this.eliminateChick(tIdx, bird.position);
          }
        });

        // ACCURATE Box-to-Sphere Collision: Bird with Blocks
        this.blocks.forEach((b) => {
          if (b.destroyed) return;

          const halfW = b.width / 2;
          const halfH = b.height / 2;
          const halfD = b.depth / 2;

          // Closest point on the 3D box
          const clampX = THREE.MathUtils.clamp(bird.position.x, b.mesh.position.x - halfW, b.mesh.position.x + halfW);
          const clampY = THREE.MathUtils.clamp(bird.position.y, b.mesh.position.y - halfH, b.mesh.position.y + halfH);
          const clampZ = THREE.MathUtils.clamp(bird.position.z, b.mesh.position.z - halfD, b.mesh.position.z + halfD);

          const distX = bird.position.x - clampX;
          const distY = bird.position.y - clampY;
          const distZ = bird.position.z - clampZ;
          const distSq = distX * distX + distY * distY + distZ * distZ;
          const birdRadius = 0.55;

          if (distSq < birdRadius * birdRadius) {
            // Wake up this block
            b.isAwake = true;
            sound.hit();
            const impactForce = vel.length();

            // Material Response
            if (b.type === 'glass') {
              vel.x *= 0.85; // Slices through glass
              vel.y *= 0.85;
              b.hp -= 2;
              this.shatterGlass(b.mesh.position);
              b.destroyed = true;
            } else if (b.type === 'wood') {
              vel.x *= 0.55;
              vel.y *= 0.55;
              b.hp -= impactForce > 9 ? 2 : 1;
              this.spawnWoodSplinters(b.mesh.position);
              if (b.hp <= 0) {
                b.destroyed = true;
              }
            } else if (b.type === 'concrete') {
              vel.x *= -0.3; // Rebounds off stone
              vel.y *= 0.3;
              b.hp -= impactForce > 14 ? 2 : 1;
              this.spawnConcreteDust(b.mesh.position);
              if (b.hp <= 0) {
                b.destroyed = true;
              }
            } else if (b.type === 'tnt') {
              b.destroyed = true;
              this.detonateExplosion(b.mesh.position, 7.5, 4.0);
            }

            // Linear momentum & rotational torque based on block mass
            if (!b.isStatic && !b.destroyed) {
              const massRatio = Math.max(0.12, 1.8 / b.mass);
              b.velocity.x += vel.x * massRatio * 0.35;
              b.velocity.y += THREE.MathUtils.clamp(vel.y * massRatio * 0.25, -5, 5);
              b.rotVelocity.z += THREE.MathUtils.clamp((bird.position.y - b.mesh.position.y) * 0.08, -0.2, 0.2);
            }
          }
        });

        // Ground collision for bird
        if (bird.position.y <= 0.35) {
          bird.position.y = 0.35;
          vel.y = -vel.y * 0.3;
          vel.x *= 0.7;
          if (Math.abs(vel.y) < 0.2) vel.y = 0;
        }

        if (bird.position.x < 32 && (vel.length() > 0.4 || bird.position.y > 0.4)) {
          allBirdsSettled = false;
        }
      });

      // Settle shot
      if (allBirdsSettled || this.flightTimer > 180) {
        this.heroInFlight = false;
        this.onFlightEndCallback?.();

        const remainingChicks = this.targets.filter((c) => !c.isHit).length;
        if (remainingChicks > 0 && !this.roundSuccessTriggered) {
          setTimeout(() => {
            this.onShotMissedCallback?.();
          }, 800);
        }
      }
    }

    // 3. Structural Support Chain & Tilting Domino Mechanics
    this.blocks.forEach((b) => {
      if (b.destroyed) {
        b.mesh.position.y = -50;
        return;
      }
      if (b.isStatic) return;

      // Check Beam Support Pillars
      if (b.isBeam && (b.supportLeftId !== undefined || b.supportRightId !== undefined)) {
        const pillarL = this.blocks.find((p) => p.id === b.supportLeftId);
        const pillarR = this.blocks.find((p) => p.id === b.supportRightId);

        const leftMissing = !pillarL || pillarL.destroyed || Math.abs(pillarL.mesh.position.x - (b.initialPos.x - 1.6)) > 1.35 || pillarL.mesh.position.y < (pillarL.initialPos.y - 0.85);
        const rightMissing = !pillarR || pillarR.destroyed || Math.abs(pillarR.mesh.position.x - (b.initialPos.x + 1.6)) > 1.35 || pillarR.mesh.position.y < (pillarR.initialPos.y - 0.85);

        if (leftMissing || rightMissing) {
          b.isAwake = true;

          if (leftMissing && !rightMissing) {
            // Tilts left
            b.rotVelocity.z = THREE.MathUtils.clamp(b.rotVelocity.z + 0.03, -0.2, 0.2);
            b.velocity.y -= 0.08;
          } else if (rightMissing && !leftMissing) {
            // Tilts right
            b.rotVelocity.z = THREE.MathUtils.clamp(b.rotVelocity.z - 0.03, -0.2, 0.2);
            b.velocity.y -= 0.08;
          } else {
            // Both lost -> drops
            b.velocity.y -= 0.18;
          }
        }
      }

      // Physics Integration for AWAKE blocks only! (Keeps unhit towers rock-solid!)
      if (b.isAwake) {
        b.velocity.y -= 0.22; // Gravity
        b.mesh.position.addScaledVector(b.velocity, 0.038);
        b.mesh.rotation.x += b.rotVelocity.x;
        b.mesh.rotation.y += b.rotVelocity.y;
        b.mesh.rotation.z += b.rotVelocity.z;

        // Angular damping
        b.rotVelocity.multiplyScalar(0.92);

        // Ground collision for block
        const halfH = b.height / 2;
        if (b.mesh.position.y <= halfH + 0.05) {
          b.mesh.position.y = halfH + 0.05;
          b.velocity.y = -b.velocity.y * 0.15;
          b.velocity.x *= 0.82;
          b.velocity.z *= 0.82;
          b.rotVelocity.multiplyScalar(0.70);

          if (b.velocity.lengthSq() < 0.03 && b.rotVelocity.lengthSq() < 0.03) {
            b.velocity.set(0, 0, 0);
            b.rotVelocity.set(0, 0, 0);
          }
        }

        // Domino Impact: Moving block colliding with neighboring blocks (requires significant momentum)
        if (b.velocity.length() > 1.2) {
          this.blocks.forEach((other) => {
            if (other.id !== b.id && !other.destroyed && !other.isStatic) {
              const dX = Math.abs(b.mesh.position.x - other.mesh.position.x);
              const dY = Math.abs(b.mesh.position.y - other.mesh.position.y);
              if (dX < (b.width + other.width) / 2 + 0.1 && dY < (b.height + other.height) / 2 + 0.1) {
                other.isAwake = true;
                other.velocity.x += b.velocity.x * 0.35;
                other.velocity.y += Math.min(0, b.velocity.y * 0.3);
                other.rotVelocity.z += b.rotVelocity.z * 0.3;
                b.velocity.multiplyScalar(0.78);

                if (other.type === 'tnt') {
                  other.destroyed = true;
                  this.detonateExplosion(other.mesh.position, 7.0, 4.0);
                } else if (other.type === 'glass' && b.mass > 1.2) {
                  other.destroyed = true;
                  this.shatterGlass(other.mesh.position);
                }
              }
            }
          });

          // Falling block striking target chick (Squash!)
          this.targets.forEach((t, idx) => {
            if (!t.isHit && b.mesh.position.distanceTo(t.group.position) < (b.height / 2 + 0.7)) {
              this.eliminateChick(idx, b.mesh.position);
            }
          });
        }
      }
    });

    // 4. Defeated Target Chick Falling & Spinning
    this.targets.forEach((t) => {
      if (t.isHit) {
        t.velocity.y -= 0.25;
        t.group.position.addScaledVector(t.velocity, 0.038);
        t.group.rotation.x += 0.15;
        t.group.rotation.z += 0.2;
      }
    });

    // 5. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.velocity.y -= 0.18;
      p.mesh.position.addScaledVector(p.velocity, 0.038);
      const scale = Math.max(0.01, 1 - p.life / p.maxLife);
      p.mesh.scale.set(scale, scale, scale);

      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  public destroy() {
    cancelAnimationFrame(this.animFrameId);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
