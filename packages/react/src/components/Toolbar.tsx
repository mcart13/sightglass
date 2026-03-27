let toolbarWarned = false;

/** @deprecated Use EditorPanel instead. Toolbar is now integrated into EditorPanel. */
export const Toolbar = () => {
  if (!toolbarWarned) {
    console.warn(
      "[@sightglass/react] <Toolbar /> is deprecated. Use <EditorPanel /> instead, which includes the toolbar."
    );
    toolbarWarned = true;
  }
  return null;
};
