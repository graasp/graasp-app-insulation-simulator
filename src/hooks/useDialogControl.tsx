import { useState } from 'react';

type UseDialogControlReturnType = {
  open: boolean;
  handleOpen: () => void;
  handleClose: () => void;
};

export const useDialogControl = (): UseDialogControlReturnType => {
  const [open, setOpen] = useState(false);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  return {
    open,
    handleOpen,
    handleClose,
  };
};
