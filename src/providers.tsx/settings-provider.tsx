import { isDevelopment } from "@/constants/env";
import { createContext, useContext, useReducer } from "react";

interface ISettingState {
  isNoiseEnabled: boolean;
  isVignetteEnabled: boolean;
  isBloomEnabled: boolean;
  chromaticAberration: number;
}

type TSettingAction =
  | {
      type: "SET_IS_NOISE_ENABLED";
      payload: boolean;
    }
  | {
      type: "SET_IS_VIGNETTE_ENABLED";
      payload: boolean;
    }
  | {
      type: "SET_IS_BLOOM_ENABLED";
      payload: boolean;
    }
  | {
      type: "SET_CHROMATIC_ABERRATION";
      payload: number;
    }
  | {
      type: "SET_DISPLAY_SETTINGS";
      payload: ISettingState;
    };

interface ISettingsContext extends ISettingState {
  dispatch: React.Dispatch<TSettingAction>;
}

const SettingsContext = createContext<ISettingsContext | null>(null);

const settingReducer = (state: ISettingState, action: TSettingAction) => {
  switch (action.type) {
    case "SET_IS_NOISE_ENABLED":
      return { ...state, isNoiseEnabled: action.payload };
    case "SET_IS_VIGNETTE_ENABLED":
      return { ...state, isVignetteEnabled: action.payload };
    case "SET_IS_BLOOM_ENABLED":
      return { ...state, isBloomEnabled: action.payload };
    case "SET_CHROMATIC_ABERRATION":
      return { ...state, chromaticAberration: action.payload };
    case "SET_DISPLAY_SETTINGS":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(settingReducer, {
    isNoiseEnabled: isDevelopment ? false : true,
    isVignetteEnabled: isDevelopment ? false : true,
    isBloomEnabled: isDevelopment ? false : true,
    chromaticAberration: 0.001,
  });
  return (
    <SettingsContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
