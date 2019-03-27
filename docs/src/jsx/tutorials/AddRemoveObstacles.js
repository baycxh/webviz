//  Copyright (c) 118-present, GM Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.

// #BEGIN EXAMPLE
import React, { useState } from "react";

import duckModel from "../utils/Duck.glb";
import useRequestAnimationFrame from "../utils/useRequestAnimationFrame";
import Worldview, { Cubes, Spheres, Axes, GLTFScene, DEFAULT_CAMERA_STATE } from "regl-worldview";

// #BEGIN EDITABLE
function Example() {
  const steps = 500; // total amount of objects
  const [clickedObjectIds, setClickedObjectIds] = useState([]);
  const [count, setCount] = useState(0);
  useRequestAnimationFrame(
    () => {
      // update count before each browser repaint
      const newCount = (count + 1) % steps;
      setCount(newCount);
    },
    false,
    []
  );

  // map a number/index to a specific color
  function numberToColor(number, max, a = 1) {
    const i = (number * 255) / max;
    const r = Math.round(Math.sin(0.024 * i + 0) * 127 + 128) / 255;
    const g = Math.round(Math.sin(0.024 * i + 2) * 127 + 128) / 255;
    const b = Math.round(Math.sin(0.024 * i + 4) * 127 + 128) / 255;
    return { r, g, b, a };
  }

  // the object index needs to multiple by this scale so it's evenly distributed in the space
  const scale = (Math.PI * 2) / steps;
  const sphereMarker = {
    id: 1001,
    pose: {
      orientation: { x: 0, y: 0, z: 0, w: 1 },
      position: { x: 0, y: 0, z: 0 },
    },
    scale: { x: 3, y: 3, z: 3 },
    colors: [],
    points: [],
  };

  new Array(steps)
    .fill()
    .map((_, idx) => [
      // generate x, y, z coordinates based on trefoil equation
      Math.sin(idx * scale) + 2 * Math.sin(2 * idx * scale),
      Math.cos(idx * scale) - 2 * Math.cos(2 * idx * scale),
      -Math.sin(3 * idx * scale),
    ])
    .forEach(([x, y, z], idx) => {
      // add individual point and color to the single sphere object
      sphereMarker.colors.push(numberToColor(idx, steps));
      sphereMarker.points.push({ x: x * 20, y: y * 20, z: z * 20 });
    });

  const obstacleMarkers = Array.from(clickedObjectIds).map((clickedObjectId, index) => {
    const pointIdx = clickedObjectId - sphereMarker.id;
    const position = sphereMarker.points[pointIdx];
    return {
      // Since the `sphereMarker` has used up the id range: 101 ~ 101 + 499 (inclusive, each id represent one sphere object),
      // to make the obstacleMarkers' ids unique, we'll use the range: 500 (sphereMarker.id + step) + index.
      // Learn about id mapping at https://cruise-automation.github.io/webviz/worldview/#/docs/api/mouse-events
      id: sphereMarker.id + steps + index,
      // remember the original clickedObjectId so when the obstacle is clicked, we can
      // remove the obstacle quickly by updating clickedObjectIds
      clickedObjectId,
      pose: {
        orientation: { x: 0, y: 0, z: 0, w: 1 },
        position,
      },
      color: { r: 1, g: 0, b: 0, a: 1 }, // red
      scale: { x: 6, y: 6, z: 6 }, // scale up a little so it's bigger than the spheres
    };
  });
  const duckPosition = sphereMarker.points[count];

  return (
    <Worldview
      defaultCameraState={{
        ...DEFAULT_CAMERA_STATE,
        distance: 160,
        thetaOffset: -Math.PI / 2, // rotate the camera so the duck is facing right
      }}>
      <Spheres
        onClick={(ev, { objectId }) => {
          setClickedObjectIds([...clickedObjectIds, objectId]);
        }}>
        {[sphereMarker]}
      </Spheres>
      <Cubes
        onClick={(ev, { object }) => {
          const newClickedObjectIds = clickedObjectIds.filter((id) => id !== object.clickedObjectId);
          setClickedObjectIds(newClickedObjectIds);
        }}>
        {obstacleMarkers}
      </Cubes>
      <Axes />
      {/* Download model: https://github.com/cruise-automation/webviz/blob/master/docs/src/jsx/utils/Duck.glb  */}
      <GLTFScene model={duckModel}>
        {{
          pose: {
            position: duckPosition,
            orientation: { x: 0, y: 0, z: 0, w: 1 },
          },
          scale: { x: 4, y: 4, z: 4 },
        }}
      </GLTFScene>
    </Worldview>
  );
}
// #END EXAMPLE
export default Example;
