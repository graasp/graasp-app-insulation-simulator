type Constructor = {
  name: string;
  thermalConductivity: number;
  price: number;
  thickness: number;
};

export type FromBuildingMaterial = Partial<
  Pick<Constructor, 'price' | 'thickness'>
>;

export class BuildingMaterial {
  /**
   * Name of the material.
   */
  public readonly name: string;

  /**
   * Thermal conductivity W/m*K.
   */
  public readonly thermalConductivity: number;

  /**
   * Price in m^3.
   */
  public readonly price: number;

  /**
   * Thickness in m
   */
  public readonly thickness: number;

  private constructor({
    name,
    thermalConductivity,
    price,
    thickness,
  }: Constructor) {
    this.name = name;
    this.thermalConductivity = thermalConductivity;
    this.price = price;
    this.thickness = thickness;
  }

  public static create(constructor: Constructor): BuildingMaterial {
    return new BuildingMaterial(constructor);
  }

  public from({ price, thickness }: FromBuildingMaterial): BuildingMaterial {
    return BuildingMaterial.create({
      name: this.name,
      thermalConductivity: this.thermalConductivity,
      price: price ?? this.price,
      thickness: thickness ?? this.thickness,
    });
  }
}
