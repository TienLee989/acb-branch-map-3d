// import React, { useEffect, useRef } from 'react';
// import maplibregl from 'maplibre-gl';
// import { useBranchData } from '../hooks/useBranchData';
// import { parseWKTPoint, parseWKTPolygon, getPolygonCentroid } from '../utils/wkt';
// import 'maplibre-gl/dist/maplibre-gl.css';
// import '../styles/BranchMap.css';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// const path = "/images/";
// const bankLogos = {
//     'ACB': path + 'acb.png',
//     'VietinBank': path + 'vietinbank.png',
//     'Techcombank': path + 'techcombank.png',
//     'Sacombank': path + 'sacombank.png',
//     'DongA': path + 'donga.png',
//     'HSBC': path + 'hsbc.png',
//     'MB Bank': path + 'mbbank.png',
//     'VIB': path + 'vib.png',
//     'Default': path + 'icon.avif'
// };

// function BranchMap() {
//     const mapRef = useRef(null);
//     const containerRef = useRef(null);
//     const { branchs, loading, selectedBranch } = useBranchData();

//     useEffect(() => {
//         if (loading || !containerRef.current) return;

//         const map = new maplibregl.Map({
//             container: containerRef.current,
//             style: {
//                 version: 8,
//                 sources: {
//                     'osm-tiles': {
//                         type: 'raster',
//                         tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
//                         tileSize: 256,
//                         attribution: '&copy; OpenStreetMap contributors',
//                     },
//                 },
//                 layers: [
//                     {
//                         id: 'osm-tiles',
//                         type: 'raster',
//                         source: 'osm-tiles',
//                     },
//                 ],
//             },
//             center: [106.7009, 10.7769],
//             zoom: 15,
//             pitch: 60,
//             bearing: -30,
//             antialias: true,
//         });

//         map.on('load', () => {
//             const features = branchs.map(branch => {
//                 let coords = null;
//                 if (branch.geom?.includes('POINT')) {
//                     coords = parseWKTPoint(branch.geom);
//                 } else if (branch.geom?.includes('POLYGON')) {
//                     const polygon = parseWKTPolygon(branch.geom);
//                     coords = getPolygonCentroid(polygon);
//                 }
//                 if (!coords || !branch.id) return null;

//                 return {
//                     type: 'Feature',
//                     id: branch.id,
//                     geometry: {
//                         type: 'Point',
//                         coordinates: coords,
//                     },
//                     properties: {
//                         id: branch.id,
//                         name: branch.name,
//                         operator: branch.operator,
//                         address: branch.address,
//                         phone: branch.phone,
//                         image: branch.image,
//                         icon: branch.icon,
//                         height: 80,
//                     },
//                 };
//             }).filter(Boolean);

//             // Tạo khối 3D từ điểm
//             const cylinderFeatures = features.map(f => ({
//                 type: 'Feature',
//                 id: f.id, // ✅ Feature-level ID
//                 geometry: {
//                     type: 'Polygon',
//                     coordinates: [[
//                         [f.geometry.coordinates[0] - 0.00005, f.geometry.coordinates[1] - 0.00005],
//                         [f.geometry.coordinates[0] + 0.00005, f.geometry.coordinates[1] - 0.00005],
//                         [f.geometry.coordinates[0] + 0.00005, f.geometry.coordinates[1] + 0.00005],
//                         [f.geometry.coordinates[0] - 0.00005, f.geometry.coordinates[1] + 0.00005],
//                         [f.geometry.coordinates[0] - 0.00005, f.geometry.coordinates[1] - 0.00005],
//                     ]],
//                 },
//                 properties: f.properties,
//             }));

//             map.addSource('branch-cylinders', {
//                 type: 'geojson',
//                 data: {
//                     type: 'FeatureCollection',
//                     features: cylinderFeatures,
//                 },
//             });
//             map.addLayer({
//                 id: 'branch-extrude',
//                 type: 'fill-extrusion',
//                 source: 'branch-cylinders',
//                 paint: {
//                     'fill-extrusion-color': [
//                         'case',
//                         ['boolean', ['feature-state', 'highlight'], false],
//                         '#32CD32', // màu xanh lá khi highlight
//                         '#1E90FF'  // mặc định
//                     ],
//                     'fill-extrusion-height': ['get', 'height'],
//                     'fill-extrusion-base': 0,
//                     'fill-extrusion-opacity': 0.9,
//                 },
//                 data: {
//                     type: 'FeatureCollection',
//                     features: [],
//                 },
//             });

//             // Hiển thị popup khi click khối 3D
//             map.on('click', 'branch-extrude', e => {
//                 const feature = e.features[0];
//                 const props = feature.properties;

