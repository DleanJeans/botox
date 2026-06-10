import type { Player } from '../types';

export interface LayoutConfig {
  centerX: number;
  centerY: number;
  seatRadius: number;
  seatSize: number;
}

/**
 * Calculate positions for a circle layout given viewport dimensions.
 * Players are distributed evenly around a circle.
 */
export function calculateCirclePositions(
  players: Player[],
  width: number,
  height: number,
  _seatSize: number = 80,
): {
  x: number;
  y: number;
}[] {
  const count = players.length;
  if (count === 0) return [];

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.3;

  return players.map((player, i) => {
    // If position is locked (manually dragged), keep it
    if (player.positionLocked) {
      return {
        x: player.position.x,
        y: player.position.y,
      };
    }

    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

/**
 * Calculate positions for a room layout — players sit on chairs
 * along the four walls of a room, facing inward.
 */
export function calculateRoomPositions(
  players: Player[],
  width: number,
  height: number,
  seatSize: number = 80,
): {
  x: number;
  y: number;
}[] {
  const count = players.length;
  if (count === 0) return [];

  const centerX = width / 2;
  const centerY = height / 2;
  const roomW = Math.min(width * 0.7, 600);
  const roomH = Math.min(height * 0.6, 400);
  const margin = seatSize * 0.7;

  return players.map((player, i) => {
    if (player.positionLocked) {
      return {
        x: player.position.x,
        y: player.position.y,
      };
    }

    // Distribute players along the 4 walls.
    // Top and bottom walls get more players (longer sides).
    const topCount = Math.max(1, Math.ceil(roomW / (seatSize + 16)));
    const sideCount = Math.max(1, Math.ceil(roomH / (seatSize + 16)));
    const totalPerimeter = topCount * 2 + sideCount * 2;
    const pos = i % totalPerimeter;

    const spacingW = roomW / (topCount + 1);
    const spacingH = roomH / (sideCount + 1);

    if (pos < topCount) {
      // Top wall
      const t = pos + 1;
      return {
        x: centerX - roomW / 2 + t * spacingW,
        y: centerY - roomH / 2 - margin,
      };
    } else if (pos < topCount + sideCount) {
      // Right wall
      const t = pos - topCount + 1;
      return {
        x: centerX + roomW / 2 + margin,
        y: centerY - roomH / 2 + t * spacingH,
      };
    } else if (pos < topCount * 2 + sideCount) {
      // Bottom wall (reverse order so they face inward)
      const t = topCount - (pos - topCount - sideCount);
      return {
        x: centerX - roomW / 2 + t * spacingW,
        y: centerY + roomH / 2 + margin,
      };
    } else {
      // Left wall
      const t = sideCount - (pos - topCount * 2 - sideCount);
      return {
        x: centerX - roomW / 2 - margin,
        y: centerY + roomH / 2 - t * spacingH,
      };
    }
  });
}

/**
 * Generate a short unique ID.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
