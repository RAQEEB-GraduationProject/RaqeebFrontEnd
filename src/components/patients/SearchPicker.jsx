import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";

import getInitials from "./getInitials";

/*
  Generic "Add …" row that expands into a searchable list.
  items: [{ id, title, subtitle }]
*/
const SearchPicker = ({ items, placeholder, searchPlaceholder, onPick }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return items;

    return items.filter((item) =>
      `${item.title} ${item.subtitle ?? ""}`.toLowerCase().includes(term),
    );
  }, [items, query]);

  const pick = (item) => {
    onPick(item.id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="rounded-xl border border-line bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] text-muted-strong"
      >
        <Search size={18} className="text-muted" />

        <span className="flex-1">{placeholder}</span>

        <ChevronRight
          size={16}
          className={`text-muted transition ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-line-soft p-3">
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-field bg-white px-4 py-2.5 text-[15px] outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus/25"
          />

          <ul className="mt-2 max-h-56 overflow-y-auto">
            {visible.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-muted">
                No results
              </li>
            ) : (
              visible.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => pick(item)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-surface-soft"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-avatar text-xs font-bold text-on-avatar">
                      {getInitials(item.title)}
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold text-ink">
                        {item.title}
                      </span>

                      {item.subtitle && (
                        <span className="block truncate text-xs text-muted-strong">
                          {item.subtitle}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchPicker;
