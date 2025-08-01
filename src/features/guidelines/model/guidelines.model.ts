import Konva from 'konva';
import { Node } from 'konva/lib/Node';
import { getAllBlocks } from 'entities/block';
import { getLayer } from 'entities/layer';
import { getStageIdFromNode } from 'entities/stage';
import { getColor } from 'shared';

const GUIDELINE_OFFSET = 5;

interface ILineGuideStops {
  vertical: number[];
  horizontal: number[];
}

interface IItemBounds {
  vertical: IGuide[];
  horizontal: IGuide[];
}

interface IGuide {
  diff?: number;
  guide: number;
  offset: number;
  snap: 'start' | 'center' | 'end';
  orientation?: string;
}

// were can we snap our objects?
export const getLineGuideStops = (
  skipShape: Node
): ILineGuideStops | undefined => {
  const stage = skipShape.getStage();
  if (!stage) return;
  const stageId = getStageIdFromNode(skipShape);
  if (!stageId) return;
  // we can snap to stage borders and the center of the stage
  const vertical = [0, stage.width() / 2, stage.width()];
  const horizontal = [0, stage.height() / 2, stage.height()];

  // and we snap over edges and center of each object on the canvas
  getAllBlocks(stageId)?.forEach((guideItem) => {
    if (guideItem === skipShape) {
      return;
    }
    const box = guideItem.getClientRect();
    // and we can snap to all edges of shapes
    vertical.push(box.x);
    vertical.push(box.x + box.width);
    vertical.push(box.x + box.width / 2);
    horizontal.push(box.y);
    horizontal.push(box.y + box.height);
    horizontal.push(box.y + box.height / 2);
  });

  return {
    vertical: vertical.flat(),
    horizontal: horizontal.flat(),
  };
};

// what points of the object will trigger to snapping?
// it can be just center of the object
// but we will enable all edges and center
export const getObjectSnappingEdges = (node: Node): IItemBounds => {
  const box = node.getClientRect();
  const absPos = node.absolutePosition();

  return {
    vertical: [
      {
        guide: Math.round(box.x),
        offset: Math.round(absPos.x - box.x),
        snap: 'start',
      },
      {
        guide: Math.round(box.x + box.width / 2),
        offset: Math.round(absPos.x - box.x - box.width / 2),
        snap: 'center',
      },
      {
        guide: Math.round(box.x + box.width),
        offset: Math.round(absPos.x - box.x - box.width),
        snap: 'end',
      },
    ],
    horizontal: [
      {
        guide: Math.round(box.y),
        offset: Math.round(absPos.y - box.y),
        snap: 'start',
      },
      {
        guide: Math.round(box.y + box.height / 2),
        offset: Math.round(absPos.y - box.y - box.height / 2),
        snap: 'center',
      },
      {
        guide: Math.round(box.y + box.height),
        offset: Math.round(absPos.y - box.y - box.height),
        snap: 'end',
      },
    ],
  };
};

// find all snapping possibilities
export const getGuides = (
  lineGuideStops: ILineGuideStops,
  itemBounds: IItemBounds
): IGuide[] => {
  const resultV: IGuide[] = [];
  const resultH: IGuide[] = [];

  lineGuideStops.vertical.forEach((lineGuide) => {
    itemBounds.vertical.forEach((itemBound) => {
      const diff = Math.abs(lineGuide - itemBound.guide);
      // if the distance between guild line and object snap point is close we can consider this for snapping
      if (diff < GUIDELINE_OFFSET) {
        resultV.push({
          guide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
        });
      }
    });
  });

  lineGuideStops.horizontal.forEach((lineGuide) => {
    itemBounds.horizontal.forEach((itemBound) => {
      const diff = Math.abs(lineGuide - itemBound.guide);
      if (diff < GUIDELINE_OFFSET) {
        resultH.push({
          guide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
        });
      }
    });
  });

  const guides = [];

  // find closest snap
  const minV = resultV.sort((a, b) => {
    if (!a.diff || !b.diff) return 0;
    if (a.diff === b.diff) return 0;
    return a.diff - b.diff;
  })[0];
  const minH = resultH.sort((a, b) => {
    if (!a.diff || !b.diff) return 0;
    if (a.diff === b.diff) return 0;
    return a.diff - b.diff;
  })[0];
  if (minV) {
    guides.push({
      guide: minV.guide,
      offset: minV.offset,
      orientation: 'V',
      snap: minV.snap,
    });
  }
  if (minH) {
    guides.push({
      guide: minH.guide,
      offset: minH.offset,
      orientation: 'H',
      snap: minH.snap,
    });
  }
  return guides;
};

export const drawGuides = (stageId: string, guides: IGuide[]) => {
  const layer = getLayer(stageId);
  if (!layer) return;
  guides.forEach((lg) => {
    if (lg.orientation === 'H') {
      const line = new Konva.Line({
        points: [-6000, 0, 6000, 0],
        stroke: getColor('--color-primary-100'),
        strokeWidth: 1,
        name: 'guid-line',
      });
      layer.add(line);
      line.absolutePosition({
        x: 0,
        y: lg.guide,
      });
    } else if (lg.orientation === 'V') {
      const line = new Konva.Line({
        points: [0, -6000, 0, 6000],
        stroke: getColor('--color-primary-100'),
        strokeWidth: 1,
        name: 'guid-line',
      });
      layer.add(line);
      line.absolutePosition({
        x: lg.guide,
        y: 0,
      });
    }
  });
};
