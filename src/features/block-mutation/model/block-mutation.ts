import { BlockTypes, config, getFarRightNode } from 'entities/block';
import { getRectFromGroup } from 'entities/node';
import { getCenteredBlockPosition } from 'features/position';
import { calculateGridCoordinates, FULL_SIZE } from 'features/grid';
import { v4 as uuidv4 } from 'uuid';
import { setTool, Tools } from 'widgets';
import { BlockEvents, mutationEvent } from './block-events';
import type { Group } from 'konva/lib/Group';

export const createBlock = (stageId: string) => {
  const rectId = uuidv4();

  const validFarRightNode = getFarRightNode(stageId);
  const rect = validFarRightNode
    ? getRectFromGroup(validFarRightNode as Group)
    : null;
  const position = getCenteredBlockPosition(
    stageId,
    config.width,
    config.height
  );
  if (!position) return;
  const gridPosition = validFarRightNode
    ? calculateGridCoordinates({
        ...validFarRightNode.position(),
        x:
          validFarRightNode.position().x +
          (rect ? rect.width() + FULL_SIZE : 0),
      })
    : calculateGridCoordinates(position);
  if (validFarRightNode) {
    mutationEvent(stageId, BlockEvents.UPDATE, {
      id: validFarRightNode?.id(),
      position: validFarRightNode?.position() || { x: 0, y: 0 },
      connection: {
        ...validFarRightNode.getAttr('connection'),
        to: rectId,
      },
      type: validFarRightNode.getAttr('blockType'),
      text: validFarRightNode.getAttr('text'),
    });
  }

  const tempRandomizationConfig = {
    [BlockTypes.INTEGRATION]: {
      text: 'Updating the ‘March’ sheet by writing “Email sent” in the status column for the corresponding influencer after the outreach is completed',
    },
    [BlockTypes.CONDITION]: {
      text: 'If new row contains a value equal or greater then 200K followers, continue the workflow to the right AI Agent',
    },
    [BlockTypes.INPUT]: {
      text: 'Requesting an AI Agent to draft an outreach email based on influencer data',
    },
    [BlockTypes.OUTPUT]: {
      text: 'Sending the final email to the selected influencer using the content approved earlier',
    },
    [BlockTypes.TIME]: {
      text: 'Waiting for 1 hour before sending the next email',
    },
  };

  const getRandomizedBlock = () => {
    const blockTypes = Object.entries(tempRandomizationConfig);
    const randomIndex = Math.floor(Math.random() * blockTypes.length);
    return {
      type: blockTypes[randomIndex][0] as BlockTypes,
      text: blockTypes[randomIndex][1].text,
    };
  };
  const randomizedBlock = getRandomizedBlock();
  mutationEvent(stageId, BlockEvents.CREATE, {
    position: gridPosition,
    id: rectId,
    type: randomizedBlock.type,
    connection: {
      from: validFarRightNode?.id(),
    },
    text: randomizedBlock.text,
  });

  setTool(Tools.POINTER);
};
