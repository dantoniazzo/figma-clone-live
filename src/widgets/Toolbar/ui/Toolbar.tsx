import { Tools, toolsConfig } from '../model/tools.config';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getTool,
  getToolbarElement,
  getToolbarId,
  setTool,
  TOOL_ATTR_NAME,
} from '../lib/toolbar.element';
import { observeAttribute, setDataAttribute } from 'shared/model';
import { ToolbarButton } from './ToolbarButton';
import { disableHandTool, enableHandTool } from 'features/hand';
import { useParams } from 'react-router-dom';
import { createBlock, deleteBlock } from 'features/block-mutation';
import { BlockTypes, config } from 'entities/block';
import { getCenteredBlockPosition } from 'features/position';
import { getSelectedNodes } from 'features/selection';

export const Toolbar = () => {
  const [currentTool, setCurrentTool] = useState(Tools.POINTER);
  const params = useParams();
  const toolObserver = useRef<MutationObserver | null>(null);

  const id = useMemo(() => {
    return params.id || 'default';
  }, [params]);

  const handleToolSelection = useCallback(
    (tool: Tools) => {
      if (tool === Tools.ADD) {
        const centeredBlockPosition = getCenteredBlockPosition(
          id,
          config.width,
          config.height
        );
        if (!centeredBlockPosition) return;
        createBlock(id || 'default', {
          type: BlockTypes.RECTANGLE,
          position: {
            x: centeredBlockPosition.x,
            y: centeredBlockPosition.y,
          },
          size: {
            width: config.width,
            height: config.height,
          },
        });
      } else {
        setTool(tool);
      }

      if (tool === Tools.HAND) {
        enableHandTool(id);
      } else {
        disableHandTool(id);
      }
    },
    [id]
  );

  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ' ' && getTool() !== Tools.HAND) {
        handleToolSelection(Tools.HAND);
      }
      if (e.key === 'Delete') {
        const selectedNodes = getSelectedNodes(id);
        if (!selectedNodes || !selectedNodes.length) return;
        deleteBlock(id, {
          blocksToDelete: selectedNodes.map((node) => node.getAttr('id')),
        });
      }
    },
    [id, handleToolSelection]
  );

  const handleKeyup = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ' ' && getTool() === Tools.HAND) {
        handleToolSelection(Tools.POINTER);
      }
    },
    [handleToolSelection]
  );

  useEffect(() => {
    const toolbar = getToolbarElement();
    if (toolbar) {
      setDataAttribute(toolbar, TOOL_ATTR_NAME, currentTool);
    }
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keyup', handleKeyup);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('keyup', handleKeyup);
    };
  }, [currentTool, handleKeydown, handleKeyup]);

  const ref = useCallback((node: HTMLDivElement) => {
    if (!node) {
      toolObserver.current?.disconnect();
      return;
    }
    observeAttribute(node, TOOL_ATTR_NAME, () => {
      const tool = getTool();
      if (tool) {
        setCurrentTool(tool);
      }
    });
  }, []);

  return (
    <div
      ref={ref}
      id={getToolbarId()}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 flex align-middle justify-between bg-background-400 p-2 rounded-2xl border border-solid border-gray-400 shadow-lg gap-2"
    >
      {Object.entries(toolsConfig).map((tool) => {
        const toolKey = tool[0] as Tools;
        if (tool[1].show === false) return null;
        return (
          <ToolbarButton
            key={toolKey}
            onClick={() => handleToolSelection(toolKey)}
            tool={toolKey}
            selectedTool={currentTool}
          />
        );
      })}
    </div>
  );
};
