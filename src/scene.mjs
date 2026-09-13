import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import polygonClipping from 'polygon-clipping';
import land from './land.json';

const FRONT = [
  [2.75, 51.13], [2.88, 50.85], [2.88, 50.68], [2.82, 50.3],
  [2.72, 50.03], [3.05, 49.62], [3.3, 49.45], [4.05, 49.34],
  [4.8, 49.29], [5.35, 49.27], [5.62, 48.89], [6.05, 48.91],
  [6.45, 48.69], [7.05, 48.3], [7.13, 47.85], [7.17, 47.5]
];

const PLACES = [
  { id: 'marne', name: 'Marne', coords: [3.65, 49.02], chapter: 'marne' },
  { id: 'somme', name: 'Somme', coords: [2.72, 50.02], chapter: 'somme' },
  { id: 'verdun', name: 'Verdun', coords: [5.38, 49.16], chapter: 'verdun' },
  { id: 'amiens', name: 'Amiens', coords: [2.3, 49.89], chapter: 'turning-point' },
  { id: 'compiegne', name: 'Compi\u00e8gne', coords: [2.9, 49.42], chapter: 'armistice' }
];

const project = ([longitude, latitude], height = 0.6) => new THREE.Vector3(
  (longitude - 3.7) * 2.5, height, -(latitude - 49.35) * 3.9
);

function distanceToSegment(horizontal, vertical, start, end) {
  const deltaX = end[0] - start[0];
  const deltaZ = end[1] - start[1];
  const progress = THREE.MathUtils.clamp(
    ((horizontal - start[0]) * deltaX + (vertical - start[1]) * deltaZ) / (deltaX ** 2 + deltaZ ** 2), 0, 1
  );
  return Math.hypot(horizontal - start[0] - progress * deltaX, vertical - start[1] - progress * deltaZ);
}

