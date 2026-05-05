import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useEditorStore } from "../state/editorStore";

export function Viewport3D() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneData = useEditorStore((state) => state.scene);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const selectEntity = useEditorStore((state) => state.selectEntity);

  useEffect(() => {
    const hostElement = hostRef.current;
    if (!hostElement) return;
    const container = hostElement;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#111318");
    scene.add(new THREE.GridHelper(20, 20, "#475569", "#273241"));

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / Math.max(1, container.clientHeight), 0.1, 1000);
    camera.position.set(5, 4, 7);
    camera.lookAt(0, 0, 0);

    const light = new THREE.DirectionalLight("#ffffff", 1);
    light.position.set(4, 8, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight("#ffffff", 0.35));

    const pickables: THREE.Object3D[] = [];
    for (const entity of sceneData.entities) {
      const transform = entity.components.find((component) => component.type === "Transform");
      const meshRenderer = entity.components.find((component) => component.type === "MeshRenderer3D");
      if (transform?.type !== "Transform" || meshRenderer?.type !== "MeshRenderer3D") continue;

      const geometry =
        meshRenderer.primitive === "sphere"
          ? new THREE.SphereGeometry(0.5, 32, 16)
          : meshRenderer.primitive === "plane"
            ? new THREE.PlaneGeometry(1, 1)
            : new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({
        color: meshRenderer.color,
        emissive: entity.id === selectedEntityId ? new THREE.Color("#1d4ed8") : new THREE.Color("#000000"),
        emissiveIntensity: entity.id === selectedEntityId ? 0.25 : 0
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = entity.id;
      mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
      mesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
      mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
      scene.add(mesh);
      pickables.push(mesh);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function handlePointerDown(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pickables)[0];
      selectEntity(hit?.object.name ?? null);
    }

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    }

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let frame = 0;
    function render() {
      frame = requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
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
  }, [sceneData, selectedEntityId, selectEntity]);

  return <div className="viewport-3d" ref={hostRef} />;
}
