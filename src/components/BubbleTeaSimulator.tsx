import React, { useRef, useEffect } from "react";
import { BubbleTeaConfig } from "@/types/bubbleTea";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { flavorColors } from "./FlavorSelector";

interface BubbleTeaSimulatorProps {
  config: BubbleTeaConfig;
}

const BubbleTeaSimulator: React.FC<BubbleTeaSimulatorProps> = ({ config }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cupRef = useRef<THREE.Group | null>(null);
  const teaRef = useRef<THREE.Mesh | null>(null);
  const toppingsRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Color mappings for toppings
  const toppingColors = {
    blackPearl: 0x222222,
    pineapple: 0xFFDD00,
    octopusBall: 0x6B4226,
    squidLeg: 0xF6D8CE,
    jelly: 0xE0F2E9,
  };

  // Convert hex color strings to THREE.js compatible color numbers
  const getColorValue = (hexColor: string) => {
    // Remove the # if it exists
    const hex = hexColor.replace('#', '');
    // Convert to number
    return parseInt(hex, 16);
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const fill1 = new THREE.DirectionalLight(0xffffff, 0.4);
    fill1.position.set(-5, 3, -5);
    scene.add(fill1);

    const fill2 = new THREE.DirectionalLight(0xffffff, 0.3);
    fill2.position.set(5, 3, -5);
    scene.add(fill2);

    // Create cup group
    const cupGroup = new THREE.Group();
    scene.add(cupGroup);
    cupRef.current = cupGroup;

    // Create toppings group
    const toppingsGroup = new THREE.Group();
    scene.add(toppingsGroup);
    toppingsRef.current = toppingsGroup;

    // Animation loop
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (cupRef.current) {
        cupRef.current.rotation.y += 0.002;
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Create or update cup
  useEffect(() => {
    if (!cupRef.current || !sceneRef.current) return;

    // Clear existing cup
    while (cupRef.current.children.length) {
      const object = cupRef.current.children[0];
      cupRef.current.remove(object);
    }

    // Cup geometry
    const cupMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.2,
    });

    const cupGeometry = new THREE.CylinderGeometry(1, 0.8, 2.5, 32);
    const cup = new THREE.Mesh(cupGeometry, cupMaterial);
    cup.position.y = 0.5;
    cupRef.current.add(cup);

    // Tea geometry - use the selected flavor's color
    const teaGeometry = new THREE.CylinderGeometry(0.95, 0.75, 2, 32);
    const flavorColor = flavorColors[config.flavor];
    const colorValue = getColorValue(flavorColor);
    
    const teaMaterial = new THREE.MeshStandardMaterial({
      color: colorValue,
      transparent: true,
      opacity: 0.9,
    });

    const tea = new THREE.Mesh(teaGeometry, teaMaterial);
    tea.position.y = 0.5;
    tea.position.y = 0.3;
    teaRef.current = tea;
    cupRef.current.add(tea);

    // Add a straw
    const strawGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4, 16);
    const strawMaterial = new THREE.MeshStandardMaterial({ color: 0xff5555 });
    const straw = new THREE.Mesh(strawGeometry, strawMaterial);
    straw.position.set(0.5, 1.5, 0);
    straw.rotation.x = Math.PI / 10;
    cupRef.current.add(straw);

    // Add lid
    const lidGeometry = new THREE.CylinderGeometry(1.05, 1.05, 0.1, 32);
    const lidMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    });
    const lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.position.y = 1.75;
    cupRef.current.add(lid);

    // Add cup rim
    const rimGeometry = new THREE.TorusGeometry(1, 0.05, 16, 32);
    const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.75;
    cupRef.current.add(rim);
  }, [config.flavor]);

  // Create or update toppings
  useEffect(() => {
    if (!toppingsRef.current || !sceneRef.current) return;

    // Clear existing toppings
    while (toppingsRef.current.children.length) {
      const object = toppingsRef.current.children[0];
      toppingsRef.current.remove(object);
    }

    // Skip if there are no toppings
    if (config.toppings.length === 0) return;

    // Helper function to create a random position within the tea
    const getRandomPosition = () => {
      const radius = Math.random() * 0.7;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.random() * 1.2 - 0.5; // Between -0.5 and 0.7 (within the tea)
      return new THREE.Vector3(x, y, z);
    };

    // Create toppings based on the configuration
    config.toppings.forEach((toppingType) => {
      let geometry, material;
      const numberOfPieces = Math.floor(Math.random() * 3) + 3; // 3-5 pieces of each topping

      for (let i = 0; i < numberOfPieces; i++) {
        switch (toppingType) {
          case "blackPearl":
            geometry = new THREE.SphereGeometry(0.1, 16, 16);
            material = new THREE.MeshStandardMaterial({
              color: toppingColors.blackPearl,
              roughness: 0.6,
            });
            break;

          case "pineapple":
            geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
            material = new THREE.MeshStandardMaterial({
              color: toppingColors.pineapple,
              roughness: 0.4,
            });
            break;

          case "octopusBall":
            geometry = new THREE.SphereGeometry(0.15, 16, 16);
            material = new THREE.MeshStandardMaterial({
              color: toppingColors.octopusBall,
              roughness: 0.5,
            });
            break;

          case "squidLeg":
            // Create a curved cylinder for squid legs
            const curve = new THREE.CatmullRomCurve3([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0.1, 0.1, 0),
              new THREE.Vector3(0.2, 0, 0),
              new THREE.Vector3(0.3, -0.1, 0),
            ]);
            
            geometry = new THREE.TubeGeometry(curve, 8, 0.03, 8, false);
            material = new THREE.MeshStandardMaterial({
              color: toppingColors.squidLeg,
              roughness: 0.4,
            });
            break;

          case "jelly":
            geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            material = new THREE.MeshPhysicalMaterial({
              color: toppingColors.jelly,
              transparent: true,
              opacity: 0.8,
              roughness: 0.1,
              transmission: 0.5,
            });
            break;

          default:
            continue;
        }

        const topping = new THREE.Mesh(geometry, material);
        const position = getRandomPosition();
        topping.position.copy(position);
        
        // Random rotation
        topping.rotation.x = Math.random() * Math.PI;
        topping.rotation.y = Math.random() * Math.PI;
        topping.rotation.z = Math.random() * Math.PI;

        toppingsRef.current.add(topping);
      }
    });
  }, [config.toppings]);

  return <div ref={mountRef} className="canvas-container glass-panel shadow-2xl" />;
};

export default BubbleTeaSimulator;
