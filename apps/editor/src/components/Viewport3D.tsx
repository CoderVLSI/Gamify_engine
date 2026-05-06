import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { useEditorStore } from "../state/editorStore";

export function Viewport3D() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const sceneData = useEditorStore((state) => state.scene);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const activeTransformTool = useEditorStore((state) => state.activeTransformTool);
  const selectEntity = useEditorStore((state) => state.selectEntity);
  const setTransform = useEditorStore((state) => state.setTransform);

  useEffect(() => {
    const canvasHost = canvasHostRef.current;
    if (!canvasHost) return;
    const container = canvasHost;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearAlpha(0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    if (sceneData.settings.viewportMode === "2d") {
      const grid = new THREE.GridHelper(24, 24, "#475569", "#273241");
      grid.rotation.x = Math.PI / 2;
      scene.add(grid);
    } else {
      scene.add(new THREE.GridHelper(20, 20, "#475569", "#273241"));
    }

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / Math.max(1, container.clientHeight), 0.1, 1000);
    camera.position.set(5, 4, 7);
    if (sceneData.settings.viewportMode === "2d") {
      camera.position.set(0, 0, 14);
    }
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.screenSpacePanning = true;
    controls.target.set(0, 0, 0);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.PAN
    };
    controls.update();

    const light = new THREE.DirectionalLight("#ffffff", 1);
    light.position.set(4, 8, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight("#ffffff", 0.35));

    const pickables: THREE.Object3D[] = [];
    const meshesByEntityId = new Map<string, THREE.Mesh>();
    for (const entity of sceneData.entities) {
      const transform = entity.components.find((component) => component.type === "Transform");
      const meshRenderer = entity.components.find((component) => component.type === "MeshRenderer3D");
      const spriteRenderer = entity.components.find((component) => component.type === "SpriteRenderer2D");
      const spriteAnimation = entity.components.find((component) => component.type === "SpriteAnimation2D");
      const tilemap = entity.components.find((component) => component.type === "Tilemap2D");
      if (transform?.type !== "Transform") continue;

      let geometry: THREE.BufferGeometry | null = null;
      let materialColor = "#6ee7b7";
      if (meshRenderer?.type === "MeshRenderer3D") {
        geometry =
          meshRenderer.primitive === "sphere"
          ? new THREE.SphereGeometry(0.5, 32, 16)
          : meshRenderer.primitive === "plane"
            ? new THREE.PlaneGeometry(1, 1)
            : new THREE.BoxGeometry(1, 1, 1);
        materialColor = meshRenderer.color;
      } else if (spriteRenderer?.type === "SpriteRenderer2D" || spriteAnimation?.type === "SpriteAnimation2D") {
        geometry = new THREE.PlaneGeometry(1, 1.4);
        materialColor = spriteRenderer?.type === "SpriteRenderer2D" ? spriteRenderer.color : "#facc15";
      } else if (tilemap?.type === "Tilemap2D") {
        geometry = new THREE.PlaneGeometry(Math.max(1, tilemap.columns / 4), Math.max(1, tilemap.rows / 4));
        materialColor = "#64748b";
      }
      if (!geometry) continue;
      const material = new THREE.MeshStandardMaterial({
        color: materialColor,
        emissive: entity.id === selectedEntityId ? new THREE.Color("#1d4ed8") : new THREE.Color("#000000"),
        emissiveIntensity: entity.id === selectedEntityId ? 0.25 : 0,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = entity.id;
      mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
      mesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
      mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
      if (sceneData.settings.viewportMode === "2d" && meshRenderer?.type !== "MeshRenderer3D") {
        mesh.position.z = transform.position.z;
      }
      scene.add(mesh);
      pickables.push(mesh);
      meshesByEntityId.set(entity.id, mesh);
    }

    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode(activeTransformTool === "move" ? "translate" : activeTransformTool);
    transformControls.setSize(0.85);
    const selectedMesh = selectedEntityId ? meshesByEntityId.get(selectedEntityId) : undefined;
    if (selectedMesh) {
      transformControls.attach(selectedMesh);
      scene.add(transformControls.getHelper());
    }
    transformControls.addEventListener("dragging-changed", (event) => {
      controls.enabled = !event.value;
    });
    transformControls.addEventListener("objectChange", () => {
      const object = transformControls.object;
      if (!object?.name) return;
      setTransform(object.name, {
        position: { x: object.position.x, y: object.position.y, z: object.position.z },
        rotation: { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z },
        scale: { x: object.scale.x, y: object.scale.y, z: object.scale.z }
      });
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerStart: { x: number; y: number; button: number } | null = null;

    function handlePointerDown(event: PointerEvent) {
      pointerStart = { x: event.clientX, y: event.clientY, button: event.button };
    }

    function handlePointerUp(event: PointerEvent) {
      if (!pointerStart || pointerStart.button !== 0) return;
      const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
      pointerStart = null;
      if (moved > 4) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pickables)[0];
      selectEntity(hit?.object.name ?? null);
    }

    function preventContextMenu(event: MouseEvent) {
      event.preventDefault();
    }

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    }

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("contextmenu", preventContextMenu);
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let frame = 0;
    function render() {
      frame = requestAnimationFrame(render);
      controls.update();
      renderer.render(scene, camera);
    }
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("contextmenu", preventContextMenu);
      controls.dispose();
      transformControls.detach();
      transformControls.dispose();
      renderer.dispose();
      for (const pickable of pickables) {
        if (pickable instanceof THREE.Mesh) {
          pickable.geometry.dispose();
          if (Array.isArray(pickable.material)) {
            pickable.material.forEach((material) => material.dispose());
          } else {
            pickable.material.dispose();
          }
        }
      }
      container.removeChild(renderer.domElement);
    };
  }, [activeTransformTool, sceneData, selectedEntityId, selectEntity, setTransform]);

  return (
    <div className="viewport-3d" ref={hostRef}>
      <div className="viewport-canvas" ref={canvasHostRef} />
      <div className="viewport-help">
        <span>{sceneData.settings.viewportMode.toUpperCase()}</span>
        <span>Left drag orbit</span>
        <span>Right/middle drag pan</span>
        <span>Wheel zoom</span>
        <span>Click select</span>
        <span>{activeTransformTool} gizmo</span>
      </div>
    </div>
  );
}
