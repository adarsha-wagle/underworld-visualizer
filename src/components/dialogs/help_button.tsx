import { Button } from "@/components/ui/button";
import { X, CircleHelp } from "lucide-react";

type THelpButtonProps = {
  closeDialog: () => void;
  openDialog: () => void;
  isDialogOpen: boolean;
};

function HelpButton({
  closeDialog,
  openDialog,
  isDialogOpen,
}: THelpButtonProps) {
  return (
    <div className="absolute top-4 right-2 z-50">
      {isDialogOpen ? (
        <Button onClick={closeDialog}>
          <X className="size-10 text-white fill-white" />
        </Button>
      ) : (
        <Button onClick={openDialog}>
          <CircleHelp className="size-10 text-white fill-white" />
        </Button>
      )}
    </div>
  );
}

export default HelpButton;
