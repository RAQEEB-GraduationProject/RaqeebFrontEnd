import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import { buildSearchGroups, isDateQuery } from "./adminSearchResults";
import useAdminSearchData, { MIN_QUERY_LENGTH } from "./useAdminSearchData";

const Note = ({ children }) => (
  <p role="status" className="px-4 py-2 text-xs text-muted-strong">
    {children}
  </p>
);

const Option = ({ id, item, isActive, onSelect, onHover }) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      id={id}
      role="option"
      aria-selected={isActive}
      tabIndex={-1}
      onClick={() => onSelect(item)}
      onMouseMove={onHover}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
        isActive ? "bg-surface-muted" : ""
      }`}
    >
      <Icon size={17} strokeWidth={1.6} className="shrink-0 text-accent" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink">{item.title}</span>
        {item.subtitle && (
          <span className="block truncate text-xs text-muted-strong">{item.subtitle}</span>
        )}
      </span>
    </button>
  );
};

/*
  Admin navbar search: pages, users and patients (see adminSearchResults).
  `pages` are the routes this layout offers its role: [{ label, to, icon,
  keywords? }]. `inputRef` lets the layout focus the field (Ctrl/⌘ + K).
  Arrows move through the results, Enter opens one, Escape closes the list and
  a second Escape clears the field.
*/
const AdminSearch = ({ pages, inputRef }) => {
  const navigate = useNavigate();
  const listId = useId();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const term = query.trim();
  const { data, reset } = useAdminSearchData(term, isOpen && !isDateQuery(term));

  const groups = buildSearchGroups({ query, pages, data });
  const options = groups.flatMap((group) => group.items);
  const current = Math.min(activeIndex, options.length - 1);

  const showList = isOpen && term !== "";
  const optionId = (index) => `${listId}-option-${index}`;

  const open = () => setIsOpen(true);

  // The next search reads the lists again.
  const close = () => {
    setIsOpen(false);
    setActiveIndex(0);
    reset();
  };

  const select = (item) => {
    setQuery("");
    close();
    inputRef.current?.blur();
    navigate(item.to);
  };

  const move = (step) => {
    if (options.length === 0) return;

    const next = (current + step + options.length) % options.length;
    setActiveIndex(next);
    document.getElementById(optionId(next))?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!showList) open();
      else move(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showList && options[current]) select(options[current]);
    } else if (e.key === "Escape") {
      // Stops the browser's own "clear the search field" on the first press.
      e.preventDefault();
      if (showList) close();
      else setQuery("");
    }
  };

  // Closes when focus leaves the whole search (input and results).
  const onBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) close();
  };

  const isEmpty = groups.length === 0;
  const isShort = term.length < MIN_QUERY_LENGTH;

  // Position of each group's first item in the flat option list.
  const offsets = groups.map((_, index) =>
    groups.slice(0, index).reduce((sum, group) => sum + group.items.length, 0),
  );

  return (
    <div
      className="relative mx-auto hidden w-full max-w-[640px] md:block"
      onBlur={onBlur}
    >
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-label="Search pages, users and patients"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={showList ? listId : undefined}
        aria-activedescendant={showList && options[current] ? optionId(current) : undefined}
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
          open();
        }}
        onFocus={open}
        onClick={open}
        onKeyDown={onKeyDown}
        placeholder="Search users, patients or alerts…"
        className="w-full rounded-xl border border-field bg-surface-soft py-3 pl-11 pr-16 text-sm outline-none transition placeholder:text-muted focus:border-focus focus:bg-white focus:ring-2 focus:ring-focus/25"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-line bg-white px-2 py-0.5 text-[10px] font-semibold text-muted">
        ⌘ K
      </kbd>

      {showList && (
        <div
          id={listId}
          role="listbox"
          aria-label="Search results"
          // Keeps the focus in the input while a result is clicked.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-[min(70vh,480px)] overflow-y-auto rounded-2xl border border-line bg-white py-2 shadow-xl"
        >
          {groups.map((group, groupIndex) => (
            <div key={group.label} role="group" aria-label={group.label}>
              <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-strong">
                {group.label}
              </p>

              {group.note && <Note>{group.note}</Note>}
              {group.isLoading && <Note>Searching…</Note>}

              {group.error && (
                <p role="alert" className="px-4 py-2 text-xs text-danger-text">
                  Couldn&apos;t search {group.label.toLowerCase()}: {group.error}{" "}
                  <button type="button" onClick={reset} className="font-semibold underline">
                    Try again
                  </button>
                </p>
              )}

              {group.items.map((item, itemIndex) => {
                const index = offsets[groupIndex] + itemIndex;

                return (
                  <Option
                    key={item.key}
                    id={optionId(index)}
                    item={item}
                    isActive={index === current}
                    onSelect={select}
                    onHover={() => setActiveIndex(index)}
                  />
                );
              })}

              {group.total > group.items.length && (
                <Note>
                  Showing {group.items.length} of {group.total}. Type more to narrow the results.
                </Note>
              )}
            </div>
          ))}

          {isEmpty && <Note>No results for &ldquo;{term}&rdquo;.</Note>}

          {isShort && (
            <Note>Type at least {MIN_QUERY_LENGTH} characters to search users and patients.</Note>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSearch;
