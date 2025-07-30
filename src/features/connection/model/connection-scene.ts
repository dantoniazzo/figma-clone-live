import { FULL_SIZE } from 'features/grid';
import type { Context } from 'konva/lib/Context';
import type { Shape, ShapeConfig } from 'konva/lib/Shape';
import { type Arrow } from 'konva/lib/shapes/Arrow';

export const CONNECTION_RADIS = FULL_SIZE / 2;

// Helper function to draw a rounded corner between three points
const drawRoundedCorner = (
  ctx: Context,
  x1: number,
  y1: number, // Previous point
  x2: number,
  y2: number, // Corner point
  x3: number,
  y3: number, // Next point
  radius: number
) => {
  // Calculate vectors
  const v1x = x1 - x2;
  const v1y = y1 - y2;
  const v2x = x3 - x2;
  const v2y = y3 - y2;

  // Calculate lengths
  const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const len2 = Math.sqrt(v2x * v2x + v2y * v2y);

  // Normalize vectors
  const u1x = v1x / len1;
  const u1y = v1y / len1;
  const u2x = v2x / len2;
  const u2y = v2y / len2;

  // Limit radius to half the length of the shorter segment
  const maxRadius = Math.min(len1, len2) / 2;
  const actualRadius = Math.min(radius, maxRadius);

  // Calculate arc start and end points
  const startX = x2 + u1x * actualRadius;
  const startY = y2 + u1y * actualRadius;
  const endX = x2 + u2x * actualRadius;
  const endY = y2 + u2y * actualRadius;

  // Draw line to arc start
  ctx.lineTo(startX, startY);

  // Draw the arc
  ctx.arcTo(x2, y2, endX, endY, actualRadius);
};

// Custom scene function for drawing rounded connection paths
export const drawRoundedPath = (
  context: Context,
  shape: Arrow,
  points: number[],
  cornerRadius: number = 8
) => {
  if (points.length < 4) return;

  context.beginPath();

  // Move to the first point
  context.moveTo(points[0], points[1]);

  // If we have only 2 points (straight line), just draw a line
  if (points.length === 4) {
    context.lineTo(points[2], points[3]);
  } else {
    // Draw the path with rounded corners
    // Process each intermediate point as a potential corner
    for (let i = 2; i < points.length - 2; i += 2) {
      const prevX = points[i - 2];
      const prevY = points[i - 1];
      const currX = points[i];
      const currY = points[i + 1];
      const nextX = points[i + 2];
      const nextY = points[i + 3];

      // Check if this is actually a corner by comparing directions
      const dir1X = currX - prevX;
      const dir1Y = currY - prevY;
      const dir2X = nextX - currX;
      const dir2Y = nextY - currY;

      // Calculate the cross product to determine if there's a direction change
      const cross = dir1X * dir2Y - dir1Y * dir2X;
      const dot = dir1X * dir2X + dir1Y * dir2Y;

      // Check if we have a significant direction change (not collinear)
      const isCorner = Math.abs(cross) > 0.01 || dot < 0;

      if (isCorner) {
        // Draw rounded corner
        drawRoundedCorner(
          context,
          prevX,
          prevY,
          currX,
          currY,
          nextX,
          nextY,
          cornerRadius
        );
      } else {
        // Draw straight line to current point
        context.lineTo(currX, currY);
      }
    }

    // Draw to the final point
    context.lineTo(points[points.length - 2], points[points.length - 1]);
  }

  // Set stroke properties
  context.strokeStyle = shape.stroke();
  context.lineWidth = shape.strokeWidth();
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.stroke();

  // Draw arrowhead at the end
  const arrowLength = shape.pointerLength();
  const arrowWidth = shape.pointerWidth();

  if (points.length >= 4 && arrowLength > 0 && arrowWidth > 0) {
    const endX = points[points.length - 2];
    const endY = points[points.length - 1];
    const prevX = points[points.length - 4];
    const prevY = points[points.length - 3];

    // Calculate arrow direction
    const dx = endX - prevX;
    const dy = endY - prevY;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length > 0) {
      const unitX = dx / length;
      const unitY = dy / length;

      // Calculate arrowhead points
      const perpX = -unitY;
      const perpY = unitX;

      const arrowBaseX = endX - unitX * arrowLength;
      const arrowBaseY = endY - unitY * arrowLength;

      context.beginPath();
      context.moveTo(endX, endY);
      context.lineTo(
        arrowBaseX + perpX * (arrowWidth / 2),
        arrowBaseY + perpY * (arrowWidth / 2)
      );
      context.lineTo(
        arrowBaseX - perpX * (arrowWidth / 2),
        arrowBaseY - perpY * (arrowWidth / 2)
      );
      context.closePath();
      context.fillStyle = shape.stroke();
      context.fill();
    }
  }
};

export const sceneFunc = (context: Context, shape: Shape<ShapeConfig>) => {
  drawRoundedPath(
    context,
    shape as Arrow,
    (shape as Arrow).points(),
    CONNECTION_RADIS
  );
};
