import { createContext, useContext } from "react";

interface ISettingsContext {
  isNoise: boolean;
  setIsNoise: (value: boolean) => void;
  volumeLevel: number;
  setVolumeLevel: (value: number) => void;
}

const SettingsContext = createContext<ISettingsContext | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

const DEFAULT_SETTINGS: ISettingsContext = {
  isNoise: true,
  setIsNoise: () => {},
  volumeLevel: 0.5,
  setVolumeLevel: () => {},
};

export const SettingsProvider = ({
  children,
  value = DEFAULT_SETTINGS,
}: {
  children: React.ReactNode;
  value?: ISettingsContext;
}) => {
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
