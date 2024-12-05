export enum SimulationStatus {
  IDLE,
  LOADING,
  RUNNING,
  PAUSED,
  FINISHED,
}

export type SimulationProgression = { progress: number; timeLeft: number };
