import { BuildingMaterial } from '@/models/BuildingMaterial';

export const BUILDING_MATERIALS = {
  Aerogel: BuildingMaterial.create({
    name: 'Aerogel',
    price: 10_000,
    thermalConductivity: 0.021,
    thickness: 0.16,
  }),
  FiberGlass: BuildingMaterial.create({
    name: 'FiberGlass',
    price: 3_000,
    thermalConductivity: 0.115,
    thickness: 0.16,
  }),
  XPSFoam: BuildingMaterial.create({
    name: 'XPSFoam',
    price: 10,
    thermalConductivity: 0.024,
    thickness: 0.16,
  }),
  MineralWool: BuildingMaterial.create({
    name: 'MineralWool',
    price: 7,
    thermalConductivity: 0.03,
    thickness: 0.16,
  }),
  Brick: BuildingMaterial.create({
    name: 'Brick',
    price: 55,
    thermalConductivity: 0.6,
    thickness: 0.2,
  }),
  WindowGlass: BuildingMaterial.create({
    name: 'WindowGlass',
    price: 150,
    thermalConductivity: 0.8,
    thickness: 0.004,
  }),
  Argon: BuildingMaterial.create({
    name: 'Argon',
    price: 0,
    thermalConductivity: 0.018,
    thickness: 0.006,
  }),
  Wood: BuildingMaterial.create({
    name: 'Wood',
    price: 0,
    thermalConductivity: 0.08,
    thickness: 0.2,
  }),
} as const;

export type BuildingMaterialKeys = keyof typeof BUILDING_MATERIALS;
