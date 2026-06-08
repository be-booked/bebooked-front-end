interface AddServiceButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

/**
 * The inline "+ Add a service" ghost trigger button.
 * Used in setup/page.tsx and account/ServicesSection.tsx.
 */
export function AddServiceButton({
  onClick,
  disabled = false,
  label = "Add a service",
}: AddServiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 mt-[10px] py-[10px] bg-transparent border-none cursor-pointer text-sm font-medium text-warm-gray disabled:text-muted disabled:cursor-not-allowed"
    >
      <span className="size-5 border-[1.5px] border-stone inline-flex items-center justify-center text-sm">
        +
      </span>
      {label}
    </button>
  );
}
