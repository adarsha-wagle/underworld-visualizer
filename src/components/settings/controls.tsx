import { Gamepad2 } from "lucide-react";

const options = [
  {
    id: 1,
    label: "Forward",
    key: "W",
  },
  {
    id: 2,
    label: "Backward",
    key: "S",
  },
  {
    id: 3,
    label: "Left",
    key: "A",
  },
  {
    id: 4,
    label: "Right",
    key: "D",
  },
  {
    id: 5,
    label: "Sprint",
    key: "Shift",
  },
  {
    id: 6,
    label: "Cursor Lock / Unlock",
    key: "Esc",
  },
  {
    id: 7,
    label: "Rotate",
    key: "Mouse",
  },
];

function Controls() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
          <Gamepad2 className="w-8 h-8 text-cyan-400" />
          Control Settings
        </h1>
        <p className="text-blue-200/80 text-lg">Just Wasd keyword</p>
      </div>

      <div>
        {/* Keyboard Shortcuts */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2 className="w-5 h-5 text-cyan-300" />
            <h3 className="text-xl font-semibold text-cyan-100">
              Keyboard Shortcuts
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {options.map((option) => (
              <div className="flex justify-between items-center py-2 px-3 bg-slate-700/30 rounded">
                <span className="text-blue-100">{option.label}</span>
                <kbd className="px-2 py-1 bg-slate-600 rounded text-cyan-300 text-sm">
                  {option.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Controls;
