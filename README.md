<div style="margin-bottom: 20px; display:flex; justify-content: center; align-items: center ">
<img style="text-align: center" src="https://graasp.org/favicon.svg" width=100 >
</div>

# Graasp App Insulation Simulator

This repository hosts the code for the **Graasp App Insulation Simulator** written with [Typescript](https://www.typescriptlang.org/) and [React](https://react.dev/). The bundler used is [Vite](https://vitejs.dev).

<div style="gap:10px; display:flex; justify-content: center; align-items: center;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" width=50 >
  <span>+</span>
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width=50 >
  <span>+</span>
  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Vitejs-logo.svg" width=50 >
  <span>=</span>
  <span>❤️</span>
</div>

## Purpose

The app's purpose is to help users understand and reduce heat loss through conduction in a house by testing various insulation materials, including advanced options like aerogel. Users can customize energy costs and the duration of the simulation (e.g., 1 year or 25 years) to see how these factors affect heat retention and energy efficiency over time.

> [!NOTE]
> This simulation calculates the estimated heat loss of a house over time, focusing specifically on losses through the walls and windows. Heat loss through the door, roof, and ground are negligated in this model. When changing a setting (like the insulation or temperature), it applies retroactively to the entire simulation. The displayed results reflect the outcome as if the parameter had always been set to the new value.

## Running the app

Create a `.env.development` file with the following content:

```bash
VITE_PORT=3005
VITE_API_HOST=http://localhost:3000
VITE_ENABLE_MOCK_API=true
VITE_GRAASP_APP_KEY=45678-677889
VITE_VERSION=latest
```

## Running the tests

Create a `.env.test` file with the following content:

```bash
VITE_PORT=3333
VITE_API_HOST=http://localhost:3636
VITE_ENABLE_MOCK_API=true
VITE_GRAASP_APP_KEY=45678-677889
VITE_VERSION=latest

# dont open browser
BROWSER=none
```

## Working with 3D Models

This project utilizes **Three.js** and **React-Three-Fiber** to streamline the loading and management of 3D models within a React environment. Additionally, the `gltfjsx` package is employed to optimize and compress GLB models, as well as to automatically generate the corresponding React components for easy integration and rendering of these models.

To enhance clarity for developers and maintainers, all files generated by the `gltfjsx` package include a standardized header, as shown below:

```js
/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 OriginalHouse.glb --transform --types 
Files: OriginalHouse.glb [250.7KB] > House.glb [16.05KB] (94%)
Model: "Residential Houses" from: https://www.sloyd.ai/ 
*/
```

In this example, we compressed the GLB file using the `--transform` flag, which optimizes the model for better performance, and generated a React component with the full command. The `--types` flag was used to generate TypeScript types for enhanced type safety. By using a compressed version of the GLB file, we consolidate the object's components into organized groups, making the React component easier to understand and improving browser rendering efficiency.

Indeed, the compressed component for the fir tree will consist of two meshes: one for the spines and one for the trunk. In contrast, the original component would have contained seven meshes for the spines and one for the trunk. This compression significantly reduces the number of meshes, which, in turn, minimizes the lines of code in our component, making it more efficient and easier to manage. The drawback of this compression is that we have less control over the different parts of the object. If this is what we want, we should avoid using the `--transform` flag.

Additionally, I used Blender to rename the object’s materials for clarity, such as changing `Material-001.002` to more descriptive names like `Wall`.

Lastly, each header contains the URL of the original model if it wasn't created in-house, providing proper attribution and reference for future modifications.

This approach simplifies the process of updating or adding a 3D model. To do so, simply place the model in the `public/models` folder and run the `npx gltfjsx` command. Afterward, store the generated code in the `src/modules/models` directory. It is also recommended to extract the logic from this component into a custom hook, making it modular and reusable while keeping the component clean and focused on rendering.

If an existing model is updated, we should replace the type and the React component group while leaving the logic hooks untouched. This approach ensures that the code remains valid and functional, as the underlying logic and behavior are preserved, reducing the risk of introducing errors.

The positions of the meshes within the group are auto-generated, and they should never be manually modified. If an object needs to be repositioned, adjust its `position` prop applied directly to the group instead. This maintains consistency and ensures the auto-generated structure remains intact while allowing for flexible positioning.

## Downloading a Temperatures CSV File

To download a CSV file of temperatures, follow these steps:

1. **CSV File Requirements**:

   - The CSV file must contain a header.
   - The first column should represent time in GMT+0, formatted in ISO 8601.
   - The second column should contain the temperature values in °C.

   ```
   time,temperature
   1999-01-01T00:00,3.9
   1999-01-01T01:00,3.7
   ```

   Or

   ```
   time,temperature
   1999-01-01,4.5
   1999-01-02,3.6
   ```

2. **File Location**:

   - Ensure that your CSV file is located in the `public/temperatures` directory of your project.
   - As the application allows multiple locations, each location should have its own directory: `public/temperatures/<location_name>`.
     - The directory should contains `public/temperatures/<location>/predictions_1_year.csv` for the weather of one year.
     - The directory should contains `public/temperatures/<location>/predictions_25_year.csv` for the weather of 25 years.

3. **Data Source**:

   - You can download the required CSV data from [Open Meteo](https://open-meteo.com/en/docs/climate-api#start_date=2020-01-01&end_date=2040-01-01&daily=temperature_2m_mean).

> [!WARNING]
> The measurement frequency changes depending on whether you are querying historical data (one temperature value per hour) or future predictions (one temperature value per day).
> This application only supports one temperature per day!

## How to update the materials

The house model uses two key concepts for materials:

- **BuildingMaterial**: These represent the raw materials or insulation types themselves, like aerogel, brick, wood, etc. Each BuildingMaterial has properties like cost, thickness, and thermal conductivity.

> [!NOTE]
> To modify these properties for existing materials or to add new materials, edit the `config/buildingMaterials.ts` file.

- **HouseInsulation**: This represents the layered insulation structure of the house and is defined as an array of `BuildingMaterials`. For example, a wall insulated with aerogel would be represented as a combination of brick (the structural material) and aerogel (the insulation layer). The `HouseInsulation` concept allows for modeling composite wall structures (or windows). You can adjust the layers within a `HouseInsulation` type also within `config/houseInsulations.ts`.

## Demo

https://github.com/user-attachments/assets/9256f636-7209-48e1-bdd8-d928f4647f8e

### Simulation Controls

The simulation offers the following controls, accessible via the "Settings" panel on the right:

**1. Simulation Parameters:**

- **Location of Simulation:**

  - **Effect:** Determines the average outdoor temperature profile used in the simulation. Selecting a different location changes the simulated weather conditions, impacting heat loss calculations.
  - **Options:** ["Ecublens", "Stockholm"]
  - **Default Value:** ["Ecublens"]
  - **How to adjust:** Select from the dropdown menu.

- **Duration of Simulation:**
  - **Effect:** Sets the time frame for the simulation.
  - **Options:** ["1 year", "25 years"]
  - **Default Value:** ["1 year"]
  - **How to adjust:** Select from the dropdown menu.

**2. House Parameters:**

- **Wall Insulation:**

  - **Effect:** Defines the material used for wall insulation, significantly influencing the rate of heat loss. Different materials have different thermal properties, affecting the simulation's outcome.
  - **Options:** ["Aerogel", "Brick", "Fiberglass", "XPS Foam", "Mineral Wool"]
  - **Default Value:** ["Aerogel"]
  - **How to adjust:** Select from the dropdown menu. You can adjust the price (CHF/m³), thickness (cm), and thermal conductivity (W/m·K) of the insulation by using the settings modal (button on the right of the insulation).

- **Window Insulation:**

  - **Effect:** Specifies the type of windows used, affecting heat loss.
  - **Options:** ["Single Pane", "Double Pane", "Triple Pane"]
  - **Default Value:** ["Double Pane"]
  - **How to adjust:** Select from the dropdown menu. The configuration window (right button) allows you to specify the "Window Size" (Small, Medium, Large) and displays the composition of the window.

- **Number of Floors:**
  - **Effect:** Increases or decreases the surface area of the walls, thus impacting the total heat loss.
  - **Options:** ["1 Floor", "2 Floors"]
  - **Default Value:** ["1 Floor"]
  - **How to adjust:** Select from the dropdown menu.

**3. Electricity Cost:**

- **Electricity Cost:**
  - **Effect:** Sets the cost of electricity (CHF/kWh), used to calculate the total cost of heat loss over the simulation duration.
  - **Range:** ["0.00 to 1.00"]
  - **Default Value:** ["0.22"]
  - **How to adjust:** Enter a value directly.

**4. Temperatures:**

- **Indoor Temperature:**

  - **Effect:** Sets the desired temperature inside the house, impacting the heat loss calculation. A larger difference between indoor and outdoor temperatures results in higher heat loss.
  - **Range:** ["5°C to 35°C"]
  - **Default Value:** ["22°C"]
  - **How to adjust:** Use the slider.

- **Outdoor Temperature:**
  - **Effect:** Allows overriding the outdoor temperature determined by the "Location of Simulation." Used to model specific temperature scenarios. The override function is enabled by ticking the "Override Temperature" checkbox.
  - **Range:** ["-10°C to 35°C"]
  - **How to adjust:** Use the slider after enabling the override.

### Visualization and Analysis

- **Visualize Button:** Displays a 3D model of the house and shows real-time heat loss from walls and windows. Each arrow represents the heat loss for the component for the current day. If you want to compute the total heat loss, you have to sum all the arrows. The timeline slider beneath the visualization controls the current date within the simulation period.
- **Analyze Button:** Switches to the analysis view, presenting a line graph of the simulated heat loss over the specified duration. You can select to analyze the results for 1 Month, 6 Months, 1 Year, or 3 Years. The graph shows heat loss (blue line) and outdoor temperature (purple line). You can download the chart data as an image or a CSV file using the buttons provided.

### Timeline Slider

The timeline slider at the bottom of the visualization controls the point in time being viewed, showing how heat loss changes throughout the simulation. It also dynamically updates the summary information above the house visualization. You can also adjust the playback speed of the simulation by using the button located on the right side of the slider.

### Information Section

This section displays a summary of the current simulation state including:

- Date
- Season
- Outdoor Temperature
- Indoor Temperature
- Heat Loss for the day

The total section displays the current total of:

- Heat Loss (Kilowatt/Megawatt)
- Electricity Cost (CHF)
- House Wall Area (m²)
- Wall Cost (CHF)

### Credits

The house and tree models are created by [Sloyd.ai](https://www.sloyd.ai). All rights reserved by Sloyd for these models.

## Known issues

### MUI Box

Three.js and MUI can encounter conflicts when using the `Box` component from MUI. To resolve this issue, you can consider the following options:

- **Upgrade to MUI 6**: This may resolve the conflict, so it's worth testing.
- **Use the `Box` component with a `div`**: Replace Box with `<Box component="div">...</Box>` to mitigate the issue.
- **Avoid using `Box` altogether**: Instead, opt for the `Stack` component, which may provide a suitable alternative without conflicts.

### Simulation doesn't work without the 3D House

To simplify the code, I moved the responsibility of registering house components (walls and windows) directly to the 3D models. This aimed to avoid duplicating logic for handling both the 3D representation and the definition of house components.

However, this introduced a problem. When hiding the house to display graphics, the unmounting of its components (walls and windows) removes them from the simulation. Also, changes like modifying the number of floors aren't applied until the house is displayed again.

Two solutions exist:

- Prevent unmounting by using visibility: hidden in CSS.
- Decouple the logic and 3D representation.

Due to time constraints, I chose the first solution. The second solution, while ideal, would be preferable given more time.
