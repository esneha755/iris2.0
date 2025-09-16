"use client";

import { useCallback, useEffect, useRef } from "react";
import * as Cesium from "cesium";
import * as THREE from "three";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";


Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YjIxYjgyYy01NWNiLTRiYTMtODM1OC05Yjc2NjkwNTBmY2IiLCJpZCI6MzQwMTY2LCJpYXQiOjE3NTc1MjEwNTd9._FD4RBe-8LYXN2BT5GNwNqFFzSyHnKsMaY8w_kSodEw";

type Planet = {
  mesh: THREE.Mesh;
  orbitRadius: number;
  speed: number;
  angle: number;
  name: string;
};

export default function SolarSystem() {
  const cesiumContainer = useRef<HTMLDivElement>(null); 
  const threeContainer = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationRef = useRef<number | null>(null); // moved outside
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Reset camera smoothly
  const resetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    const start = cameraRef.current.position.clone();
    const startTime = performance.now();
    const targetPosition = new THREE.Vector3(0, 500, 1000);
    const duration = 600;

    const animateMove = (time: number) => {
      const t = Math.min((time - startTime) / duration, 1);
      cameraRef.current!.position.lerpVectors(start, targetPosition, t);
      controlsRef.current!.target.lerp(new THREE.Vector3(0, 0, 0), t);
      controlsRef.current!.update();

      if (t < 1) {
        animationRef.current = requestAnimationFrame(animateMove);
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animateMove);
  }, []);

  useEffect(() => {
    if (!cesiumContainer.current || !threeContainer.current) return;

    (window as any).CESIUM_BASE_URL = "/cesium";

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(0x000000, 0);
    threeContainer.current!.appendChild(renderer.domElement);

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      20000
    );
    camera.position.set(0, 500, 1000);
    cameraRef.current = camera;

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.2;
    controls.minDistance = 50;
    controls.maxDistance = 6000;
    controlsRef.current = controls;

    // --- Starfield background ---
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 5000;
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xe3e3e3, 1.2);
    scene.add(ambientLight);
    const sunLight = new THREE.PointLight(0xffffff, 3, 0);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // --- Sun ---
    const textureLoader = new THREE.TextureLoader();
    const sunTexture = textureLoader.load("/textures/sun.jpg");
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(30, 64, 64),
      new THREE.MeshStandardMaterial({
        map: sunTexture,
        emissive: 0xffdd33,
        emissiveIntensity: 0.5,
      })
    );
    sun.name = "Sun";
    scene.add(sun);

    // --- Helpers ---
    function createOrbit(radius: number) {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI);
      const points = curve.getPoints(200);
      const geometry = new THREE.BufferGeometry().setFromPoints(points as any);
      const material = new THREE.LineBasicMaterial({ color: 0x202020 });
      const orbit = new THREE.LineLoop(geometry, material);
      scene.add(orbit);
    }

    const createLabel = (text: string): THREE.Sprite => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const context = canvas.getContext("2d")!;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = "24px Arial";
      context.fillStyle = "white";
      context.fillText(text, 10, 32);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(50, 12, 1);
      return sprite;
    };

    // --- Planets ---
    function createPlanet(
      size: number,
      textureUrl: string,
      orbitRadius: number,
      speed: number,
      name: string
    ): Planet {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, 72, 72),
        new THREE.MeshPhongMaterial({
          map: textureLoader.load(textureUrl),
        })
      );
      mesh.name = name;
      scene.add(mesh);

      const label = createLabel(name);
      mesh.add(label);
      label.position.set(0, size + 5, 0);

      return { mesh, orbitRadius, speed, angle: Math.random() * Math.PI * 2, name };
    }

    const planets: Planet[] = [
      createPlanet(10, "./textures/mercury.jpg", 60, 0.0015, "Mercury"),
      createPlanet(12, "./textures/venus.jpg", 90, 0.0012, "Venus"),
      createPlanet(13, "./textures/earth.jpg", 130, 0.001, "Earth"),
      createPlanet(12, "./textures/mars.jpg", 170, 0.0008, "Mars"),
      createPlanet(25, "./textures/jupiter.jpg", 240, 0.0005, "Jupiter"),
      createPlanet(18, "./textures/saturn.jpg", 300, 0.0004, "Saturn"),
      createPlanet(16, "./textures/uranus.jpg", 360, 0.0003, "Uranus"),
      createPlanet(16, "./textures/neptune.jpg", 420, 0.00025, "Neptune"),
];

    [60, 90, 130, 170, 240, 300, 360, 420].forEach((r) => createOrbit(r));

    // Saturn rings
    const ringGeometry = new THREE.RingGeometry(20, 30, 64);
    const ringMaterial = new THREE.MeshPhongMaterial({
      map: textureLoader.load("/textures/saturn_ring.png"),
      side: THREE.DoubleSide,
      transparent: true,
    });
    const saturnRing = new THREE.Mesh(ringGeometry, ringMaterial);
    saturnRing.rotation.x = Math.PI / 2;
    planets[5].mesh.add(saturnRing);

    // --- nanosat orbiting Earth (single source) ---
    const nanosatOrbitRadius = 25;
    const nanosat = new THREE.Mesh(
      new THREE.BoxGeometry(7, 7, 7),
      new THREE.MeshPhongMaterial({ color: 0xff00ff })
    );
    nanosat.name = "Nanosat";
    scene.add(nanosat);
    const nanosatLabel = createLabel("Nanosat");
    nanosat.add(nanosatLabel);
    nanosatLabel.position.set(0, 6, 0);

    // --- Foreign Interstellar Bodies ---
    type Foreign = {
      mesh: THREE.Mesh;
      pathRadius: number;
      tilt: number;
      angle: number;
      speed: number;
      dashedLine?: THREE.Line;
    };

    function createForeignBody(
      name: string,
      size: number,
      color: number,
      pathRadius: number,
      tilt: number
    ): Foreign {
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshPhongMaterial({ color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = name;
      scene.add(mesh);

      // dashed trajectory path (visual only)
      const curve = new THREE.EllipseCurve(
        0,
        0,
        pathRadius,
        pathRadius * 0.7,
        0,
        2 * Math.PI,
        false,
        tilt
      );
      const points = curve.getPoints(400);
      const geometryLine = new THREE.BufferGeometry().setFromPoints(points as any);
      const materialLine = new THREE.LineDashedMaterial({
        color: 0xff5555,
        dashSize: 8,
        gapSize: 4,
      });
      const trajectory = new THREE.Line(geometryLine, materialLine);
      (trajectory as any).computeLineDistances();
      scene.add(trajectory);

      return { mesh, pathRadius, tilt, angle: Math.random() * Math.PI * 2, speed: 0.0015, dashedLine: trajectory };
    }

    const foreignBodies: Foreign[] = [
      createForeignBody("Oumuamua-1", 3, 0xaaaaaa, 800, Math.PI / 6),
      createForeignBody("Oumuamua-2", 2.5, 0x888888, 950, Math.PI / 4),
    ];

    // place foreign bodies initially on their dashed paths
    foreignBodies.forEach((fb) => {
      fb.mesh.position.set(Math.cos(fb.angle) * fb.pathRadius, Math.sin(fb.angle) * fb.pathRadius * 0.7, 0);
    });

    // --- Interceptor swarm (24) launched from nanosat's current orbit position ---
    type Interceptor = {
      mesh: THREE.Mesh;
      curve: THREE.Curve<THREE.Vector3>;
      t: number;
      speed: number;
      line: THREE.Line;
      circle: THREE.Mesh;
      target: Foreign;
    };

    const interceptors: Interceptor[] = [];

    function createInterceptor(startPos: THREE.Vector3, target: Foreign, angleOffset: number): Interceptor {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshPhongMaterial({ color: 0x00ffff, transparent: true, opacity: 0.95 })
      );
      scene.add(mesh);

      // initial end point: a point ahead on the target's path (we'll update during animation)
      const endPos = target.mesh.position.clone().add(new THREE.Vector3(1, -0.3, 0).normalize().multiplyScalar(200 + angleOffset * 5));

      // midpoint offset for curve shaping
      const midPoint = new THREE.Vector3(
        (startPos.x + endPos.x) / 2 + Math.cos(angleOffset) * 80,
        (startPos.y + endPos.y) / 2 + Math.sin(angleOffset) * 80,
        0
      );

      const curve = new THREE.CatmullRomCurve3([startPos.clone(), midPoint, endPos.clone()]);
      const points = curve.getPoints(150);
      const geometryLine = new THREE.BufferGeometry().setFromPoints(points);
      const materialLine = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.25 });
      const line = new THREE.Line(geometryLine, materialLine);
      scene.add(line);

      // pulsating circle to visualize intercept motion
      const circleGeometry = new THREE.RingGeometry(1, 1.4, 32);
      const circleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      const circle = new THREE.Mesh(circleGeometry, circleMaterial);
      circle.rotation.x = Math.PI / 2;
      mesh.add(circle);

      return { mesh, curve, t: 0, speed: 0.0015 + Math.random() * 0.002, line, circle, target };
    }

    // create 24 interceptors; we will set their startPos after nanosat is positioned
    for (let i = 0; i < 24; i++) {
      // placeholder start, will be replaced immediately in animation loop
      const placeholderStart = new THREE.Vector3(0, 0, 0);
      interceptors.push(createInterceptor(placeholderStart, foreignBodies[0], (i / 24) * Math.PI * 2));
    }

    // --- Animation loop (single) ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const dt = clock.getDelta();

      // move planets
      planets.forEach((planet) => {
        planet.angle += planet.speed * (dt * 60); // scale dt to keep speed similar
        planet.mesh.position.set(
          Math.cos(planet.angle) * planet.orbitRadius,
          Math.sin(planet.angle) * planet.orbitRadius,
          0
        );
      });

      // update foreign bodies along their paths (so dashed trajectories stay static visual guides)
      foreignBodies.forEach((fb) => {
        fb.angle += fb.speed * (dt * 60);
        fb.mesh.position.set(
          Math.cos(fb.angle) * fb.pathRadius,
          Math.sin(fb.angle) * fb.pathRadius * 0.7,
          0
        );
      });

      // compute nanosat position relative to Earth (single nanosat in Earth orbit)
      const earth = planets.find((p) => p.name === "Earth");
      if (earth) {
        // nanosat orbit around Earth (nanosatOrbitRadius meters in scene units)
        const time = performance.now() * 0.0005;
        const nx = Math.cos(time) * nanosatOrbitRadius;
        const ny = Math.sin(time) * nanosatOrbitRadius;
        nanosat.position.set(earth.mesh.position.x + nx, earth.mesh.position.y + ny, earth.mesh.position.z);
      }

      // update interceptors: recompute curves to chase moving target and advance along curve
      interceptors.forEach((ic, idx) => {
        // start point = nanosat current world position
        const startPos = nanosat.position.clone();

        // pick an interception point along the target's forward path
        const targetFwd = new THREE.Vector3(
          Math.cos(ic.target.angle + 0.001),
          Math.sin(ic.target.angle + 0.001) * 0.7,
          0
        ).normalize();

        // dynamic end point ahead of moving target (offset each interceptor a bit)
        const offsetScalar = 200 + (idx - 12) * 8; // spreads intercept along the line
        const endPos = ic.target.mesh.position.clone().add(targetFwd.clone().multiplyScalar(offsetScalar));

        // dynamic mid point gives natural curved path (with some randomness per interceptor)
        const angleOffset = (idx / interceptors.length) * Math.PI * 2;
        const midPoint = new THREE.Vector3(
          (startPos.x + endPos.x) / 2 + Math.cos(angleOffset) * 80,
          (startPos.y + endPos.y) / 2 + Math.sin(angleOffset) * 80,
          0
        );

        // update curve points
        ic.curve = new THREE.CatmullRomCurve3([startPos.clone(), midPoint, endPos.clone()]);
        const newPoints = ic.curve.getPoints(150);
        (ic.line.geometry as THREE.BufferGeometry).setFromPoints(newPoints as any);
        (ic.line.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;

        // advance along the path (t from 0..1)
        ic.t = Math.min(ic.t + ic.speed * (dt * 60), 1);

        const pos = ic.curve.getPointAt(ic.t);
        ic.mesh.position.copy(pos);

        // rotate/pulse the circle
        const scale = 1 + Math.sin(performance.now() * 0.005 + idx) * 0.3;
        ic.circle.scale.set(scale, scale, scale);
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // --- Resize handler ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      // dispose scene objects (textures, geometries, materials)
      scene.traverse((obj) => {
        if ((obj as any).geometry) (obj as any).geometry.dispose?.();
        if ((obj as any).material) {
          const m = (obj as any).material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose?.());
          else m.dispose?.();
        }
      });
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div ref={cesiumContainer} style={{ width: "100%", height: "100%" }} />
      <div
        ref={threeContainer}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "auto",
        }}
      />

      <button
        onClick={resetCamera}
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          padding: "10px 14px",
          background: "#04369e",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        Center
      </button>
    </div>
  );
}
