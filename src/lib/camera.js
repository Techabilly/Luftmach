import * as THREE from 'three';

export function fitCameraToObject(camera, controls, object, size, fitOffset = 1.2) {
  if (!camera || !object) return;
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const boxSize = box.getSize(new THREE.Vector3());
  const aspect = size.width / size.height;

  if (camera.isPerspectiveCamera) {
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const fitHeightDistance = boxSize.y / (2 * Math.tan(fov / 2));
    const fitWidthDistance = boxSize.x / (2 * Math.tan(fov / 2)) / aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);
    const direction = camera.position
      .clone()
      .sub(controls?.target || new THREE.Vector3())
      .normalize();
    camera.aspect = aspect;
    camera.position.copy(center.clone().add(direction.multiplyScalar(distance)));
    camera.near = distance / 100;
    camera.far = distance * 100;
  } else if (camera.isOrthographicCamera) {
    const halfWidth = (boxSize.x / 2) * fitOffset;
    const halfHeight = (boxSize.y / 2) * fitOffset;
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.near = -boxSize.z * fitOffset;
    camera.far = boxSize.z * fitOffset;
    const direction = camera.position
      .clone()
      .sub(controls?.target || new THREE.Vector3())
      .normalize();
    const distance = boxSize.z * fitOffset;
    camera.position.copy(center.clone().add(direction.multiplyScalar(distance)));
  }

  camera.updateProjectionMatrix();
  if (controls) {
    controls.target.copy(center);
    controls.update();
  }
}
