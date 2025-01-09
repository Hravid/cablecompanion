import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let wireframe = false;
let cableGroup;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth * 0.66 / 600, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.66, 600);
    renderer.setClearColor(0xffffff);
    
    const container = document.getElementById('3d-view');
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Camera position
    camera.position.z = 80;

    // Add OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Create cable group
    cableGroup = new THREE.Group();
    scene.add(cableGroup);

    // Initial render
    updateVisualization();

    // Animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) {
        controls.update();
    }
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function calculatePositions(numHoles, numCables) {
    const positions = [];
    const step = numHoles / numCables;
    for (let i = 0; i < numCables; i++) {
        const position = Math.floor(i * step) % numHoles + 1;
        positions.push(position);
    }
    return Array.from(new Set(positions)).sort((a, b) => a - b);
}

function updateVisualization() {
    if (!cableGroup) return;

    const numHoles = parseInt(document.getElementById('num_holes').value);
    const numCables = parseInt(document.getElementById('num_cables').value);
    const cableDiameter = parseFloat(document.getElementById('cable_diameter').value);
    const holeDiameter = parseFloat(document.getElementById('hole_diameter').value);

    // Clear previous geometry
    while(cableGroup.children.length > 0) {
        const object = cableGroup.children[0];
        object.geometry.dispose();
        object.material.dispose();
        cableGroup.remove(object);
    }

    // Create circle
    const radius = 35;  // Increased radius
    const circleGeometry = new THREE.TorusGeometry(radius, 1, 16, 100);
    const circleMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x4f46e5,
        wireframe: wireframe
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    cableGroup.add(circle);

    // Add holes
    const positions = calculatePositions(numHoles, numCables);
    for (let i = 0; i < numHoles; i++) {
        const angle = (i / numHoles) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const holeGeometry = new THREE.CylinderGeometry(
            holeDiameter / 2,
            holeDiameter / 2,
            4,
            32
        );
        const holeMaterial = new THREE.MeshPhongMaterial({
            color: positions.includes(i + 1) ? 0x4f46e5 : 0xd1d5db,
            wireframe: wireframe
        });
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        
        hole.position.set(x, y, 0);
        hole.rotation.x = Math.PI / 2;
        cableGroup.add(hole);

        // Add cables
        if (positions.includes(i + 1)) {
            const cableGeometry = new THREE.CylinderGeometry(
                cableDiameter / 2,
                cableDiameter / 2,
                8,
                32
            );
            const cableMaterial = new THREE.MeshPhongMaterial({
                color: 0x4f46e5,
                wireframe: wireframe
            });
            const cable = new THREE.Mesh(cableGeometry, cableMaterial);
            
            cable.position.set(x, y, 0);
            cable.rotation.x = Math.PI / 2;
            cableGroup.add(cable);
        }
    }

    // Update results display
    document.getElementById('result').innerHTML = positions
        .map(pos => `<div class="position-chip">${pos}</div>`)
        .join('');

    // Update 2D visualization
    draw2DVisualization(numHoles, positions);
}

function draw2DVisualization(numHoles, cablePositions) {
    const canvas = document.getElementById('circleCanvas');
    const ctx = canvas.getContext('2d');
    
    // Ustaw rzeczywiste wymiary canvasu
    canvas.width = 800;
    canvas.height = 800;
    
    // Wyczyść canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2.8;
    
    // Dostosuj rozmiar otworów w zależności od ich liczby
    const holeSize = Math.max(6, Math.min(15, 400 / numHoles));
    const labelOffset = Math.max(35, Math.min(50, 600 / numHoles));
    
    // Rysuj główny okrąg
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    for (let i = 0; i < numHoles; i++) {
        const angle = (i / numHoles) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // Rysuj otwory
        ctx.beginPath();
        ctx.arc(x, y, holeSize, 0, 2 * Math.PI);
        
        if (cablePositions.includes(i + 1)) {
            // Podświetl wybrane otwory bardziej wyraźnie
            ctx.fillStyle = '#4f46e5';
            ctx.strokeStyle = '#4f46e5';
            ctx.lineWidth = 3;
        } else {
            // Zmniejsz widoczność niewykorzystanych otworów
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1;
        }
        
        ctx.fill();
        ctx.stroke();
        
        // Rysuj numery dla wszystkich pozycji
        const labelRadius = radius + labelOffset;
        const labelX = centerX + labelRadius * Math.cos(angle);
        const labelY = centerY + labelRadius * Math.sin(angle);
        
        ctx.fillStyle = cablePositions.includes(i + 1) ? '#1f2937' : '#6b7280';
        ctx.font = cablePositions.includes(i + 1) ? 'bold 16px Inter' : '14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((i + 1).toString(), labelX, labelY);
    }
}

function resetCamera() {
    if (camera && controls) {
        camera.position.set(0, 0, 80);
        camera.lookAt(0, 0, 0);
        controls.reset();
    }
}

function toggleWireframe() {
    wireframe = !wireframe;
    updateVisualization();
}

async function updateBundle() {
    const formData = {
        num_holes: parseInt(document.getElementById('num_holes').value),
        num_cables: parseInt(document.getElementById('num_cables').value),
        cable_diameter: parseFloat(document.getElementById('cable_diameter').value),
        hole_diameter: parseFloat(document.getElementById('hole_diameter').value)
    };

    await fetch('/api/bundle', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });

    updateVisualization();
}

// Initialize on page load
window.addEventListener('load', init);
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth * 0.66 / 600;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth * 0.66, 600);
    }
});

// Make functions available globally
window.resetCamera = resetCamera;
window.toggleWireframe = toggleWireframe;
window.updateBundle = updateBundle;