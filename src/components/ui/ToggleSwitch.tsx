type Props = {
  checked: boolean;
  onChange: () => void;
  label?: string;
};

export default function ToggleSwitch({ checked, onChange, label }: Props) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex items-center gap-2 cursor-pointer"
    >
      <div
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-gray-300"}`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
        />
      </div>
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </button>
  );
}