//                 const polygon = feature.geometry.coordinates[0];
//                 const centroid = polygon.reduce(
//                     (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
//                     [0, 0]
//                 ).map(val => val / polygon.length);

//                 const logo = props.icon || (bankLogos[props.operator] || bankLogos['Default']);

//                 new maplibregl.Popup()
//                     .setLngLat(centroid)
//                     .setHTML(`
//                         <div style="max-width:220px">
//                             <strong>${props.name}</strong><br/>
//                             📍 ${props.address}<br/>
//                             ☎️ ${props.phone || 'Không có số'}<br/>
//                             <img src="${props.image || logo}" alt="branch" width="200" style="margin-top:6px; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.3);" />
//                         </div>
//                     `)
//                     .addTo(map);
//             });

//             mapRef.current = map;
//         });

//         return () => mapRef.current?.remove();
//     }, [loading]);

//     // Highlight khối khi selectedBranch thay đổi
//     useEffect(() => {
//         if (!mapRef.current || !selectedBranch || !selectedBranch.id) return;

//         let coords = null;
//         if (selectedBranch.geom?.includes('POINT')) {
//             coords = parseWKTPoint(selectedBranch.geom);
//         } else if (selectedBranch.geom?.includes('POLYGON')) {
//             const polygon = parseWKTPolygon(selectedBranch.geom);
//             coords = getPolygonCentroid(polygon);
//         }

//         if (!coords) return;

//         const map = mapRef.current;

//         // Fly đến chi nhánh
//         map.flyTo({ center: coords, zoom: 17.5 });

//         // Reset feature-state highlight
//         // branchs.forEach(branch => {
//         //     if (!branch.id) return;
//         //     map.setFeatureState(
//         //         { source: 'branch-cylinders', id: branch.id },
//         //         { highlight: branch.id === selectedBranch.id }
//         //     );
//         // });
//     }, [selectedBranch]);

//     return <div className="branch-map" ref={containerRef} />;
// }

// export default BranchMap;



//----------------------------------------------------------------------
// import React, { useEffect, useRef } from 'react';
// import maplibregl, { MercatorCoordinate } from 'maplibre-gl';
// import { useBranchData } from '../hooks/useBranchData';
// import { parseWKTPolygon, getPolygonCentroid } from '../utils/wkt';
// import 'maplibre-gl/dist/maplibre-gl.css';
// import '../styles/BranchMap.css';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// function BranchMap() {
//   const mapRef = useRef(null);
//   const containerRef = useRef(null);
//   const matrixRef = useRef(new THREE.Matrix4()); // Lưu ma trận từ render
//   const { branchs, loading, selectedBranch } = useBranchData();

//   useEffect(() => {
//     if (loading || !containerRef.current) return;

//     const map = new maplibregl.Map({
//       container: containerRef.current,
//       style: {
//         version: 8,
//         sources: {
//           'osm-tiles': {
//             type: 'raster',
//             tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
//             tileSize: 256,
//             attribution: '© OpenStreetMap contributors',
//           },
//         },
//         layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm-tiles' }],
//       },
//       center: [106.7009, 10.7769],
//       zoom: 15,
//       pitch: 60,
//       bearing: -30,
//       antialias: true,
//     });

//     map.on('load', () => {
//       mapRef.current = map;

//       const scene = new THREE.Scene();
//       const ambient = new THREE.AmbientLight(0xffffff, 1.2);
//       const directional = new THREE.DirectionalLight(0xffffff, 1);
//       directional.position.set(0, -70, 100).normalize();
//       scene.add(ambient);
//       scene.add(directional);

//       const camera = new THREE.PerspectiveCamera(
//         28,
//         map.getCanvas().width / map.getCanvas().height,
//         0.1,
//         1000
//       );

//       const renderer = new THREE.WebGLRenderer({
//         canvas: map.getCanvas(),
//         context: map.painter.context.gl,
//         antialias: true,
//       });
//       renderer.autoClear = false;

//       let isModelLoaded = false;
//       const loader = new GLTFLoader();

//       const modelPositions = branchs
//         .map(branch => {
//           if (!branch.geom?.includes('POLYGON')) return null;
//           const coords = getPolygonCentroid(parseWKTPolygon(branch.geom));
//           return coords ? { ...branch, coords } : null;
//         })
//         .filter(Boolean);
//       console.log('📍 Model positions:', modelPositions);

//       loader.load(
//         '/models/building.glb',
//         gltf => {
//           console.log('✅ GLB loaded:', gltf);
//           isModelLoaded = true;
//           modelPositions.forEach(branch => {
//             const merc = MercatorCoordinate.fromLngLat(
//               { lng: branch.coords[0], lat: branch.coords[1] },
//               0
//             );
//             console.log('🌍 Mercator coords:', merc.x, merc.y, merc.z);

