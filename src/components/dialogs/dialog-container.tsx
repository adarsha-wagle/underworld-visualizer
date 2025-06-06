import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import Menu from "./menu";
import { Settings, X } from "lucide-react";
import { Button } from "../ui/button";
import SettingsContainer from "../settings/settings-container";

function DialogContainer() {
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState<boolean>(true);
  const [isSettingDialogOpen, setIsSettingDialogOpen] =
    useState<boolean>(false);
  const [settingDialogOpenSrc, setSettingDialogOpenSrc] = useState<
    "menu" | "canvas"
  >("menu");

  const closeHelpDialog = () => {
    if (settingDialogOpenSrc === "menu") {
      setIsMenuDialogOpen(true);
    }
    setIsSettingDialogOpen(false);
  };
  const openSettingsDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuDialogOpen(false);
    setIsSettingDialogOpen(true);
  };

  return (
    <>
      {!isMenuDialogOpen && !isSettingDialogOpen && (
        <div className="absolute top-4 right-2 z-50">
          <Button
            onClick={(e) => {
              setSettingDialogOpenSrc("canvas");
              openSettingsDialog(e);
            }}
          >
            <Settings className="size-10 text-white" />
          </Button>
        </div>
      )}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent
          aria-describedby="audio-selection"
          className="p-0 [&>button]:hidden border-0 shadow-none ring-0 outline-none h-full rounded-none bg-transparent max-w-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-4 right-2 z-50">
            <Button
              onClick={(e) => {
                setSettingDialogOpenSrc("menu");
                openSettingsDialog(e);
              }}
            >
              <Settings className="size-10 text-white" />
            </Button>
          </div>
          <DialogHeader className="hidden">
            <DialogTitle>Audio Selection</DialogTitle>
          </DialogHeader>
          <Menu closeDialog={() => setIsMenuDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      <Dialog open={isSettingDialogOpen} onOpenChange={setIsSettingDialogOpen}>
        <DialogContent
          aria-describedby="audio-selection"
          className="p-0 [&>button]:hidden border-0 shadow-none ring-0 outline-none h-full max-w-full rounded-none flex items-center justify-center bg-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-4 right-2 z-50">
            <Button onClick={closeHelpDialog}>
              <X className="size-10 text-white fill-white" />
            </Button>
          </div>
          <DialogHeader className="hidden">
            <DialogTitle>Help </DialogTitle>
          </DialogHeader>
          <SettingsContainer />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DialogContainer;
