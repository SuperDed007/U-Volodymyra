import React, { useMemo, useState } from "react";

const CATEGORIES = [
  { id: "snidanky", name: "Сніданки" },
  { id: "salaty", name: "Салати" },
  { id: "supy", name: "Супи" },
  { id: "napoyi", name: "Напої" },
];

const MENU = [
  {
    id: "omlet-klasychny",
    category: "snidanky",
    name: "Омлет класичний",
    desc: "3 яйця, молоко, зелень, подається з тостом",
    price: 145,
    weight: "220 г",
    image: "https://picsum.photos/seed/omlet/640/480",
    modifiers: [
      {
        id: "dodatky",
        name: "Додатки",
        type: "multi",
        required: false,
        options: [
          { id: "bacon", name: "Бекон", price: 60 },
          { id: "cheese", name: "Сир", price: 35 },
          { id: "avocado", name: "Авокадо", price: 45 },
        ],
        limit: 3,
      },
      {
        id: "sous",
        name: "Соус",
        type: "single",
        required: false,
        options: [
          { id: "tomato", name: "Томатний", price: 0 },
          { id: "garlic", name: "Часниковий", price: 10 },
        ],
      },
    ],
  },
  {
    id: "syriaky",
    category: "snidanky",
    name: "Сирники з сметаною",
    desc: "Домашні сирники, сметана та ягідний соус",
    price: 165,
    weight: "240 г",
    image: "https://picsum.photos/seed/syrnyky/640/480",
    modifiers: [
      {
        id: "toping",
        name: "Топінг",
        type: "single",
        required: false,
        options: [
          { id: "berry", name: "Ягідний соус", price: 0 },
          { id: "caramel", name: "Карамель", price: 10 },
        ],
      },
    ],
  },
  {
    id: "gretskyi-salat",
    category: "salaty",
    name: "Грецький салат",
    desc: "Огірок, помідор, фета, оливки, заправка",
    price: 185,
    weight: "260 г",
    image: "https://picsum.photos/seed/greek/640/480",
  },
  {
    id: "borsch",
    category: "supy",
    name: "Борщ український",
    desc: "З Pampushky та сметаною",
    price: 155,
    weight: "300 г",
    image: "https://picsum.photos/seed/borshch/640/480",
  },
  {
    id: "kapuchino",
    category: "napoyi",
    name: "Капучино",
    desc: "Еспресо з молоком",
    price: 75,
    weight: "250 мл",
    image: "https://picsum.photos/seed/cappuccino/640/480",
    modifiers: [
      {
        id: "milk",
        name: "Молоко",
        type: "single",
        required: false,
        options: [
          { id: "cow", name: "Звичайне", price: 0 },
          { id: "oat", name: "Вівсяне", price: 10 },
          { id: "almond", name: "Мигдальне", price: 15 },
        ],
      },
      {
        id: "size",
        name: "Розмір",
        type: "single",
        required: true,
        options: [
          { id: "250", name: "250 мл", price: 0 },
          { id: "350", name: "350 мл", price: 15 },
          { id: "450", name: "450 мл", price: 25 },
        ],
      },
    ],
  },
];

const formatUAH = (n) => new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH", maximumFractionDigits: 0 }).format(n);
function classNames(...x) { return x.filter(Boolean).join(" "); }

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center">
        <div className="md:max-w-2xl w-full bg-white rounded-t-3xl md:rounded-2xl shadow-xl p-4 md:p-6 mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

function Drawer({ open, onClose, side = "right", children }) {
  if (!open) return null;
  const sideClasses = side === "right" ? "right-0" : "left-0";
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={classNames("absolute top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl p-4", sideClasses)}>
        {children}
      </div>
    </div>
  );
}