//             const scale = merc.meterInMercatorCoordinateUnits();
//             const model = gltf.scene.clone(true);

//             model.scale.set(scale, scale, scale);
//             model.rotation.x = Math.PI / 2;
//             model.updateMatrix();

//             const transform = new THREE.Matrix4().makeTranslation(merc.x, merc.y, merc.z);
//             model.applyMatrix4(transform);
//             model.matrixAutoUpdate = false;

//             model.traverse(child => {
//               if (child.isMesh) {
//                 child.userData = branch;
//                 child.visible = true;
//                 child.frustumCulled = false;
//                 child.geometry.computeBoundingBox();
//                 console.log('🔍 Added mesh:', child.userData.name);
//               }
//             });

//             model.updateMatrixWorld(true);
//             scene.add(model);
//             console.log('🛠️ Scene children count:', scene.children.length);
//           });
//           map.triggerRepaint(); // Kích hoạt lại render sau khi tải mô hình
//         },
//         undefined,
//         error => {
//           console.error('❌ Lỗi tải GLB:', error);
//         }
//       );

//       map.addLayer({
//         id: 'branch-3d-models',
//         type: 'custom',
//         renderingMode: '3d',
//         onAdd: () => {},
//         render: (gl, matrix) => {
//           const m = new THREE.Matrix4().fromArray(matrix);
//           matrixRef.current.copy(m); // Lưu ma trận
//           camera.projectionMatrix = m;
//           camera.projectionMatrixInverse = m.clone().invert();
//           renderer.state.reset();
//           renderer.render(scene, camera); // Render mô hình 3D
//           map.triggerRepaint();
//         },
//       });

//       map.getCanvas().addEventListener('click', e => {
//         if (!isModelLoaded) {
//             console.log('⏳ Chưa tải xong mô hình');
//             return;
//         }

//         // Chuyển đổi tọa độ chuột sang tọa độ bản đồ
//         const rect = map.getCanvas().getBoundingClientRect();
//         const x = e.clientX - rect.left;
//         const y = e.clientY - rect.top;
//         const mapPoint = map.unproject([x, y]); // Chuyển tọa độ pixel sang lng/lat

//         // Chuyển đổi lng/lat sang tọa độ Mercator
//         const merc = MercatorCoordinate.fromLngLat(
//             { lng: mapPoint.lng, lat: mapPoint.lat },
//             0
//         );
//         console.log('🌍 Clicked Mercator coords:', merc.x, merc.y, merc.z);

//         // Tính toán thủ công ray từ camera đến điểm click
//         const raycaster = new THREE.Raycaster();
//         raycaster.params.Mesh.threshold = 0.1;

//         const cameraPosition = new THREE.Vector3(merc.x, merc.y, 100); // Đặt Z cao hơn
//         const clickPosition = new THREE.Vector3(merc.x, merc.y, 0); // Điểm click ở mặt phẳng Z=0
//         const direction = new THREE.Vector3().subVectors(clickPosition, cameraPosition).normalize();

//         raycaster.set(cameraPosition, direction);

//         const objectsToCheck = [];
//         scene.traverse(obj => {
//             if (obj.isMesh) objectsToCheck.push(obj);
//         });
//         console.log('🔎 Objects to check:', objectsToCheck.length);

//         const intersects = raycaster.intersectObjects(objectsToCheck, true);
//         console.log('🎯 Intersects:', intersects.map(i => i?.object?.userData?.name || 'None'));

//         if (intersects.length > 0) {
//             const obj = intersects[0].object;
//             const data = obj.userData || obj.parent?.userData;
//             console.log('📌 Selected data:', data);

//             if (data && data.coords && Array.isArray(data.coords) && data.coords.length === 2) {
//             console.log('📍 Popup coords:', data.coords);
//             const popup = new maplibregl.Popup({ offset: 25 })
//                 .setLngLat(data.coords)
//                 .setHTML(`
//                 <div class="custom-popup">
//                     <h3>${data.name?.replace(/[^\w\s]/g, '') || 'Không có tên'}</h3>
//                     <p>📍 ${data.address || 'Không có địa chỉ'}</p>
//                     <p>☎️ ${data.phone ? data.phone : 'Không có số'}</p>
//                     ${data.image ? `<img src="${data.image}" alt="branch" />` : ''}
//                 </div>
//                 `)
//                 .addTo(map);
//             console.log('🔔 Popup added:', popup._id);

