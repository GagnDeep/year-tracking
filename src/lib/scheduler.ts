import { differenceInMinutes } from "date-fns";

export interface TimeBlock {
  id?: string;
  startTime: Date;
  endTime: Date;
  category: string;
}

export function calculateDailyStats(blocks: TimeBlock[]) {
  const stats = new Map<string, number>();
  let totalScheduled = 0;

  for (const block of blocks) {
    const duration = differenceInMinutes(block.endTime, block.startTime) / 60;
    const current = stats.get(block.category) || 0;
    stats.set(block.category, current + duration);
    totalScheduled += duration;
  }

  return {
    byCategory: Object.fromEntries(stats),
    totalScheduled,
    totalFree: 24 - totalScheduled,
  };
}

export function checkOverlap(newBlock: TimeBlock, existingBlocks: TimeBlock[]): boolean {
  for (const block of existingBlocks) {
    // Skip self if updating
    if (newBlock.id && block.id === newBlock.id) continue;

    const startA = newBlock.startTime.getTime();
    const endA = newBlock.endTime.getTime();
    const startB = block.startTime.getTime();
    const endB = block.endTime.getTime();

    // Overlap condition: StartA < EndB && StartB < EndA
    if (startA < endB && startB < endA) {
      return true;
    }
  }
  return false;
}
