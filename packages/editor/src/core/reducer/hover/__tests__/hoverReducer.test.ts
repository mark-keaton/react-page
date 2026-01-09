import { hover } from '../index';
import type { Hover } from '../index';
import { PositionEnum } from '../../../const';
import {
  cellHover,
  cellHoverLeftOf,
  cellHoverRightOf,
  cellHoverAbove,
  cellHoverBelow,
  cellHoverInlineLeft,
  cellHoverInlineRight,
  clearHover,
} from '../../../actions/cell';
import type { HoverTarget } from '../../../service/hover/computeHover';

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

const createDragCell = (id: string) => ({
  id,
  plugin: { id: 'test-plugin', version: 1 },
});

describe('hover reducer', () => {
  describe('CELL_DRAG_HOVER action', () => {
    it('should set hover state with node id and position', () => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('hover-1');
      const action = cellHover(drag, hoverTarget, 0, PositionEnum.LEFT_OF);
      const newState = hover(initialState, action);

      expect(newState?.nodeId).toBe('hover-1');
      expect(newState?.position).toBe(PositionEnum.LEFT_OF);
    });

    it('should update existing hover state', () => {
      const initialState: Hover = {
        nodeId: 'old-hover',
        position: PositionEnum.ABOVE,
      };
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('new-hover');
      const action = cellHover(drag, hoverTarget, 0, PositionEnum.BELOW);
      const newState = hover(initialState, action);

      expect(newState?.nodeId).toBe('new-hover');
      expect(newState?.position).toBe(PositionEnum.BELOW);
    });

    it('should use ancestor id when level > 0', () => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('hover-1', [
        'ancestor-1',
        'ancestor-2',
      ]);
      const action = cellHover(drag, hoverTarget, 1, PositionEnum.RIGHT_OF);
      const newState = hover(initialState, action);

      expect(newState?.nodeId).toBe('ancestor-1');
      expect(newState?.position).toBe(PositionEnum.RIGHT_OF);
    });

    it('should use second ancestor when level is 2', () => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('hover-1', [
        'ancestor-1',
        'ancestor-2',
      ]);
      const action = cellHover(drag, hoverTarget, 2, PositionEnum.ABOVE);
      const newState = hover(initialState, action);

      expect(newState?.nodeId).toBe('ancestor-2');
    });

    it('should use last ancestor when level exceeds available ancestors', () => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      // Only one ancestor, but requesting level 5
      const hoverTarget = createHoverTarget('hover-1', ['ancestor-1']);
      const action = cellHover(drag, hoverTarget, 5, PositionEnum.BELOW);
      const newState = hover(initialState, action);

      // With only 1 ancestor and level 5, it uses ancestorIds[Math.max(0, 5-1)] = ancestorIds[4]
      // which doesn't exist, so it falls back to hover.id
      expect(newState?.nodeId).toBe('hover-1');
    });

    it('should handle empty ancestorIds array', () => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('hover-1', []);
      const action = cellHover(drag, hoverTarget, 1, PositionEnum.LEFT_OF);
      const newState = hover(initialState, action);

      expect(newState?.nodeId).toBe('hover-1');
    });
  });

  describe('cellHoverLeftOf action creator', () => {
    it('should create hover action with LEFT_OF position', () => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('hover-1');
      const action = cellHoverLeftOf(drag, hoverTarget);
      const newState = hover(initialState, action);

      expect(newState?.position).toBe(PositionEnum.LEFT_OF);
    });

    it('should respect level parameter', () => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('hover-1', ['ancestor-1']);
      const action = cellHoverLeftOf(drag, hoverTarget, 1);
      const newState = hover(initialState, action);

      expect(newState?.nodeId).toBe('ancestor-1');
      expect(newState?.position).toBe(PositionEnum.LEFT_OF);
    });
  });

  describe('cellHoverRightOf action creator', () => {
    it('should create hover action with RIGHT_OF position', () => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('hover-1');
      const action = cellHoverRightOf(drag, hoverTarget);
      const newState = hover(initialState, action);

      expect(newState?.position).toBe(PositionEnum.RIGHT_OF);
    });
  });

  describe('cellHoverAbove action creator', () => {
    it('should create hover action with ABOVE position', () => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('hover-1');
      const action = cellHoverAbove(drag, hoverTarget);
      const newState = hover(initialState, action);

      expect(newState?.position).toBe(PositionEnum.ABOVE);
    });
  });

  describe('cellHoverBelow action creator', () => {
    it('should create hover action with BELOW position', () => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('hover-1');
      const action = cellHoverBelow(drag, hoverTarget);
      const newState = hover(initialState, action);

      expect(newState?.position).toBe(PositionEnum.BELOW);
    });
  });

  describe('cellHoverInlineLeft action creator', () => {
    it('should create hover action with INLINE_LEFT position', () => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('hover-1');
      const action = cellHoverInlineLeft(drag, hoverTarget);
      const newState = hover(initialState, action);

      expect(newState?.position).toBe(PositionEnum.INLINE_LEFT);
    });

    it('should always use level 0 for inline positions', () => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('hover-1', ['ancestor-1']);
      const action = cellHoverInlineLeft(drag, hoverTarget);
      const newState = hover(initialState, action);

      // Inline positions use level 0, so should use direct hover id
      expect(newState?.nodeId).toBe('hover-1');
    });
  });

  describe('cellHoverInlineRight action creator', () => {
    it('should create hover action with INLINE_RIGHT position', () => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('hover-1');
      const action = cellHoverInlineRight(drag, hoverTarget);
      const newState = hover(initialState, action);

      expect(newState?.position).toBe(PositionEnum.INLINE_RIGHT);
    });
  });

  describe('CLEAR_CLEAR_HOVER action', () => {
    it('should clear hover state to null', () => {
      const initialState: Hover = {
        nodeId: 'hover-1',
        position: PositionEnum.ABOVE,
      };
      const action = clearHover();
      const newState = hover(initialState, action);

      expect(newState).toBeNull();
    });

    it('should handle clearing already null state', () => {
      const initialState: Hover = null;
      const action = clearHover();
      const newState = hover(initialState, action);

      expect(newState).toBeNull();
    });
  });

  describe('default behavior', () => {
    it('should return current state for unknown actions', () => {
      const initialState: Hover = {
        nodeId: 'hover-1',
        position: PositionEnum.ABOVE,
      };
      const unknownAction = { type: 'UNKNOWN_ACTION', ts: new Date() };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newState = hover(initialState, unknownAction as any);

      expect(newState).toEqual(initialState);
    });

    it('should return null as default state', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION', ts: new Date() };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newState = hover(undefined, unknownAction as any);

      expect(newState).toBeNull();
    });
  });

  describe('all position types', () => {
    it.each([
      [PositionEnum.LEFT_OF, 'LEFT_OF'],
      [PositionEnum.RIGHT_OF, 'RIGHT_OF'],
      [PositionEnum.ABOVE, 'ABOVE'],
      [PositionEnum.BELOW, 'BELOW'],
      [PositionEnum.INLINE_LEFT, 'INLINE_LEFT'],
      [PositionEnum.INLINE_RIGHT, 'INLINE_RIGHT'],
    ])('should handle %s position', (position) => {
      const initialState: Hover = null;
      const drag = createDragCell('drag-1');
      const hoverTarget = createHoverTarget('hover-1');
      const action = cellHover(drag, hoverTarget, 0, position);
      const newState = hover(initialState, action);

      expect(newState?.position).toBe(position);
    });
  });

  describe('sequential hover operations', () => {
    it('should handle multiple hover state changes', () => {
      let state: Hover = null;
      const drag = createDragCell('drag-1');

      // First hover
      state = hover(
        state,
        cellHover(drag, createHoverTarget('cell-1'), 0, PositionEnum.ABOVE)
      );
      expect(state?.nodeId).toBe('cell-1');
      expect(state?.position).toBe(PositionEnum.ABOVE);

      // Second hover - different cell
      state = hover(
        state,
        cellHover(drag, createHoverTarget('cell-2'), 0, PositionEnum.BELOW)
      );
      expect(state?.nodeId).toBe('cell-2');
      expect(state?.position).toBe(PositionEnum.BELOW);

      // Clear hover
      state = hover(state, clearHover());
      expect(state).toBeNull();
    });
  });
});
