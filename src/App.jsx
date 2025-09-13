
import React, { useMemo, useReducer, useState } from "react";

/**
 * AccuKnox – Dynamic Dashboard Assignment (React + useReducer)
 * Features:
 *  - JSON-driven categories & widgets
 *  - Add / remove widgets per category
 *  - Global widget registry + search
 *  - Checkbox assignment of widgets to categories
 *
 * How to run (see README):
 */

const initialJSON = {
  categories: [
    {
      id: "cspm",
      name: "CSPM Executive Dashboard",
      widgets: [
        { id: "w1", name: "Risk Overview", text: "Current risk posture at a glance." },
        { id: "w2", name: "Policy Drift", text: "Drift detected across 4 accounts." },
      ],
    },
    {
      id: "kspm",
      name: "KSPM Insights",
      widgets: [{ id: "w3", name: "Cluster Health", text: "All clusters healthy in last 24h." }],
    },
  ],
};

const ACTIONS = {
  ADD_WIDGET_TO_CATEGORY: "ADD_WIDGET_TO_CATEGORY",
  REMOVE_WIDGET_FROM_CATEGORY: "REMOVE_WIDGET_FROM_CATEGORY",
  REGISTER_GLOBAL_WIDGET: "REGISTER_GLOBAL_WIDGET",
  TOGGLE_WIDGET_IN_CATEGORY: "TOGGLE_WIDGET_IN_CATEGORY",
};

function dashboardReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_WIDGET_TO_CATEGORY: {
      const { categoryId, widget } = action.payload;
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === categoryId ? { ...cat, widgets: [...cat.widgets, widget] } : cat
        ),
        allWidgets: dedupeById([...state.allWidgets, widget]),
      };
    }
    case ACTIONS.REMOVE_WIDGET_FROM_CATEGORY: {
      const { categoryId, widgetId } = action.payload;
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === categoryId ? { ...cat, widgets: cat.widgets.filter((w) => w.id !== widgetId) } : cat
        ),
      };
    }
    case ACTIONS.REGISTER_GLOBAL_WIDGET: {
      const { widget } = action.payload;
      if (state.allWidgets.some((w) => w.id === widget.id)) return state;
      return { ...state, allWidgets: [...state.allWidgets, widget] };
    }
    case ACTIONS.TOGGLE_WIDGET_IN_CATEGORY: {
      const { categoryId, widget } = action.payload;
      const category = state.categories.find((c) => c.id === categoryId);
      const present = category.widgets.some((w) => w.id === widget.id);
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === categoryId
            ? present
              ? { ...cat, widgets: cat.widgets.filter((w) => w.id !== widget.id) }
              : { ...cat, widgets: [...cat.widgets, widget] }
            : cat
        ),
      };
    }
    default:
      return state;
  }
}

function buildInitialState(json) {
  const all = json.categories.flatMap((c) => c.widgets);
  return { ...json, allWidgets: dedupeById(all) };
}
function dedupeById(arr) {
  const map = new Map();
  arr.forEach((x) => map.set(x.id, x));
  return Array.from(map.values());
}

export default function App() {
  const [state, dispatch] = useReducer(dashboardReducer, initialJSON, buildInitialState);
  const [activeCategory, setActiveCategory] = useState(state.categories[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const currentCategory = useMemo(() => state.categories.find((c) => c.id === activeCategory), [state.categories, activeCategory]);

  const filteredWidgets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return state.allWidgets;
    return state.allWidgets.filter((w) => w.name.toLowerCase().includes(q) || w.text.toLowerCase().includes(q));
  }, [state.allWidgets, search]);

  function handleAddWidget(categoryId, { name, text }) {
    const id = genId(name);
    const widget = { id, name, text };
    dispatch({ type: ACTIONS.ADD_WIDGET_TO_CATEGORY, payload: { categoryId, widget } });
    dispatch({ type: ACTIONS.REGISTER_GLOBAL_WIDGET, payload: { widget } });
  }

  function handleRemoveWidget(categoryId, widgetId) {
    dispatch({ type: ACTIONS.REMOVE_WIDGET_FROM_CATEGORY, payload: { categoryId, widgetId } });
  }

  function toggleAssign(categoryId, widget) {
    dispatch({ type: ACTIONS.TOGGLE_WIDGET_IN_CATEGORY, payload: { categoryId, widget } });
  }

  return (
    <div className="app">
      <Header />
      <main className="layout">
        <aside className="sidebar">
          <h3>All Widgets</h3>
          <input placeholder="Search widgets..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="assign-list">
            {state.categories.map((cat) => (
              <details key={cat.id}>
                <summary>Assign to: {cat.name}</summary>
                <div>
                  {filteredWidgets.map((w) => {
                    const isChecked = state.categories.find((c) => c.id === cat.id)?.widgets.some((x) => x.id === w.id);
                    return (
                      <label key={w.id}>
                        <input type="checkbox" checked={!!isChecked} onChange={() => toggleAssign(cat.id, w)} />
                        <span>{w.name} — {w.text}</span>
                      </label>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </aside>

        <section className="main">
          <div className="tabs">
            {state.categories.map((cat) => (
              <button key={cat.id} className={activeCategory === cat.id ? "active" : ""} onClick={() => setActiveCategory(cat.id)}>
                {cat.name}
              </button>
            ))}
          </div>

          {currentCategory ? (
            <CategoryView category={currentCategory} onAdd={(p) => handleAddWidget(currentCategory.id, p)} onRemove={(w) => handleRemoveWidget(currentCategory.id, w)} />
          ) : (
            <div>Select a category</div>
          )}
        </section>
      </main>

      <footer className="footer">Built with React + useReducer</footer>
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <h1>AccuKnox - Dynamic Dashboard</h1>
      <p>JSON-driven · Add/Remove Widgets · Search & Assign</p>
    </header>
  );
}

function CategoryView({ category, onAdd, onRemove }) {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="card">
      <div className="card-header">
        <h2>{category.name}</h2>
        <button onClick={() => setShowForm((s) => !s)}>{showForm ? "Close" : "+ Add Widget"}</button>
      </div>

      {showForm && <AddWidgetForm onSubmit={(w) => { onAdd(w); setShowForm(false); }} />}

      {category.widgets.length === 0 ? (
        <div className="muted">No widgets yet. Click "+ Add Widget" to create one.</div>
      ) : (
        <div className="grid">
          {category.widgets.map((w) => <WidgetCard key={w.id} widget={w} onRemove={() => onRemove(w.id)} />)}
        </div>
      )}
    </div>
  );
}

function AddWidgetForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), text: text.trim() || "Sample widget text" });
    setName(""); setText("");
  }
  return (
    <form onSubmit={handleSubmit} className="add-form">
      <input placeholder="Widget name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Widget text" value={text} onChange={(e) => setText(e.target.value)} />
      <div>
        <button type="submit">Add</button>
        <button type="button" onClick={() => { setName(""); setText(""); }}>Clear</button>
      </div>
    </form>
  );
}

function WidgetCard({ widget, onRemove }) {
  return (
    <div className="widget">
      <button className="remove" onClick={onRemove}>✕</button>
      <div className="wtitle">{widget.name}</div>
      <div className="wtext">{widget.text}</div>
    </div>
  );
}

function genId(seed) {
  const base = (seed || "w").toLowerCase().replace(/\s+/g, "-").slice(0, 12);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}`;
}
