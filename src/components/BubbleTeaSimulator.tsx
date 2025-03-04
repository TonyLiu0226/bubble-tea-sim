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
  const liquidRef = useRef<THREE.Mesh | null>(null);
  const liquidWavesRef = useRef<{ time: number; vertices: THREE.Vector3[]; initialPositions: number[] } | null>(null);
  const toppingsRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const toppingColors = {
    blackPearl: 0x222222,
    pineapple: 0xFFDD00,
    octopusBall: 0x6B4226,
    squidLeg: 0xF6D8CE,
    jelly: 0xE0F2E9,
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.sortObjects = false;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

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

    const cupGroup = new THREE.Group();
    scene.add(cupGroup);
    cupRef.current = cupGroup;

    const toppingsGroup = new THREE.Group();
    scene.add(toppingsGroup);
    toppingsRef.current = toppingsGroup;

    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (cupRef.current) {
        cupRef.current.rotation.y += 0.002;
      }
      
      if (liquidRef.current && liquidWavesRef.current) {
        liquidWavesRef.current.time += 0.03;
        const vertices = liquidRef.current.geometry.attributes.position;
        const waveData = liquidWavesRef.current;
        
        for (let i = 0; i < waveData.vertices.length; i++) {
          const vertex = waveData.vertices[i];
          if (Math.abs(vertex.y - 1.75) < 0.1) {
            const initialY = waveData.initialPositions[i];
            const distance = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
            const wave = Math.sin(distance * 3 + waveData.time) * 0.03 + 
                          Math.sin(distance * 2 - waveData.time * 0.7) * 0.02;
            vertices.setY(i, initialY + wave);
          }
        }
        vertices.needsUpdate = true;
        liquidRef.current.geometry.computeVertexNormals();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);

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

  useEffect(() => {
    if (!cupRef.current || !sceneRef.current) return;

    while (cupRef.current.children.length) {
      const object = cupRef.current.children[0];
      cupRef.current.remove(object);
    }

    const flavorHex = flavorColors[config.flavor];
    console.log("Selected flavor:", config.flavor);
    console.log("Flavor hex color:", flavorHex);
    
    const threeColor = new THREE.Color(flavorHex);
    console.log("THREE.Color object:", threeColor);

    const cupMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.05,
    });

    const cupGeometry = new THREE.CylinderGeometry(1, 0.8, 2.5, 32);
    const cup = new THREE.Mesh(cupGeometry, cupMaterial);
    cup.position.y = 0.5;
    cupRef.current.add(cup);

    const liquidHeight = 2.25;
    const liquidTopPosition = 0.5 - (2.5 - liquidHeight) / 2;

    const liquidGeometry = new THREE.CylinderGeometry(0.95, 0.75, liquidHeight, 32, 16);
    const liquidMaterial = new THREE.MeshStandardMaterial({
      color: threeColor,
      transparent: false,
      opacity: 0.9,
      roughness: 0.2,
      metalness: 0.1,
      emissive: threeColor,
      emissiveIntensity: 0.4,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });

    const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquid.position.y = liquidTopPosition;
    liquidRef.current = liquid;
    cupRef.current.add(liquid);
    liquid.renderOrder = 1;

    const innerLiquidGeometry = new THREE.CylinderGeometry(0.85, 0.65, liquidHeight - 0.1, 32);
    const innerLiquidMaterial = new THREE.MeshStandardMaterial({
      color: threeColor,
      transparent: true,
      opacity: 0.9,
      roughness: 0.1,
      metalness: 0.2,
      emissive: threeColor,
      emissiveIntensity: 0.6,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    
    const innerLiquid = new THREE.Mesh(innerLiquidGeometry, innerLiquidMaterial);
    innerLiquid.position.y = liquidTopPosition;
    cupRef.current.add(innerLiquid);
    innerLiquid.renderOrder = 2;

    const liquidVertices = [];
    const initialPositions = [];
    
    const positionAttribute = liquidGeometry.attributes.position;
    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(positionAttribute, i);
      liquidVertices.push(vertex);
      initialPositions.push(vertex.y);
    }
    
    liquidWavesRef.current = {
      time: 0,
      vertices: liquidVertices,
      initialPositions: initialPositions
    };

    const liquidSurfaceGeometry = new THREE.CircleGeometry(0.95, 32);
    const liquidSurfaceMaterial = new THREE.MeshStandardMaterial({
      color: threeColor,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.3,
      emissive: threeColor,
      emissiveIntensity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    
    const liquidSurface = new THREE.Mesh(liquidSurfaceGeometry, liquidSurfaceMaterial);
    liquidSurface.rotation.x = -Math.PI / 2;
    liquidSurface.position.y = liquidTopPosition + liquidHeight/2 - 0.02;
    liquidSurface.renderOrder = 3;
    cupRef.current.add(liquidSurface);

    const strawGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4, 16);
    const strawMaterial = new THREE.MeshStandardMaterial({ color: 0xff5555 });
    const straw = new THREE.Mesh(strawGeometry, strawMaterial);
    straw.position.set(0.5, 1.5, 0);
    straw.rotation.x = Math.PI / 10;
    cupRef.current.add(straw);

    const lidGeometry = new THREE.CylinderGeometry(1.05, 1.05, 0.1, 32);
    const lidMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    });
    const lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.position.y = 1.75;
    cupRef.current.add(lid);

    const rimGeometry = new THREE.TorusGeometry(1, 0.05, 16, 32);
    const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.75;
    cupRef.current.add(rim);
  }, [config.flavor]);

  useEffect(() => {
    if (!toppingsRef.current || !sceneRef.current) return;

    while (toppingsRef.current.children.length) {
      const object = toppingsRef.current.children[0];
      toppingsRef.current.remove(object);
    }

    if (config.toppings.length === 0) return;

    const getRandomPosition = () => {
      const radius = Math.random() * 0.7;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = -0.5 + Math.random() * 1.5;
      return new THREE.Vector3(x, y, z);
    };

    config.toppings.forEach((toppingType) => {
      let geometry, material;
      const numberOfPieces = Math.floor(Math.random() * (2 * config.toppings.length)) + 6;

      for (let i = 0; i < numberOfPieces; i++) {
        switch (toppingType) {
          case "blackPearl":
            geometry = new THREE.SphereGeometry(0.1, 16, 16);
            material = new THREE.MeshStandardMaterial({
              color: toppingColors.blackPearl,
              roughness: 0.6,
              metalness: 0.2,
              emissive: toppingColors.blackPearl,
              emissiveIntensity: 0,
              transparent: false,
              depthWrite: true,
              depthTest: true,
            });
            break;

          case "pineapple":
            geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
            material = new THREE.MeshStandardMaterial({
              color: toppingColors.pineapple,
              roughness: 0.4,
              metalness: 0.1,
              emissive: toppingColors.pineapple,
              emissiveIntensity: 0.3,
              transparent: false,
              depthWrite: true,
              depthTest: true,
            });
            break;

          case "octopusBall":
            geometry = new THREE.SphereGeometry(0.15, 16, 16);
            material = new THREE.MeshStandardMaterial({
              color: toppingColors.octopusBall,
              roughness: 0.5,
              metalness: 0.1,
              emissive: toppingColors.octopusBall,
              emissiveIntensity: 0.2,
              transparent: false,
              depthWrite: true,
              depthTest: true,
            });
            break;

          case "squidLeg":
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
              metalness: 0.1,
              emissive: toppingColors.squidLeg,
              emissiveIntensity: 0.2,
              transparent: false,
              depthWrite: true,
              depthTest: true,
            });
            break;

          case "jelly":
            geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            material = new THREE.MeshStandardMaterial({
              color: toppingColors.jelly,
              roughness: 0.1,
              metalness: 0.2,
              emissive: toppingColors.jelly,
              emissiveIntensity: 0.3,
              transparent: false,
              depthWrite: true,
              depthTest: true,
            });
            break;

          default:
            continue;
        }

        const topping = new THREE.Mesh(geometry, material);
        const position = getRandomPosition();
        topping.position.copy(position);
        
        topping.rotation.x = Math.random() * Math.PI;
        topping.rotation.y = Math.random() * Math.PI;
        topping.rotation.z = Math.random() * Math.PI;
        
        topping.renderOrder = 3;
        toppingsRef.current.add(topping);
      }
    });
  }, [config.toppings]);

  return <div ref={mountRef} className="canvas-container glass-panel shadow-2xl" />;
};

export default BubbleTeaSimulator;
