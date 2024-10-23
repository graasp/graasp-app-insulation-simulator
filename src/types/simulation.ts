export enum SimulationStatus {
  IDLE,
  LOADING,
  RUNNING,
  FINISHED,
}

export type SimulationProgression = { progress: number; timeLeft: number };
