/* =========================================================
   PRUN PLAY STATION — static geometry batching
   Merges opaque meshes that share a material inside each object
   group. Object semantics (46 clickable groups) stay intact.
   ========================================================= */
(function () {
  'use strict';
  const P = window.PRUN, T = P.T;

  const SKIP_GROUPS = {
    // things whose local transforms animate every frame
    pedestrians: true, mech: true, radar: true
  };

  function mergeGroup(group) {
    group.updateWorldMatrix(true, true);
    const inv = new T.Matrix4().copy(group.matrixWorld).invert();
    const buckets = new Map();
    const originals = [];

    group.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh || o.isPoints || o.isLine || o.isSprite) return;
      if (o.userData.noMerge || o.userData.isProxy) return;
      const mat = o.material;
      if (!mat || Array.isArray(mat)) return;
      if (mat.transparent || mat.opacity < 1 || mat.colorWrite === false) return;
      if (!o.visible) return;
      const key = mat.uuid + '|' + (o.castShadow ? 1 : 0) + (o.receiveShadow ? 1 : 0);
      let b = buckets.get(key);
      if (!b) {
        b = { material: mat, cast: o.castShadow, receive: o.receiveShadow, meshes: [] };
        buckets.set(key, b);
      }
      b.meshes.push(o);
    });

    for (const b of buckets.values()) {
      if (b.meshes.length < 2) continue;
      const parts = [];
      let total = 0;
      let merge = true;
      for (const m of b.meshes) {
        let g = m.geometry.clone();
        if (g.index) g = g.toNonIndexed();
        if (!g.attributes.position) { merge = false; break; }
        const local = new T.Matrix4().copy(inv).multiply(m.matrixWorld);
        g.applyMatrix4(local);
        if (!g.attributes.normal) g.computeVertexNormals();
        if (!g.attributes.uv) {
          g.setAttribute('uv', new T.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
        }
        parts.push(g);
        total += g.attributes.position.count;
      }
      if (!merge || !parts.length) continue;

      const pos = new Float32Array(total * 3);
      const nor = new Float32Array(total * 3);
      const uv = new Float32Array(total * 2);
      let off = 0;
      for (const g of parts) {
        pos.set(g.attributes.position.array, off * 3);
        nor.set(g.attributes.normal.array, off * 3);
        uv.set(g.attributes.uv.array, off * 2);
        off += g.attributes.position.count;
      }
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      geo.setAttribute('normal', new T.BufferAttribute(nor, 3));
      geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
      geo.computeBoundingSphere();
      geo.computeBoundingBox();

      const mesh = new T.Mesh(geo, b.material);
      mesh.castShadow = b.cast;
      mesh.receiveShadow = b.receive;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      mesh.userData.merged = true;
      mesh.userData.noPick = b.meshes.every(m => m.userData.noPick);
      group.add(mesh);
      for (const m of b.meshes) originals.push(m);
    }

    for (const m of originals) if (m.parent) m.parent.remove(m);
    return originals.length;
  }

  P.mergeStaticScene = function () {
    P.scene.updateMatrixWorld(true);
    let removed = 0, groups = 0;
    for (const entry of P.registry) {
      if (!entry.group || SKIP_GROUPS[entry.id]) continue;
      removed += mergeGroup(entry.group);
      groups++;
    }
    const shell = P.scene.getObjectByName('shell');
    if (shell) { removed += mergeGroup(shell); groups++; }
    if (P.extraMergeGroups) for (const g of P.extraMergeGroups) { removed += mergeGroup(g); groups++; }
    console.log('[PRUN] merged static geometry · groups=' + groups + ' · meshes removed=' + removed);
  };
})();