//             // Đảm bảo bản đồ sẵn sàng và popup hiển thị
//             if (map.loaded()) {
//                 popup.addTo(map); // Thêm lại để đảm bảo
//                 console.log('🗺️ Map ready, popup re-added');
//                 // Di chuyển bản đồ để đảm bảo tọa độ nằm trong tầm nhìn
//                 map.flyTo({
//                 center: data.coords,
//                 zoom: map.getZoom(),
//                 essential: true,
//                 });
//                 console.log('🗺️ Map moved to:', data.coords);
//             } else {
//                 console.log('⚠️ Map not ready');
//                 // Thêm popup khi bản đồ sẵn sàng
//                 map.on('load', () => {
//                 popup.addTo(map);
//                 console.log('🗺️ Map loaded, popup added');
//                 });
//             }
//             } else {
//             console.log('⚠️ Dữ liệu coords không hợp lệ:', data.coords);
//             }
//         } else {
//             console.log('❌ Không tìm thấy giao điểm');
//         }
//         });
//     });

//     return () => mapRef.current?.remove();
//   }, [loading]);

//   useEffect(() => {
//     if (!mapRef.current || !selectedBranch || !selectedBranch.id) return;

//     let coords = null;
//     if (selectedBranch.geom?.includes('POLYGON')) {
//       const polygon = parseWKTPolygon(selectedBranch.geom);
//       coords = getPolygonCentroid(polygon);
//     }

//     if (!coords) return;
//     mapRef.current.flyTo({ center: coords, zoom: 17 });
//   }, [selectedBranch]);

//   return <div className="branch-map" ref={containerRef} />;
// }

// export default BranchMap;

// BranchMap.jsx

import React, { useEffect, useRef } from 'react';
import maplibregl, { MercatorCoordinate } from 'maplibre-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/BranchMap.css';
import { parseWKTPolygon, getPolygonCentroid } from '../utils/wkt';

function BranchMap({ branchs, loading, selectedBranch }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (loading || !containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm-tiles' }],
      },
      center: [106.7, 10.78],
      zoom: 15,
      pitch: 70,
      bearing: -20,
      antialias: true,
    });

    mapRef.current = map;

    map.on('load', () => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        28,
        map.getCanvas().width / map.getCanvas().height,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: map.painter.context.gl,
        antialias: true,
      });
      renderer.autoClear = false;

      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;

      scene.add(new THREE.AmbientLight(0xffffff, 1));
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(0, -70, 100).normalize();
      scene.add(light);

      const loader = new GLTFLoader();

      const buildingsWithCoords = branchs.flatMap(branch =>
        (branch.buildings || []).map(building => {
          if (!building.footprint?.includes('POLYGON')) return null;
          const coords = getPolygonCentroid(parseWKTPolygon(building.footprint));
          return coords ? { ...building, coords } : null;
        }).filter(Boolean)
      );

      loader.load(
        '/models/building.glb',
        gltf => {
          buildingsWithCoords.forEach(building => {
            const merc = MercatorCoordinate.fromLngLat(
              { lng: building.coords[0], lat: building.coords[1] },
              0
            );
            const scale = merc.meterInMercatorCoordinateUnits();
            const model = gltf.scene.clone(true);

            model.scale.set(scale, scale, scale);
            model.rotation.x = Math.PI / 2;
            model.position.set(merc.x, merc.y, merc.z);
            model.updateMatrixWorld(true);

            model.traverse(child => {
              if (child.isMesh) {
                child.userData = building;
                child.frustumCulled = false;
              }
            });

            scene.add(model);
          });

          map.addLayer({
            id: 'branch-3d-models',
            type: 'custom',
            renderingMode: '3d',
            render: (gl, matrix) => {
              const m = new THREE.Matrix4().fromArray(matrix);
              camera.projectionMatrix = m;
              renderer.state.reset();
              renderer.render(scene, camera);
              map.triggerRepaint();
            },
          });
        },
        undefined,
        err => {
          console.error('Lỗi tải GLB:', err);
        }
      );
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [loading, branchs]);

  useEffect(() => {
    if (!mapRef.current || !selectedBranch) return;

    const firstBuilding = selectedBranch.buildings?.find(b => b.footprint?.includes('POLYGON'));
    if (!firstBuilding) return;

    const polygon = parseWKTPolygon(firstBuilding.footprint);
    const coords = getPolygonCentroid(polygon);

    if (coords) {
      mapRef.current.flyTo({ center: coords, zoom: 17 });
    }
  }, [selectedBranch]);

  return (
    <div
      className="branch-map w-full"
      ref={containerRef}
      style={{ height: '37em' }}
    />
  );
}

export default BranchMap;