export default function MenuApp() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
  const [modalItem, setModalItem] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MENU.filter((m) =>
      (activeCat ? m.category === activeCat : true) &&
      (q ? (m.name.toLowerCase().includes(q) || (m.desc?.toLowerCase().includes(q))) : true)
    );
  }, [search, activeCat]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + lineTotal(item), 0);
  }, [cart]);

  function lineTotal(item) {
    const modsSum = item.modifiers?.reduce((s, mod) => s + (mod.option?.price || 0), 0) || 0;
    return (item.basePrice + modsSum) * item.qty;
  }

  function addToCart(product, draft) {
    const newLine = {
      id: `${product.id}-${Date.now()}`,
      sku: product.id,
      name: product.name,
      basePrice: product.price,
      qty: draft.qty,
      note: draft.note || "",
      modifiers: draft.selected,
    };
    setCart((c) => [...c, newLine]);
    setModalItem(null);
    setCartOpen(true);
  }

  function removeLine(id) {
    setCart((c) => c.filter((l) => l.id !== id));
  }

  function updateQty(id, delta) {
    setCart((c) => c.map((l) => (l.id === id ? { ...l, qty: Math.max(1, l.qty + delta) } : l)));
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-neutral-900 text-white flex items-center justify-center rounded-xl font-bold">U</div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold leading-tight">Меню Volodymyra</h1>
            <p className="text-xs text-neutral-500">Онлайн-замовлення без черги</p>
          </div>
          <div className="hidden md:block">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук по меню…"
              className="w-80 px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100"
          >
            <span className="font-medium">Кошик</span>
          </button>
        </div>
        <div className="md:hidden px-4 pb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук по меню…"
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <div className="border-t border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 py-2 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={classNames(
                    "px-3 py-1.5 rounded-2xl border",
                    activeCat === c.id
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {filteredItems.length === 0 && (
          <p className="text-neutral-500">Нічого не знайдено. Спробуйте змінити запит.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <article key={item.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-neutral-100">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex flex-col gap-2">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-sm text-neutral-600 line-clamp-2 min-h-[40px]">{item.desc}</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-neutral-800 font-semibold">{formatUAH(item.price)}</div>
                  <div className="text-xs text-neutral-500">{item.weight}</div>
                </div>
                <button
                  onClick={() => setModalItem(item)}
                  className="mt-2 w-full bg-neutral-900 text-white rounded-xl py-2 font-medium hover:bg-neutral-800"
                >
                  Додати
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      <ItemModal item={modalItem} onClose={() => setModalItem(null)} onAdd={addToCart} />

      <Drawer open={cartOpen} onClose={() => setCartOpen(false)}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b">
            <h2 className="text-lg font-semibold">Ваш кошик</h2>
            <button onClick={() => setCartOpen(false)} className="p-2 rounded-lg hover:bg-neutral-100">✕</button>
          </div>

          <div className="flex-1 overflow-auto divide-y">
            {cart.length === 0 && (
              <p className="p-4 text-neutral-500">Кошик порожній</p>
            )}
            {cart.map((l) => (
              <div key={l.id} className="p-4 flex gap-3">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{l.name}</div>
                      {l.modifiers?.length > 0 && (
                        <ul className="mt-1 text-sm text-neutral-600 list-disc list-inside">
                          {l.modifiers.map((m, i) => (
                            <li key={i}>{m.groupName}: {m.option?.name} {m.option?.price ? `(+${formatUAH(m.option.price)})` : ""}</li>
                          ))}
                        </ul>
                      )}
                      {l.note && <div className="mt-1 text-xs text-neutral-500">Примітка: {l.note}</div>}
                    </div>
                    <div className="text-right whitespace-nowrap font-semibold">{formatUAH(lineTotal(l))}</div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="inline-flex items-center border rounded-xl">
                      <button onClick={() => updateQty(l.id, -1)} className="px-3 py-1 hover:bg-neutral-100">−</button>
                      <span className="px-3">{l.qty}</span>
                      <button onClick={() => updateQty(l.id, 1)} className="px-3 py-1 hover:bg-neutral-100">＋</button>
                    </div>
                    <button onClick={() => removeLine(l.id)} className="ml-auto text-sm text-red-600 hover:underline">Видалити</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span>Сума</span>
              <span className="font-semibold">{formatUAH(cartTotal)}</span>
            </div>
            <button className="w-full py-3 rounded-2xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800">Оформити замовлення</button>
            <p className="text-xs text-neutral-500 text-center">Тут можна підключити оплату (LiqPay/WayForPay) або відправку в Telegram/CRM.</p>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

function ItemModal({ item, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState([]);

  React.useEffect(() => {
    if (item) {
      setQty(1);
      setNote("");
      const pre = (item.modifiers || [])
        .filter((g) => g.required && g.type === "single" && g.options?.length)
        .map((g) => ({ groupId: g.id, groupName: g.name, option: g.options[0] }));
      setSelected(pre);
    }
  }, [item]);

  if (!item) return null;

  function toggleOption(group, option) {
    setSelected((prev) => {
      const idx = prev.findIndex((s) => s.groupId === group.id);
      if (group.type === "single") {
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { groupId: group.id, groupName: group.name, option };
          return next;
        }
        return [...prev, { groupId: group.id, groupName: group.name, option }];
      }
      const exists = idx >= 0 && prev[idx].option?.id === option.id;
      if (exists) {
        return prev.filter((s) => !(s.groupId === group.id && s.option?.id === option.id));
      }
      return [...prev, { groupId: group.id, groupName: group.name, option }];
    });
  }

  function isSelected(group, option) {
    return selected.some((s) => s.groupId === group.id && s.option?.id === option.id);
  }

  const modsSum = selected.reduce((s, m) => s + (m.option?.price || 0), 0);
  const total = (item.price + modsSum) * qty;

  function handleAdd() {
    const requiredSingles = (item.modifiers || []).filter((g) => g.required && g.type === "single");
    for (const g of requiredSingles) {
      if (!selected.some((s) => s.groupId === g.id)) {
        alert(`Виберіть опцію для групи: ${g.name}`);
        return;
      }
    }
    onAdd(item, { qty, note, selected });
  }

  return (
    <Modal open={!!item} onClose={onClose}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl overflow-hidden bg-neutral-100">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-semibold">{item.name}</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100">✕</button>
          </div>
          {item.desc && <p className="mt-1 text-neutral-600">{item.desc}</p>}
          {item.weight && <p className="mt-1 text-sm text-neutral-500">{item.weight}</p>}

          <div className="mt-4 space-y-4">
            {(item.modifiers || []).map((g) => (
              <div key={g.id}>
                <div className="text-sm font-medium mb-2">
                  {g.name} {g.required && <span className="text-red-600">*</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.options?.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => toggleOption(g, o)}
                      className={classNames(
                        "px-3 py-1.5 rounded-2xl border text-sm",
                        isSelected(g, o)
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100"
                      )}
                    >
                      {o.name}
                      {o.price ? ` · +${formatUAH(o.price)}` : ""}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="inline-flex items-center border rounded-xl">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-1 hover:bg-neutral-100">−</button>
              <span className="px-3">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-1 hover:bg-neutral-100">＋</button>
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Додати примітку (без цибулі, тощо)"
              className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={handleAdd} className="flex-1 py-3 rounded-2xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800">
              Додати до кошика · {formatUAH(total)}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}