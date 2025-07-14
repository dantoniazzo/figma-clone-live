import { getColor } from 'shared';
import { FULL_SIZE } from 'features/grid';

export const config = {
  name: 'block',
  width: FULL_SIZE * 5,
  height: FULL_SIZE * 5,
  fill: getColor('--color-gray-400'),
  cornerRadius: 6,
};
