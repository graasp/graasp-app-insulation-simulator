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

The app's purpose is to help users understand and reduce heat loss through conduction in a house by testing various insulation materials, including advanced options like aerogel. Users can customize energy costs and the duration of the simulation (e.g., 1 year or 25 years) to see how these factors affect heat retention and energy efficiency over time. The app simulates heat loss scenarios based on user inputs, comparing them against a baseline to calculate energy savings and cost benefits. This allows users to visualize and quantify the impact of improved insulation on reducing heat loss by conduction.

## GitHub Repo setup

If you choose to deploy your app with the provided GitHubActions workflows you will need to create the following secrets:

- `APP_ID`: a UUID v4 that identifies your app for deployment
- `APP_KEY`: a UUID v4 that authorizes your app with the Graasp API
- `SENTRY_DSN`: your Sentry url to report issues and send telemetry

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

This approach simplifies the process of updating or adding a 3D model. To do so, simply place the model in the `public/models` folder and run the `npx gltfjsx` command. Afterward, move the original model into the `/models` folder (if we want to conserve the original) and store the generated code in the `src/modules/models` directory. It is also recommended to extract the logic from this component into a custom hook, making it modular and reusable while keeping the component clean and focused on rendering.

If an existing model is updated, we should replace the type and the React component group while leaving the logic hooks untouched. This approach ensures that the code remains valid and functional, as the underlying logic and behavior are preserved, reducing the risk of introducing errors.

The positions of the meshes within the group are auto-generated, and they should never be manually modified. If an object needs to be repositioned, adjust its `position` prop applied directly to the group instead. This maintains consistency and ensures the auto-generated structure remains intact while allowing for flexible positioning.

### Credits

The house and tree models are created by [Sloyd.ai](https://www.sloyd.ai). All rights reserved by Sloyd for these models.

## Known issues

Three.js and MUI can encounter conflicts when using the `Box` component from MUI. To resolve this issue, you can consider the following options:

- **Upgrade to MUI 6**: This may resolve the conflict, so it's worth testing.
- **Use the `Box` component with a `div`**: Replace Box with `<Box component="div">...</Box>` to mitigate the issue.
- **Avoid using `Box` altogether**: Instead, opt for the `Stack` component, which may provide a suitable alternative without conflicts.
