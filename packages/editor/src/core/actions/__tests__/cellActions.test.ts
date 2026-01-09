import {
  CELL_UPDATE_DATA,
  CELL_UPDATE_IS_DRAFT,
  CELL_REMOVE,
  CELL_RESIZE,
  CELL_FOCUS,
  CELL_BLUR,
  CELL_BLUR_ALL,
  updateCellData,
  updateCellIsDraft,
  removeCells,
  resizeCell,
  focusCell,
  blurCell,
  blurAllCells,
} from '../cell/core';
import {
  CELL_DRAG_HOVER,
  CELL_DRAG,
  CELL_DRAG_CANCEL,
  CLEAR_CLEAR_HOVER,
  cellHover,
  cellHoverLeftOf,
  cellHoverRightOf,
  cellHoverAbove,
  cellHoverBelow,
  cellHoverInlineLeft,
  cellHoverInlineRight,
  dragCell,
  clearHover,
  cancelCellDrag,
} from '../cell/drag';
import { PositionEnum } from '../../const';
import type { HoverTarget } from '../../service/hover/computeHover';

const createHoverTarget = (
  id: string,
  ancestorIds: string[] = []
): HoverTarget => ({
  id,
  ancestorIds,
  levels: null,
  inline: null,
  hasInlineNeighbour: null,
  pluginId: 'test-plugin',
});

describe('Cell Core Actions', () => {
  describe('updateCellData', () => {
    it('should create UPDATE_CELL_DATA action with correct shape', () => {
      const action = updateCellData('cell-1')(
        { content: 'test' },
        { lang: 'en' }
      );

      expect(action.type).toBe(CELL_UPDATE_DATA);
      expect(action.id).toBe('cell-1');
      expect(action.data).toEqual({ content: 'test' });
      expect(action.lang).toBe('en');
      expect(action.ts).toBeInstanceOf(Date);
    });

    it('should support notUndoable option', () => {
      const action = updateCellData('cell-1')(
        { content: 'test' },
        { lang: 'en', notUndoable: true }
      );

      expect(action.notUndoable).toBe(true);
    });

    it('should handle null data', () => {
      const action = updateCellData('cell-1')(null, { lang: 'en' });

      expect(action.data).toBeNull();
    });

    it('should be curried correctly', () => {
      const updateCell1 = updateCellData('cell-1');
      const action = updateCell1({ foo: 'bar' }, { lang: 'de' });

      expect(action.id).toBe('cell-1');
      expect(action.lang).toBe('de');
    });
  });

  describe('updateCellIsDraft', () => {
    it('should create UPDATE_CELL_IS_DRAFT action with correct shape', () => {
      const action = updateCellIsDraft('cell-1', true);

      expect(action.type).toBe(CELL_UPDATE_IS_DRAFT);
      expect(action.id).toBe('cell-1');
      expect(action.isDraft).toBe(true);
      expect(action.ts).toBeInstanceOf(Date);
    });

    it('should default isDraft to false', () => {
      const action = updateCellIsDraft('cell-1');

      expect(action.isDraft).toBe(false);
    });

    it('should support language-specific draft status', () => {
      const action = updateCellIsDraft('cell-1', true, 'de');

      expect(action.lang).toBe('de');
    });

    it('should default lang to null', () => {
      const action = updateCellIsDraft('cell-1', true);

      expect(action.lang).toBeNull();
    });
  });

  describe('removeCells', () => {
    it('should create CELL_REMOVE action with correct shape', () => {
      const action = removeCells(['cell-1', 'cell-2']);

      expect(action.type).toBe(CELL_REMOVE);
      expect(action.ids).toEqual(['cell-1', 'cell-2']);
      expect(action.ts).toBeInstanceOf(Date);
    });

    it('should handle single cell removal', () => {
      const action = removeCells(['cell-1']);

      expect(action.ids).toHaveLength(1);
      expect(action.ids[0]).toBe('cell-1');
    });

    it('should handle empty array', () => {
      const action = removeCells([]);

      expect(action.ids).toEqual([]);
    });
  });

  describe('resizeCell', () => {
    it('should create CELL_RESIZE action with correct shape', () => {
      const action = resizeCell('cell-1')(6);

      expect(action.type).toBe(CELL_RESIZE);
      expect(action.id).toBe('cell-1');
      expect(action.size).toBe(6);
      expect(action.ts).toBeInstanceOf(Date);
    });

    it('should default size to 1', () => {
      const action = resizeCell('cell-1')();

      expect(action.size).toBe(1);
    });

    it('should be curried correctly', () => {
      const resizeCell1 = resizeCell('cell-1');
      const action = resizeCell1(4);

      expect(action.id).toBe('cell-1');
      expect(action.size).toBe(4);
    });
  });

  describe('focusCell', () => {
    it('should create CELL_FOCUS action with correct shape', () => {
      const action = focusCell('cell-1');

      expect(action.type).toBe(CELL_FOCUS);
      expect(action.id).toBe('cell-1');
      expect(action.scrollToCell).toBe(false);
      expect(action.mode).toBe('replace');
      expect(action.ts).toBeInstanceOf(Date);
    });

    it('should support scrollToCell option', () => {
      const action = focusCell('cell-1', true);

      expect(action.scrollToCell).toBe(true);
    });

    it('should support add mode', () => {
      const action = focusCell('cell-1', false, 'add');

      expect(action.mode).toBe('add');
    });

    it('should support replace mode', () => {
      const action = focusCell('cell-1', false, 'replace');

      expect(action.mode).toBe('replace');
    });
  });

  describe('blurCell', () => {
    it('should create CELL_BLUR action with correct shape', () => {
      const action = blurCell('cell-1');

      expect(action.type).toBe(CELL_BLUR);
      expect(action.id).toBe('cell-1');
      expect(action.ts).toBeInstanceOf(Date);
    });
  });

  describe('blurAllCells', () => {
    it('should create CELL_BLUR_ALL action with correct shape', () => {
      const action = blurAllCells();

      expect(action.type).toBe(CELL_BLUR_ALL);
      expect(action.ts).toBeInstanceOf(Date);
    });
  });
});

