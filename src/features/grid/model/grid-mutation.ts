import { getGridLayer } from './grid-layer';
import {
  clipGridLayer,
  getFullPoints,
  getFullPosition,
  getFullQty,
  getStepPoints,
  getStepPosition,
  getStepQty,
} from './grid.helpers';
import { GridLine } from '../ui';

export const drawFull = (id: string) => {
  const qty = getFullQty(id);
  if (!qty) return;
  const points = getFullPoints(id);
  if (!points || !points.x || !points.y) return;
  for (let i = 0; i <= qty?.x; i++) {
    const position = getFullPosition(id, i);
    if (!position?.x) return;
    const gridLayer = getGridLayer(id);
    gridLayer?.add(GridLine(position.x, points.x));
  }
  /*   for (let i = 0; i <= qty?.y; i++) {
    const position = getFullPosition(id, i);
    if (!position?.y) return;
    const gridLayer = getGridLayer(id);
    gridLayer?.add(GridLine(position.y, points.y));
  } */
};

export const drawStep = (id: string) => {
  const qty = getStepQty(id);
  const points = getStepPoints(id);
  if (!qty || !points || !points.x || !points.y) return;
  for (let i = 0; i <= qty?.x; i++) {
    const position = getStepPosition(id, i);
    if (!position?.x) return;
    const gridLayer = getGridLayer(id);
    gridLayer?.add(GridLine(position.x, points.x));
  }
  for (let i = 0; i <= qty?.y; i++) {
    const position = getStepPosition(id, i);
    if (!position?.y) return;
    const gridLayer = getGridLayer(id);
    gridLayer?.add(GridLine(position.y, points.y));
  }
};

export const drawLines = (id: string) => {
  const gridLayer = getGridLayer(id);
  if (gridLayer) {
    clipGridLayer(id);
    removeLines(id);
    drawFull(id);
    gridLayer.batchDraw();
  }
};

export const removeLines = (id: string) => {
  const gridLayer = getGridLayer(id);
  if (gridLayer) {
    gridLayer.clear();
    gridLayer.destroyChildren();
    /* gridLayer.clipWidth(0); */ // clear any clipping
  }
};
