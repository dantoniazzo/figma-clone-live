import Konva from "konva";
import { type Points } from "./line.types";
import { v4 as uuidv4 } from "uuid";
import { LineConfig } from "./line.config";
import { getStage } from "entities/stage";
import { getLayer } from "entities/layer";
import { LINE_ANCHOR_NAME, LINE_GROUP_NAME, NEW_LINE_ATTR } from "../lib";
import { findNode } from "entities/node";
import { Line as LineType } from "konva/lib/shapes/Line";
import { getUnscaledPointerPosition } from "features/pointer";
import { formatPoints } from "./line.helpers";
import { getTool, Tools } from "widgets";

export const createLine = (stageId: string, points: Points) => {
  const id = uuidv4();
  const newLine = new Konva.Line({
    id,
    points: formatPoints(points),
    ...LineConfig,
  });
  const stage = getStage(stageId);
  const layer = getLayer(stageId);
  if (stage && layer) {
    stage.setAttr(NEW_LINE_ATTR, id);
    layer.add(newLine);
    layer.batchDraw();
  }
};

export const drawLine = (stageId: string) => {
  const stage = getStage(stageId);
  const newLineId = stage?.getAttr(NEW_LINE_ATTR);
  if (newLineId) {
    const line = findNode(stageId, newLineId) as LineType;
    if (line) {
      const pointerPosition = getUnscaledPointerPosition(stageId);
      const points = line.points();
      if (points && pointerPosition) {
        // We need to spread an array of positions evenly create a straight line
        line.points([
          points[0],
          points[1],
          points[0] + (pointerPosition.x - points[0]) / 3,
          points[1] + (pointerPosition.y - points[1]) / 3,
          points[0] + (2 * (pointerPosition.x - points[0])) / 3,
          points[1] + (2 * (pointerPosition.y - points[1])) / 3,
          pointerPosition.x,
          pointerPosition.y,
        ]);
        line.getLayer()?.batchDraw();
      }
    }
  }
};

export const finishDrawingLine = (stageId: string) => {
  const stage = getStage(stageId);
  if (!stage) return;
  const newLineId = stage.getAttr(NEW_LINE_ATTR);
  if (newLineId) {
    const line = findNode(stageId, newLineId) as LineType;
    stage.setAttr(NEW_LINE_ATTR, null);
    if (line) {
      const points = line.points();
      if (points) {
        const lineGroup = new Konva.Group({
          draggable: true,
          name: LINE_GROUP_NAME,
        });
        const shape = new Konva.Shape({
          id: line.id(),
          stroke: "white",
          strokeWidth: 2,
          sceneFunc: (ctx, shape) => {
            const anchor1 = lineGroup.findOne(`#${line.id()}-anchor0`);
            const anchor2 = lineGroup.findOne(`#${line.id()}-anchor1`);
            const anchor3 = lineGroup.findOne(`#${line.id()}-anchor2`);
            const anchor4 = lineGroup.findOne(`#${line.id()}-anchor3`);
            if (anchor1 && anchor2 && anchor3 && anchor4) {
              ctx.beginPath();
              ctx.moveTo(anchor1.x(), anchor1.y());
              ctx.bezierCurveTo(
                anchor2.x(),
                anchor2.y(),
                anchor3.x(),
                anchor3.y(),
                anchor4.x(),
                anchor4.y()
              );
              ctx.fillStrokeShape(shape);
            }
          },
        });
        lineGroup.add(shape);
        const firstAnchorLine = new Konva.Line({
          points: [points[0], points[1], points[2], points[3]],
          stroke: "white",
          strokeWidth: 2,
          lineCap: "round",
          lineJoin: "round",
          id: `${line.id()}-line1`,
        });
        const secondAnchorLine = new Konva.Line({
          points: [points[4], points[5], points[6], points[7]],
          stroke: "white",
          strokeWidth: 2,
          lineCap: "round",
          lineJoin: "round",
          id: `${line.id()}-line2`,
        });
        lineGroup.add(firstAnchorLine);
        lineGroup.add(secondAnchorLine);
        [0, 1, 2, 3].forEach((i) => {
          const anchor = new Konva.Circle({
            x: points[i * 2],
            y: points[i * 2 + 1],
            radius: 3,
            fill: "white",
            stroke: "#0d89e4",
            draggable: true,
            id: `${line.id()}-anchor${i}`,
            name: LINE_ANCHOR_NAME,
          });
          anchor.on("pointerover", (e) => {
            if (getTool() === Tools.HAND) return;
            e.target.to({
              scaleX: 1.5,
              scaleY: 1.5,
              duration: 0.1,
            });
            e.target.getLayer()?.batchDraw();
          });

          anchor.on("pointerout", (e) => {
            e.target.to({
              scaleX: 1,
              scaleY: 1,
              duration: 0.1,
            });
            e.target.getLayer()?.batchDraw();
          });
          anchor.on("dragmove", (e) => {
            if (i === 0) {
              firstAnchorLine.points([
                e.target.x(),
                e.target.y(),
                firstAnchorLine.points()[2],
                firstAnchorLine.points()[3],
              ]);
            } else if (i === 1) {
              firstAnchorLine.points([
                firstAnchorLine.points()[0],
                firstAnchorLine.points()[1],
                e.target.x(),
                e.target.y(),
              ]);
            } else if (i === 2) {
              secondAnchorLine.points([
                e.target.x(),
                e.target.y(),
                secondAnchorLine.points()[2],
                secondAnchorLine.points()[3],
              ]);
            } else if (i === 3) {
              secondAnchorLine.points([
                secondAnchorLine.points()[0],
                secondAnchorLine.points()[1],
                e.target.x(),
                e.target.y(),
              ]);
            }
          });
          lineGroup.add(anchor);
        });
        line.remove();

        const layer = getLayer(stageId);
        if (!layer) return;
        layer.add(lineGroup);
        layer.batchDraw();
      }
    }
  }
};
