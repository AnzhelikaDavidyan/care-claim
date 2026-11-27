# T1 — Doctors list (by hand, no libraries)

**Timebox:** 45 min for the first working pass, then polish. Talk out loud. No AI for the solution.
**Branch:** `t1-doctors-list`
**Screen:** `/doctors`, the v3 mockup's "Doctors" artboard.

## Goal

A member opens Doctors, finds the right doctor by name, clinic or specialty, and clicks **Book**.
Product reason: the faster people find a doctor, the more bookings get made. A metric to quote: % of
searches that end with a click on Book.

## Already done (markup, don't spend time on it)

| File | What it is |
| --- | --- |
| `features/doctors/pages/DoctorsPage.tsx` | Full page JSX. **Your code goes in the `TODO(T1)` stub block.** |
| `features/doctors/components/DoctorsFilters.tsx` | Controlled search input + specialty select (`query`, `specialty`, `onQueryChange`, `onSpecialtyChange`) |
| `features/doctors/components/DoctorCard.tsx` | One card; the Book link goes to `/doctors/:id/book` |
| `features/doctors/components/DoctorsGrid.tsx` | `DoctorsGrid` and `DoctorsGridSkeleton` (loading state) |
| `shared/ui/StatePanel.tsx` | `ErrorState` and `EmptyState` with an `action` slot |
| `features/doctors/types.ts` | `Doctor`, `Specialty`, `SPECIALTIES` |

You can change any of it if your logic needs a different prop.

## You write

| File | What |
| --- | --- |
| `src/api/doctors.ts` | `fetchDoctors({ q, specialty }, signal)`: builds the URL, passes the `AbortSignal`, **throws on non-2xx**, returns `Promise<Doctor[]>` |
| `src/shared/hooks/useDebounce.ts` | `useDebounce<T>(value: T, delayMs: number): T`, your own, no lodash |
| `DoctorsPage.tsx` (stub block) | URL params, debounce, fetching with abort, loading / error / empty / success, Retry, Clear search |
| `DoctorsPage.test.tsx` + `useDebounce.test.ts` | Tests (below) |

## API

`GET /api/doctors?q=<text>&specialty=<Specialty>` → `200 Doctor[]`. The server filters:
`q` matches doctor name or clinic, case-insensitive; leave a param out to not filter by it.
In the browser the mock waits 300–1200 ms and fails ~10% of the time with
`500 { "message": "Random server error (mock)" }`, so you will see your error state.

## Acceptance criteria

- [ ] On load, the grid shows skeletons, then the doctors.
- [ ] Typing in Search updates the input **immediately**; the request goes **300 ms after the last keystroke**.
- [ ] Search and specialty live in the URL: `/doctors?q=bastille&specialty=Dentist`. Reload and the Back button keep them. Empty values are removed from the URL, not written as `?q=`.
- [ ] Results come from the request; they are **not** copied into a second piece of state (derive, don't duplicate).
- [ ] When the search changes before the last request finished, the old request is **aborted**. A slow old response never overwrites a newer one.
- [ ] An aborted request does **not** show the error panel.
- [ ] A failed request shows "Could not load doctors" with the message; **Retry** fetches again with the same filters.
- [ ] No match shows "No doctors match your search"; **Clear search** empties both filters (input and URL).
- [ ] Subtitle shows the count, e.g. "24 doctors".
- [ ] No `react-hooks` warnings, no `any`.

## Tests (at least these)

1. **Page:** renders doctors after loading. Use `renderApp('/doctors')` from `src/test/render.tsx`.
2. **Page:** typing a name filters the list, and `?q=` appears in `router.state.location.search`.
3. **Page:** a 500 shows the error panel; Retry then shows doctors. Override the handler for one request:
   `server.use(http.get('/api/doctors', () => HttpResponse.json({ message: 'boom' }, { status: 500 }), { once: true }))`.
4. **useDebounce:** with `vi.useFakeTimers()`, the value changes only after the delay.

Run with `npm test`. Prefer `getByRole` / `findByRole` over test ids.

## Hints (no solutions)

- `useSearchParams()` from `react-router`. `setSearchParams` takes a function too, so you can keep the other param.
- What does the fetch effect depend on: the raw query, or the debounced one?
- Cleanup function of the effect + `AbortController`. How do you tell an abort error from a real one?
- Retry needs something that changes to make the effect run again.
- Where should loading start: when the user types, or when the request starts?

## Be ready to explain

- The race condition you prevented, and why cleanup in the effect fixes it.
- Why results are derived from the response and the URL, not mirrored into state.
- Why the search lives in the URL (shareable, survives reload, Back button works).
- Server-side vs client-side filtering for 24 doctors vs 20,000.

## After the task: 3 lines

1. What was hard:
2. What I'd say in the interview:
3. Product reason (user + metric):