describe('Cell Drag Actions', () => {
  describe('cellHover', () => {
    it('should create CELL_DRAG_HOVER action with correct shape', () => {
      const drag = { id: 'drag-1' };
      const target = createHoverTarget('hover-1');
      const action = cellHover(drag, target, 0, PositionEnum.LEFT_OF);

      expect(action.type).toBe(CELL_DRAG_HOVER);
      expect(action.dragId).toBe('drag-1');
      expect(action.hoverId).toBe('hover-1');
      expect(action.level).toBe(0);
      expect(action.position).toBe(PositionEnum.LEFT_OF);
      expect(action.ts).toBeInstanceOf(Date);
    });

    it('should use ancestor id for level > 0', () => {
      const drag = { id: 'drag-1' };
      const target = createHoverTarget('hover-1', ['ancestor-1', 'ancestor-2']);
      const action = cellHover(drag, target, 1, PositionEnum.ABOVE);

      expect(action.hoverId).toBe('ancestor-1');
    });

    it('should use second ancestor for level 2', () => {
      const drag = { id: 'drag-1' };
      const target = createHoverTarget('hover-1', ['ancestor-1', 'ancestor-2']);
      const action = cellHover(drag, target, 2, PositionEnum.BELOW);

      expect(action.hoverId).toBe('ancestor-2');
    });

    it('should fall back to hover id when no ancestors', () => {
      const drag = { id: 'drag-1' };
      const target = createHoverTarget('hover-1', []);
      const action = cellHover(drag, target, 1, PositionEnum.RIGHT_OF);

      expect(action.hoverId).toBe('hover-1');
    });
  });

  describe('cellHoverLeftOf', () => {
    it('should create action with LEFT_OF position', () => {
      const drag = { id: 'drag-1' };
      const target = createHoverTarget('hover-1');
      const action = cellHoverLeftOf(drag, target);

      expect(action.position).toBe(PositionEnum.LEFT_OF);
    });

    it('should default level to 0', () => {
      const drag = { id: 'drag-1' };
      const target = createHoverTarget('hover-1');
      const action = cellHoverLeftOf(drag, target);

      expect(action.level).toBe(0);
    });

    it('should accept custom level', () => {
      const drag = { id: 'drag-1' };
      const target = createHoverTarget('hover-1', ['ancestor-1']);
      const action = cellHoverLeftOf(drag, target, 1);

      expect(action.level).toBe(1);
      expect(action.hoverId).toBe('ancestor-1');
    });
  });

  describe('cellHoverRightOf', () => {
    it('should create action with RIGHT_OF position', () => {
      const drag = { id: 'drag-1' };
      const target = createHoverTarget('hover-1');
      const action = cellHoverRightOf(drag, target);

      expect(action.position).toBe(PositionEnum.RIGHT_OF);
    });
  });

  describe('cellHoverAbove', () => {
    it('should create action with ABOVE position', () => {
      const drag = { id: 'drag-1' };
      const target = createHoverTarget('hover-1');
      const action = cellHoverAbove(drag, target);

      expect(action.position).toBe(PositionEnum.ABOVE);
    });
  });

  describe('cellHoverBelow', () => {
    it('should create action with BELOW position', () => {
      const drag = { id: 'drag-1' };
      const target = createHoverTarget('hover-1');
      const action = cellHoverBelow(drag, target);

      expect(action.position).toBe(PositionEnum.BELOW);
    });
  });

  describe('cellHoverInlineLeft', () => {
    it('should create action with INLINE_LEFT position', () => {
      const drag = { id: 'drag-1' };
      const target = createHoverTarget('hover-1');
      const action = cellHoverInlineLeft(drag, target);

      expect(action.position).toBe(PositionEnum.INLINE_LEFT);
      expect(action.level).toBe(0);
    });
  });

  describe('cellHoverInlineRight', () => {
    it('should create action with INLINE_RIGHT position', () => {
      const drag = { id: 'drag-1' };
      const target = createHoverTarget('hover-1');
      const action = cellHoverInlineRight(drag, target);

      expect(action.position).toBe(PositionEnum.INLINE_RIGHT);
      expect(action.level).toBe(0);
    });
  });

  describe('dragCell', () => {
    it('should create CELL_DRAG action with correct shape', () => {
      const action = dragCell('cell-1');

      expect(action.type).toBe(CELL_DRAG);
      expect(action.id).toBe('cell-1');
      expect(action.ts).toBeInstanceOf(Date);
    });
  });

  describe('clearHover', () => {
    it('should create CLEAR_CLEAR_HOVER action with correct shape', () => {
      const action = clearHover();

      expect(action.type).toBe(CLEAR_CLEAR_HOVER);
      expect(action.ts).toBeInstanceOf(Date);
    });
  });

  describe('cancelCellDrag', () => {
    it('should create CELL_DRAG_CANCEL action with correct shape', () => {
      const action = cancelCellDrag();

      expect(action.type).toBe(CELL_DRAG_CANCEL);
      expect(action.ts).toBeInstanceOf(Date);
    });
  });
});
