import { ConnectionAnchorSide } from '../model';
import { ConnectionAnchor } from './ConnectionAnchor';

export const ConnectionAnchors = () => {
  return (
    <>
      <ConnectionAnchor side={ConnectionAnchorSide.LEFT} />
      {/*     <ConnectionAnchor side={ConnectionAnchorSide.RIGHT} />
      <ConnectionAnchor side={ConnectionAnchorSide.TOP} />
      <ConnectionAnchor side={ConnectionAnchorSide.BOTTOM} /> */}
    </>
  );
};