export class ExhibitScene {
  constructor(host, labelLayer, callbacks) {
    this.host = host;
    this.labelLayer = labelLayer;
    this.callbacks = callbacks;
    this.labels = [];
    this.mode = 'map';
    this.focus = 'marne';
    this.motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.theme = getComputedStyle(document.documentElement);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.domElement.setAttribute('aria-label', 'Dreidimensionale Westfront-Karte');
    this.renderer.domElement.tabIndex = 0;
    host.append(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-20, 20, 12, -12, 0.1, 150);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.minPolarAngle = 0.02;
    this.controls.maxPolarAngle = 1.18;
    this.controls.autoRotateSpeed = 0.32;
    this.controls.addEventListener('start', () => { this.controls.autoRotate = false; });
    this.scene.add(new THREE.AmbientLight(undefined, 1.9));
    const sunlight = new THREE.DirectionalLight(undefined, 3.3);
    sunlight.position.set(-12, 28, 8);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(1024, 1024);
    Object.assign(sunlight.shadow.camera, { left: -25, right: 25, top: 22, bottom: -22, near: 1, far: 75 });
    sunlight.shadow.bias = -0.0007;
    sunlight.shadow.normalBias = 0.04;
    this.scene.add(sunlight);
    const grid = new THREE.GridHelper(100, 50, this.color('--cp-border'), this.color('--cp-border'));
    grid.position.y = -1.55;
    grid.material.transparent = true;
    grid.material.opacity = 0.24;
    grid.material.userData.token = '--cp-border';
    this.scene.add(grid);
    this.map = new THREE.Group();
    this.trenches = new THREE.Group();
    this.scene.add(this.map, this.trenches);
    this.buildMap();
    this.buildTrenches();
    this.setMode('map');
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.renderer.domElement.addEventListener('keydown', event => {
      if (event.key === '+' || event.key === '=') this.zoom(1.15);
      else if (event.key === '-') this.zoom(1 / 1.15);
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const offset = this.camera.position.clone().sub(this.controls.target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), event.key === 'ArrowLeft' ? 0.15 : -0.15);
        this.camera.position.copy(this.controls.target).add(offset);
      } else return;
      event.preventDefault();
    });
    this.renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      this.contextLost = true;
      this.host.dataset.ready = 'false';
      this.callbacks.onError();
    });
    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      this.contextLost = false;
      this.callbacks.onRestore();
    });
    this.resize();
    this.animate(0);
  }

  color(token) {
    return new THREE.Color(this.theme.getPropertyValue(token).trim());
  }

  material(token, options = {}) {
    const material = new THREE.MeshStandardMaterial({ color: this.color(token), roughness: 0.9, ...options });
    material.userData.token = token;
    return material;
  }

  lineMaterial(token, opacity = 1) {
    const material = new THREE.LineBasicMaterial({ color: this.color(token), transparent: opacity < 1, opacity });
    material.userData.token = token;
    return material;
  }

  box(parent, size, position, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  addLabel(name, point, mode, options = {}) {
    const element = document.createElement(options.action ? 'button' : 'span');
    element.className = `spatial-label ${options.kind || 'place-label'}`;
    element.textContent = name;
    if (options.action) {
      element.type = 'button';
      element.setAttribute('aria-label', options.ariaLabel || name);
      element.addEventListener('click', options.action);
    }
    element.dataset.point = options.id || '';
    this.labelLayer.append(element);
    this.labels.push({ element, point, mode, ...options });
  }

  buildMap() {
    const bounds = [[[-1.3, 46.65], [8.9, 46.65], [8.9, 52.05], [-1.3, 52.05], [-1.3, 46.65]]];
    const topMaterial = this.material('--cp-surface');
    const sideMaterial = this.material('--cp-border');
    for (const feature of land.features) {
      const polygons = polygonClipping.intersection(feature.geometry.coordinates, bounds);
      for (const polygon of polygons) {
        const rings = polygon.map(ring => ring.map(coords => {
          const point = project(coords);
          return new THREE.Vector2(point.x, -point.z);
        }));
        const shape = new THREE.Shape(rings[0]);
        for (const hole of rings.slice(1)) shape.holes.push(new THREE.Path(hole));
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.45, bevelEnabled: false });
        geometry.rotateX(-Math.PI / 2);
        const mesh = new THREE.Mesh(geometry, [topMaterial, sideMaterial]);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        this.map.add(mesh);
        const outline = new THREE.Line(new THREE.BufferGeometry().setFromPoints(
          polygon[0].map(coords => project(coords, 0.46))
        ), this.lineMaterial('--cp-border-strong', 0.55));
        this.map.add(outline);
      }
    }
    const water = new THREE.Mesh(new THREE.PlaneGeometry(64, 55), this.material('--cp-link', { transparent: true, opacity: 0.035 }));
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.04;
    this.map.add(water);
    const frontCurve = new THREE.CatmullRomCurve3(FRONT.map(coords => project(coords, 0.55)));
    this.map.add(new THREE.Mesh(new THREE.TubeGeometry(frontCurve, 180, 0.065, 6, false), this.material('--cp-accent')));
    this.map.add(new THREE.Mesh(new THREE.TubeGeometry(frontCurve, 180, 0.2, 6, false), this.material('--cp-accent', { transparent: true, opacity: 0.075, depthWrite: false })));
    const regionNames = [
      ['FRANCE', [1.4, 48.6]], ['BELGIQUE', [4.6, 50.9]],
      ['DEUTSCHES REICH', [7.1, 50.2]], ['SCHWEIZ', [7.25, 47.05]],
      ['NORDSEE', [1.25, 51.75]]
    ];
    for (const [name, coords] of regionNames) this.addLabel(name, project(coords), 'map', { kind: 'region-label', priority: 10 });
    this.addLabel('Paris', project([2.35, 48.86]), 'map', { kind: 'city-label', priority: 30 });
    for (const place of PLACES) {
      const point = project(place.coords, 0.6);
      const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.045, 16), this.material('--cp-text'));
      dot.position.copy(point);
      this.map.add(dot);
      this.addLabel(place.name, point.clone().add(new THREE.Vector3(0, 0.75, 0)), 'map', {
        id: place.id, priority: 50, ariaLabel: `Kapitel ${place.name} \u00f6ffnen`,
        action: () => this.callbacks.onChapter(place.chapter)
      });
    }
    this.focusMarker = new THREE.Group();
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.8, 8), this.material('--cp-accent'));
    pin.position.y = 0.9;
    this.focusMarker.add(pin);
    this.box(this.focusMarker, [0.62, 0.36, 0.025], [0.3, 1.65, 0], this.material('--cp-accent'));
    this.focusRing = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.025, 6, 48), this.material('--cp-accent'));
    this.focusRing.rotation.x = -Math.PI / 2;
    this.focusMarker.add(this.focusRing);
    this.map.add(this.focusMarker);
  }

  buildTrenches() {
    const paths = [];
    for (const side of [-1, 1]) {
      for (const depth of [3.35, 6.3, 9.05]) {
        const points = [];
        for (let segment = 0; segment <= 16; segment++) {
          points.push([-11.5 + segment * 1.44, side * depth + (segment % 4 < 2 ? 0.32 : -0.32)]);
        }
        paths.push({ points, side, front: depth === 3.35, connection: false });
      }
      for (const horizontal of [-7, 6.5]) {
        const points = [];
        for (let segment = 0; segment <= 10; segment++) {
          points.push([horizontal + (segment % 3 === 0 ? 0.3 : -0.15), side * (3.2 + segment * 0.6)]);
        }
        paths.push({ points, side, connection: true });
      }
    }
    const segments = paths.flatMap(path => path.points.slice(1).map((end, index) => [path.points[index], end]));
    const geometry = new THREE.PlaneGeometry(25.5, 21.5, 204, 172);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position;
    const craters = [[-8, 0.3, 0.95], [-3.5, -0.5, 0.7], [0.4, 0.6, 1.05], [4.8, -0.8, 0.75], [8.8, 0.5, 0.8]];
    for (let vertex = 0; vertex < positions.count; vertex++) {
      const horizontal = positions.getX(vertex);
      const vertical = positions.getZ(vertex);
      let distance = Infinity;
      for (const [start, end] of segments) distance = Math.min(distance, distanceToSegment(horizontal, vertical, start, end));
      let height = 0.72 + Math.sin(horizontal * 3.7) * Math.cos(vertical * 4.1) * 0.025;
      if (distance < 0.57) height = -0.47 + 1.19 * THREE.MathUtils.smoothstep(distance, 0.28, 0.57);
      for (const [centerX, centerZ, radius] of craters) {
        height -= 0.34 * Math.exp(-((horizontal - centerX) ** 2 + (vertical - centerZ) ** 2) / (radius ** 2 * 0.4));
      }
      positions.setY(vertex, height);
    }
    geometry.computeVertexNormals();
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(positions.count * 3), 3));
    this.terrainGeometry = geometry;
    this.tintTerrain();
    const terrain = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    this.trenches.add(terrain);
    this.box(this.trenches, [25.5, 0.8, 21.5], [0, -0.9, 0], this.material('--cp-border-strong'));
    const bagPlacements = [];
    const stakePlacements = [];
    for (const path of paths) {
      const routePoints = path.points.map(([horizontal, vertical]) => new THREE.Vector3(horizontal, -0.34, vertical));
      const route = new THREE.Line(new THREE.BufferGeometry().setFromPoints(routePoints), this.lineMaterial(path.side > 0 ? '--cp-link' : '--cp-accent', 0.9));
      this.trenches.add(route);
      if (path.connection) continue;
      for (let segment = 1; segment < path.points.length; segment++) {
        const start = path.points[segment - 1];
        const end = path.points[segment];
        const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
        for (let fraction = 0; fraction < 1; fraction += 0.34) {
          const horizontal = THREE.MathUtils.lerp(start[0], end[0], fraction);
          const vertical = THREE.MathUtils.lerp(start[1], end[1], fraction);
          for (const edge of [-1, 1]) {
            bagPlacements.push([horizontal - Math.sin(angle) * edge * 0.62, 0.83, vertical + Math.cos(angle) * edge * 0.62, angle]);
            if (fraction === 0) stakePlacements.push([horizontal - Math.sin(angle) * edge * 0.43, 0.07, vertical + Math.cos(angle) * edge * 0.43]);
          }
        }
      }
    }
    const dummy = new THREE.Object3D();
    const bagGeometry = new THREE.CapsuleGeometry(0.13, 0.26, 3, 6);
    bagGeometry.rotateZ(Math.PI / 2);
    const bags = new THREE.InstancedMesh(bagGeometry, this.material('--cp-bg-elevated'), bagPlacements.length);
    bagPlacements.forEach(([horizontal, height, vertical, angle], index) => {
      dummy.position.set(horizontal, height, vertical);
      dummy.rotation.set(0, -angle, 0);
      dummy.updateMatrix();
      bags.setMatrixAt(index, dummy.matrix);
    });
    bags.castShadow = true;
    this.trenches.add(bags);
    const stakes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.075, 1.02, 0.075), this.material('--cp-text-muted'), stakePlacements.length);
    stakePlacements.forEach((position, index) => {
      dummy.position.set(...position);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      stakes.setMatrixAt(index, dummy.matrix);
    });
    this.trenches.add(stakes);
    for (const side of [-1, 1]) {
      for (let horizontal = -11; horizontal <= 11; horizontal += 1.05) {
        this.box(this.trenches, [0.055, 0.58, 0.055], [horizontal, 0.98, side * 2.1], this.material('--cp-text-soft'));
      }
      const wirePoints = [];
      for (let point = 0; point <= 620; point++) {
        wirePoints.push(new THREE.Vector3(-11 + point / 620 * 22, 1.04 + Math.sin(point * 0.52) * 0.16, side * 2.1 + Math.cos(point * 0.52) * 0.16));
      }
      this.trenches.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(wirePoints), this.lineMaterial('--cp-text-muted', 0.75)));
    }
    const roof = this.material('--cp-text-muted');
    const timber = this.material('--cp-border-strong');
    this.box(this.trenches, [2.05, 0.26, 1.5], [7.8, 0.8, 7.15], roof);
    this.box(this.trenches, [1.35, 0.65, 0.07], [7.8, 0.25, 6.4], this.material('--cp-text'));
    this.box(this.trenches, [0.14, 0.86, 0.16], [7.05, 0.24, 6.4], timber);
    this.box(this.trenches, [0.14, 0.86, 0.16], [8.55, 0.24, 6.4], timber);
    this.addLabel('DEUTSCHE STELLUNGEN', new THREE.Vector3(0, 0.9, -10.1), 'trenches', { kind: 'region-label german-label', priority: 15 });
    this.addLabel('FRANZ\u00d6SISCHE STELLUNGEN', new THREE.Vector3(0, 0.9, 10.2), 'trenches', { kind: 'region-label french-label', priority: 15 });
    const features = [
      ['front', '01  Vorderer Graben', [-6, 1.05, 3.2]],
      ['no-mans-land', '02  Niemandsland', [0, 1.05, 0]],
      ['communication', '03  Verbindungsgraben', [-7, 1.05, -6.1]],
      ['shelter', '04  Unterstand', [7.8, 1.15, 7.15]]
    ];
    for (const [id, name, position] of features) {
      this.addLabel(name, new THREE.Vector3(...position), 'trenches', {
        id, kind: 'feature-label', priority: 50,
        action: () => this.callbacks.onFeature(id)
      });
    }
  }

  tintTerrain() {
    const positions = this.terrainGeometry.attributes.position;
    const colors = this.terrainGeometry.attributes.color;
    const top = this.color('--cp-surface-soft');
    const wall = this.color('--cp-border-strong');
    const floor = this.color('--cp-text-muted');
    const tint = new THREE.Color();
    for (let vertex = 0; vertex < positions.count; vertex++) {
      const height = positions.getY(vertex);
      if (height < 0) tint.copy(floor).lerp(wall, THREE.MathUtils.clamp(height + 0.5, 0, 1));
      else tint.copy(wall).lerp(top, THREE.MathUtils.smoothstep(height, 0.1, 0.7));
      colors.setXYZ(vertex, tint.r, tint.g, tint.b);
    }
    colors.needsUpdate = true;
  }

  setTheme() {
    this.theme = getComputedStyle(document.documentElement);
    this.needsRender = true;
    this.scene.traverse(object => {
      for (const material of [object.material].flat().filter(Boolean)) {
        if (material.userData.token) material.color.copy(this.color(material.userData.token));
      }
    });
    this.tintTerrain();
  }

  setChapter(chapter) {
    this.focus = chapter.focus;
    this.setMode(chapter.scene);
    const place = PLACES.find(item => item.id === this.focus);
    this.focusMarker.visible = Boolean(place);
    if (place) this.focusMarker.position.copy(project(place.coords, 0.62));
    for (const label of this.labels) label.element.dataset.active = String(label.id === this.focus);
  }

  setMode(mode) {
    this.mode = mode;
    this.host.dataset.ready = 'false';
    this.renderer.shadowMap.needsUpdate = true;
    this.host.dataset.mode = mode;
    this.map.visible = mode === 'map';
    this.trenches.visible = mode === 'trenches';
    this.renderer.domElement.setAttribute('aria-label', mode === 'map' ? 'Dreidimensionale Westfront-Karte' : 'Dreidimensionales Grabensystem mit sechs gestaffelten Linien');
    this.resetCamera();
    this.resize();
  }

  resetCamera() {
    this.needsRender = true;
    this.controls.target.set(0.8, 0, 0.1);
    this.camera.position.set(...(this.mode === 'map' ? [0.8, 29, 16] : [19, 24, 26]));
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
    this.controls.autoRotate = this.mode === 'trenches' && this.motion;
    this.controls.update();
  }

  topView(enabled) {
    if (!enabled) return this.resetCamera();
    this.needsRender = true;
    this.camera.position.set(0.8, 36, 0.13);
    this.controls.autoRotate = false;
    this.controls.update();
  }

  zoom(factor) {
    this.needsRender = true;
    this.camera.zoom = THREE.MathUtils.clamp(this.camera.zoom * factor, 0.75, 2.1);
    this.camera.updateProjectionMatrix();
  }

  setMotion(enabled) {
    this.needsRender = true;
    this.motion = enabled;
    this.controls.autoRotate = enabled && this.mode === 'trenches';
  }

  resize() {
    this.needsRender = true;
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    const aspect = width / height;
    const viewHeight = Math.max(this.mode === 'map' ? 25 : 27, (this.mode === 'map' ? 34 : 38) / aspect);
    const verticalOffset = THREE.MathUtils.clamp((1.8 - aspect) * 3.5, 0.65, 3.2);
    this.camera.left = -viewHeight * aspect / 2;
    this.camera.right = viewHeight * aspect / 2;
    this.camera.top = viewHeight / 2 - verticalOffset;
    this.camera.bottom = -viewHeight / 2 - verticalOffset;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  layoutLabels() {
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    const hostBounds = this.host.getBoundingClientRect();
    const occupied = Array.from(this.host.parentElement.querySelectorAll('[data-scene-obstacle]')).filter(element => !element.hidden).map(element => {
      const bounds = element.getBoundingClientRect();
      return { left: bounds.left - hostBounds.left - 5, right: bounds.right - hostBounds.left + 5, top: bounds.top - hostBounds.top - 5, bottom: bounds.bottom - hostBounds.top + 5 };
    });
    const ordered = [...this.labels].sort((first, second) => ((second.id === this.focus ? 100 : second.priority) - (first.id === this.focus ? 100 : first.priority)));
    for (const label of ordered) {
      const relevant = !['amiens', 'compiegne'].includes(label.id) || label.id === this.focus;
      if (label.mode !== this.mode || !relevant) { label.element.hidden = true; continue; }
      const screen = label.point.clone().project(this.camera);
      const horizontal = (screen.x + 1) * width / 2;
      const vertical = (1 - screen.y) * height / 2;
      label.element.hidden = false;
      const halfWidth = label.element.offsetWidth / 2;
      const halfHeight = label.element.offsetHeight / 2;
      const bounds = { left: horizontal - halfWidth, right: horizontal + halfWidth, top: vertical - halfHeight, bottom: vertical + halfHeight };
      const outside = bounds.left < 12 || bounds.right > width - 12 || bounds.top < 12 || bounds.bottom > height - 12 || screen.z > 1;
      const collision = occupied.some(other => bounds.left < other.right + 4 && bounds.right > other.left - 4 && bounds.top < other.bottom + 4 && bounds.bottom > other.top - 4);
      label.element.hidden = outside || collision;
      if (!label.element.hidden) {
        label.element.style.left = `${horizontal}px`;
        label.element.style.top = `${vertical}px`;
        occupied.push(bounds);
      }
    }
  }

  animate(timestamp) {
    this.frame = requestAnimationFrame(next => this.animate(next));
    if (document.hidden || this.contextLost) return;
    if (timestamp - (this.lastRenderTime ?? -Infinity) < 1000 / 30) return;
    const viewChanged = this.controls.update();
    if (!this.motion && !viewChanged && !this.needsRender) return;
    if (this.motion && this.focus !== 'compiegne') this.focusRing.scale.setScalar(1 + Math.sin(timestamp * 0.0018) * 0.15);
    this.renderer.render(this.scene, this.camera);
    this.layoutLabels();
    this.lastRenderTime = timestamp;
    this.needsRender = false;
    this.host.dataset.ready = 'true';
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.scene.traverse(object => {
      object.geometry?.dispose();
      for (const material of [object.material].flat().filter(Boolean)) material.dispose();
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.labelLayer.replaceChildren();
  }
}