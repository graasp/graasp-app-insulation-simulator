import { useEffect, useMemo, useState } from 'react';

import { HouseInsulation } from '@/config/houseInsulations';
import { useHouseComponents } from '@/context/HouseComponentsContext';
import { BuildingMaterial } from '@/models/BuildingMaterial';
import { HouseComponent } from '@/types/houseComponent';
import { NonEmptyArray } from '@/types/utils';

type UseMaterialControlDialogReturnType = {
  currTab: string;
  updateTab: (tab: string) => void;
  handleThicknessChange: (materialName: string, newThickness: number) => void;
  handlePriceChange: (materialName: string, newPrice: number) => void;
  wallMaterials?: NonEmptyArray<BuildingMaterial>;
  wallInsulation?: HouseInsulation;
};

export const useMaterialControlDialog =
  (): UseMaterialControlDialogReturnType => {
    const { houseComponentsConfigurator, updateCompositionOfInsulation } =
      useHouseComponents();
    const [currTab, setCurrTab] = useState('');

    const wallComponents = useMemo(
      () => houseComponentsConfigurator.getFirstOfType(HouseComponent.Wall),
      [houseComponentsConfigurator],
    );
    const wallMaterials = wallComponents?.buildingMaterials;
    const wallInsulation = wallComponents?.insulationName;

    useEffect(() => {
      if (
        wallMaterials?.length &&
        !wallMaterials.some((m) => m.name === currTab)
      ) {
        setCurrTab(wallMaterials[0].name);
      }
    }, [currTab, wallMaterials]);

    const handleThicknessChange = (
      materialName: string,
      newThickness: number,
    ): void => {
      updateCompositionOfInsulation({
        componentType: HouseComponent.Wall,
        materialProps: {
          name: materialName,
          thickness: newThickness,
        },
      });
    };

    const handlePriceChange = (
      materialName: string,
      newPrice: number,
    ): void => {
      updateCompositionOfInsulation({
        componentType: HouseComponent.Wall,
        materialProps: {
          name: materialName,
          price: newPrice,
        },
      });
    };

    return {
      currTab,
      wallMaterials,
      wallInsulation,
      updateTab: (tab) => setCurrTab(tab),
      handleThicknessChange,
      handlePriceChange,
    };
  };
