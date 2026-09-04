import { inputClassName } from './FormField.tsx';

export function utcTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DateInput({
  id,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}) {
  const pickerValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="YYYY-MM-DD"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClassName} pr-10 placeholder:text-slate-400`}
      />
      <span className="pointer-events-none absolute inset-y-0 right-0 z-0 flex w-10 items-center justify-center text-slate-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.75A2.75 2.75 0 0 1 18.5 6.75v8.5A2.75 2.75 0 0 1 15.75 18H4.25A2.75 2.75 0 0 1 1.5 15.25v-8.5A2.75 2.75 0 0 1 4.25 4H5V2.75A.75.75 0 0 1 5.75 2Zm-2.5 8.5v4.75c0 .69.56 1.25 1.25 1.25h11.5c.69 0 1.25-.56 1.25-1.25V10.5H3.25Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <input
        type="date"
        min={min}
        max={max}
        value={pickerValue}
        onChange={(event) => onChange(event.target.value)}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const picker = e.currentTarget;
          if (typeof picker.showPicker !== 'function') {
            return;
          }
          try {
            picker.showPicker();
          } catch {
            // Safari / older Chrome
          }
        }}
        aria-label="Open calendar"
        tabIndex={-1}
        className="date-picker-hitarea absolute inset-y-0 right-0 z-10 w-10 cursor-pointer border-0 bg-transparent text-transparent outline-none"
      />
    </div>
  );
}
