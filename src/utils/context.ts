export const undefinedContextErrorFactory = (contextName: string): Error =>
  new Error(
    `The ${contextName} context is being used, but the corresponding provider is not found. Please ensure that the provider is defined and properly wrapped around the component.`,
  );
