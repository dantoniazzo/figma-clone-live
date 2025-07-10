import { type Size } from 'shared/model';
import { getStage } from 'entities/stage';

export const setStageSize = (stageId: string, size: Size) => {
  const stage = getStage(stageId);
  if (!stage) return;
  stage.width(size.width);
  stage.height(size.height);
};
