let scene, camera, renderer, controls;
let wireframe = false;
let cableGroup;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / 500, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth / 2, 500);
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
    camera.position.z = 50;

    // Add OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Create cable group
    cableGroup = new THREE.Group();
    scene.add(cableGroup);

    // Animation loop
    animate();

    // Initial render
    updateVisualization();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
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
    const radius = 20;
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
}

function resetCamera() {
    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);
    controls.reset();
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
    camera.aspect = window.innerWidth / 2 / 500;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / 2, 500);
});