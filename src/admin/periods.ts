export const PERIODS = [7, 14, 30] as const
export type Period = (typeof PERIODS)[number]
