"use client";

type NbToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

const NbToggle = ({ checked, onChange, label }: NbToggleProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative w-[46px] h-[26px] border-[3px] border-border shrink-0 bg-black"
    >
      <span
        className="absolute top-[2px] left-[2px] w-4 h-4 transition-transform duration-150"
        style={{
          background: "var(--accent-bg)",
          transform: checked ? "translateX(20px)" : "translateX(0)",
        }}
      />
    </button>
  );
};

export default NbToggle;
