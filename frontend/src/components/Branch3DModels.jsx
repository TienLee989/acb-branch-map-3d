// Branch3DModels.jsx
import { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { parseWKTPolygon, getPolygonCentroid } from '../utils/wkt';

export default function Branch3DModels(map, branchs) {
  if (!map || !branchs || branchs.length === 0) return;

  const modelPositions = branchs
    .map(branch => {
      if (!branch.geom.includes('POLYGON')) return null;
      const coords = getPolygonCentroid(parseWKTPolygon(branch.geom));
      return coords ? { id: branch.id, lng: coords[0], lat: coords[1] } : null;
    })
    .filter(Boolean);

  let scene, camera, renderer;

  scene = new THREE.Scene();
  camera = new THREE.Camera();

  renderer = new THREE.WebGLRenderer({
    canvas: map.getCanvas(),
    context: map.painter.context.gl,
    antialias: true,
  });
  renderer.autoClear = false;

  const loader = new GLTFLoader();

  loader.load('/models/building.glb', gltf => {
    modelPositions.forEach(pos => {
      const model = gltf.scene.clone();
      model.scale.set(10, 10, 10);
      model.rotation.x = Math.PI / 2;

      const coord = map.project([pos.lng, pos.lat]);
      model.position.set(coord.x, coord.y, 0);

      scene.add(model);
    });
  });

  const customLayer = {
    id: 'glb-models',
    type: 'custom',
    renderingMode: '3d',
    onAdd: () => {},
    render: function (gl, matrix) {
      const m = new THREE.Matrix4().fromArray(matrix);
      camera.projectionMatrix = m;
      renderer.state.reset();
      renderer.render(scene, camera);
      map.triggerRepaint();
    },
  };

  map.addLayer(customLayer);
}
