import { useId } from "react";

export default function FormField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  placeholder,
  icon,
  rightSlot,
  as = "input",
  children,
  autoComplete,
  disabled,
}) {
  const id = useId();

  const baseClassName =
    "peer w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100";

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        {icon ? <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span> : null}
        {as === "select" ? (
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`${baseClassName} ${icon ? "pl-11" : ""} ${rightSlot ? "pr-12" : ""}`}
            disabled={disabled}
          >
            {children}
          </select>
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={`${baseClassName} ${icon ? "pl-11" : ""} ${rightSlot ? "pr-12" : ""}`}
            disabled={disabled}
          />
        )}
        {rightSlot ? <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div> : null}
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
