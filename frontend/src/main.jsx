import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  BookUser,
  CalendarDays,
  Check,
  Edit3,
  Heart,
  LogOut,
  MapPin,
  Menu,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const emptyForm = {
  nama: "",
  alamat: "",
  tanggal_lahir: "",
  phones: [{ jenis: "HP", nomor_telepon: "" }],
};

async function request(path, options = {}) {
  const token = localStorage.getItem("kontak_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      body.message ||
        Object.values(body.errors || {})?.flat()?.[0] ||
        "Terjadi kesalahan.",
    );
  return body;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("kontak_token"));
  return token ? (
    <Dashboard
      onLogout={() => {
        localStorage.removeItem("kontak_token");
        setToken(null);
      }}
    />
  ) : (
    <Auth
      onSuccess={(value) => {
        localStorage.setItem("kontak_token", value);
        setToken(value);
      }}
    />
  );
}

function Auth({ onSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await request(`/${mode}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      onSuccess(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="auth-shell">
      <section className="auth-art">
        <div className="art-orbit orbit-one" />
        <div className="art-orbit orbit-two" />
        <div className="art-copy">
          <span className="eyebrow">
            <Sparkles size={15} /> YOUR PEOPLE, YOUR STORY
          </span>
          <h1>
            Keep the people
            <br />
            <em>who matter</em> close.
          </h1>
          <p>
            A calmer, more beautiful way to keep every important connection in
            one place.
          </p>
          <div className="mini-note">
            <Heart size={17} fill="currentColor" /> Made for the relationships
            that make life brighter.
          </div>
        </div>
      </section>
      <section className="auth-panel">
        <div className="brand">
          <span className="brand-mark">
            <BookUser size={21} />
          </span>
          <span>
            Kontak<span>space</span>
          </span>
        </div>
        <div className="auth-form-wrap">
          <div className="auth-heading">
            <p className="kicker">SELAMAT DATANG KEMBALI</p>
            <h2>
              {mode === "login"
                ? "Lingkaranmu menunggu."
                : "Mulai lingkaranmu."}
            </h2>
            <p>
              {mode === "login"
                ? "Masuk untuk melihat orang-orang penting dalam hidupmu."
                : "Buat akun untuk mengatur semua koneksimu."}
            </p>
          </div>
          <div className="auth-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Masuk
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              Buat akun
            </button>
          </div>
          <form onSubmit={submit}>
            {mode === "register" && (
              <label>
                Nama lengkap
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Anisa Putri"
                />
              </label>
            )}
            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                required
                minLength="6"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 karakter"
              />
            </label>
            {error && <div className="error-message">{error}</div>}
            <button className="primary-button auth-submit" disabled={loading}>
              {loading
                ? "Tunggu sebentar..."
                : mode === "login"
                  ? "Masuk ke Kontakspace"
                  : "Buat ruangku"}
              <ArrowLeft size={18} className="button-arrow" />
            </button>
          </form>
        </div>
        <p className="auth-footer">
          <ShieldCheck size={14} /> Your data stays private and secure
        </p>
      </section>
    </main>
  );
}

function Dashboard({ onLogout }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const loadContacts = async () => {
    setLoading(true);
    try {
      setContacts(await request("/kontak"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadContacts();
  }, []);
  const filtered = useMemo(
    () =>
      contacts.filter((contact) => {
        const matchesQuery =
          `${contact.nama} ${contact.alamat} ${(contact.phones || []).map((p) => p.nomor_telepon).join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesFilter =
          filter === "Semua" ||
          (contact.phones || []).some((phone) => phone.jenis === filter);
        return matchesQuery && matchesFilter;
      }),
    [contacts, query, filter],
  );
  const remove = async (contact) => {
    if (!confirm(`Hapus ${contact.nama} dari kontak?`)) return;
    try {
      await request(`/kontak/${contact.id}`, { method: "DELETE" });
      setContacts(contacts.filter((item) => item.id !== contact.id));
      setToast("Kontak berhasil dihapus");
    } catch (err) {
      setToast(err.message);
    }
  };
  const saved = async (contact) => {
    setContacts(
      contacts.some((item) => item.id === contact.id)
        ? contacts.map((item) => (item.id === contact.id ? contact : item))
        : [contact, ...contacts],
    );
    setModal(null);
    setToast("Kontak berhasil disimpan");
  };
  return (
    <div className="app-shell">
      <aside className={mobileNav ? "sidebar open" : "sidebar"}>
        <div className="brand sidebar-brand">
          <span className="brand-mark">
            <BookUser size={21} />
          </span>
          <span>
            Kontak<span>space</span>
          </span>
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          <button className="nav-item active">
            <BookUser size={18} /> Semua kontak <b>{contacts.length}</b>
          </button>
        </nav>
        <div className="side-bottom">
          <div className="privacy-card">
            <ShieldCheck size={19} />
            <div>
              <strong>Data pribadi</strong>
              <span>Kontakmu hanya milikmu.</span>
            </div>
          </div>
          <button className="nav-item logout" onClick={onLogout}>
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>
      <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}>
        <Menu size={22} />
      </button>
      <main className="content">
        <header className="topbar">
          <div>
            <p className="kicker">DAFTAR KONTAK PRIBADI</p>
            <h1>
              Selamat datang, <em>teman.</em>
            </h1>
          </div>
        </header>
        <section className="welcome-strip">
          <div>
            <span className="eyebrow">
              <Sparkles size={14} /> YOUR LITTLE UNIVERSE
            </span>
            <h2>
              Semua koneksi,
              <br />
              <em>tersimpan rapi.</em>
            </h2>
            <p>
              {contacts.length
                ? `Kamu punya ${contacts.length} orang spesial di lingkaranmu.`
                : "Tambahkan orang-orang yang berarti dalam hidupmu."}
            </p>
          </div>
          <div className="strip-decoration">
            <div className="sun-shape" />
            <Heart
              className="float-heart heart-one"
              size={26}
              fill="currentColor"
            />
            <Heart
              className="float-heart heart-two"
              size={16}
              fill="currentColor"
            />
          </div>
        </section>
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kontak..."
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>Semua</option>
            <option>HP</option>
            <option>Rumah</option>
            <option>Kantor</option>
          </select>
          <button
            className="primary-button add-button"
            onClick={() => setModal({ type: "form", contact: null })}
          >
            <Plus size={18} /> Tambah kontak
          </button>
        </div>
        <div className="section-heading">
          <div>
            <p className="kicker">YOUR CIRCLE</p>
            <h2>
              {filter === "Semua" ? "Semua kontak" : `Kontak ${filter}`}{" "}
              <span>{filtered.length}</span>
            </h2>
          </div>
        </div>
        {error && <div className="error-message page-error">{error}</div>}
        {loading ? (
          <div className="loading">
            <span /> Memuat kontak...
          </div>
        ) : filtered.length ? (
          <div className="contact-grid">
            {filtered.map((contact, index) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                index={index}
                onEdit={() => setModal({ type: "form", contact })}
                onDelete={() => remove(contact)}
                onView={() => setModal({ type: "detail", contact })}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            onAdd={() => setModal({ type: "form", contact: null })}
            hasQuery={Boolean(query)}
          />
        )}
      </main>
      {modal?.type === "form" && (
        <ContactForm
          contact={modal.contact}
          onClose={() => setModal(null)}
          onSaved={saved}
        />
      )}
      {modal?.type === "detail" && (
        <DetailModal
          contact={modal.contact}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ type: "form", contact: modal.contact })}
        />
      )}
      {toast && (
        <div className="toast">
          <Check size={16} /> {toast}
          <button onClick={() => setToast("")}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function ContactCard({ contact, index, onEdit, onDelete, onView }) {
  const initials = contact.nama
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <article
      className="contact-card"
      style={{ "--delay": `${index * 70}ms` }}
      onClick={onView}
    >
      <div className="card-top">
        <span className={`contact-avatar avatar-${index % 5}`}>{initials}</span>
        <button
          className="more-button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label={`Edit ${contact.nama}`}
        >
          <Edit3 size={16} />
        </button>
      </div>
      <h3>{contact.nama}</h3>
      <p className="birth-date">
        <CalendarDays size={14} />{" "}
        {new Date(contact.tanggal_lahir).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <div className="card-divider" />
      <div className="phone-list">
        {(contact.phones || []).slice(0, 2).map((phone) => (
          <div
            className="phone-row"
            key={phone.id || `${phone.jenis}-${phone.nomor_telepon}`}
          >
            <span className="phone-type">{phone.jenis}</span>
            <span>{phone.nomor_telepon}</span>
          </div>
        ))}
      </div>
      <div className="card-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Edit3 size={14} /> Ubah
        </button>
        <button
          className="delete-action"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 size={14} /> Hapus
        </button>
      </div>
    </article>
  );
}

function ContactForm({ contact, onClose, onSaved }) {
  const [form, setForm] = useState(
    contact
      ? {
          nama: contact.nama,
          alamat: contact.alamat,
          tanggal_lahir: contact.tanggal_lahir,
          phones: contact.phones?.length
            ? contact.phones.map(({ jenis, nomor_telepon }) => ({
                jenis,
                nomor_telepon,
              }))
            : emptyForm.phones,
        }
      : emptyForm,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const updatePhone = (index, key, value) =>
    setForm({
      ...form,
      phones: form.phones.map((phone, phoneIndex) =>
        phoneIndex === index ? { ...phone, [key]: value } : phone,
      ),
    });
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await request(
        contact ? `/kontak/${contact.id}` : "/kontak",
        { method: contact ? "PUT" : "POST", body: JSON.stringify(form) },
      );
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="modal-backdrop">
      <div className="modal form-modal">
        <button className="close-button" onClick={onClose}>
          <X size={19} />
        </button>
        <div className="modal-heading">
          <span className="modal-icon">
            <UserRound size={20} />
          </span>
          <div>
            <p className="kicker">
              {contact ? "PERBARUI KONTAK" : "KONTAK BARU"}
            </p>
            <h2>{contact ? "Ubah kontak" : "Tambah kontak"}</h2>
          </div>
        </div>
        <form onSubmit={submit} className="contact-form">
          <label>
            Nama lengkap
            <input
              required
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Nama kontak"
            />
          </label>
          <div className="form-row">
            <label>
              Tanggal lahir
              <input
                required
                type="date"
                value={form.tanggal_lahir}
                onChange={(e) =>
                  setForm({ ...form, tanggal_lahir: e.target.value })
                }
              />
            </label>
            <label>
              Nomor telepon
              <input
                required
                value={form.phones[0].nomor_telepon}
                onChange={(e) =>
                  updatePhone(0, "nomor_telepon", e.target.value)
                }
                placeholder="08xx xxxx xxxx"
              />
            </label>
          </div>
          <label>
            Alamat
            <textarea
              required
              rows="3"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              placeholder="Alamat kontak"
            />
          </label>
          <div className="form-label-row">
            <label className="phone-label">
              Jenis telepon
              <select
                value={form.phones[0].jenis}
                onChange={(e) => updatePhone(0, "jenis", e.target.value)}
              >
                <option>HP</option>
                <option>Rumah</option>
                <option>Kantor</option>
              </select>
            </label>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button className="primary-button save-button" disabled={saving}>
            {saving
              ? "Menyimpan..."
              : contact
                ? "Simpan perubahan"
                : "Simpan kontak"}{" "}
            <Check size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ contact, onClose, onEdit }) {
  return (
    <div className="modal-backdrop">
      <div className="modal detail-modal">
        <button className="close-button" onClick={onClose}>
          <X size={19} />
        </button>
        <div className="detail-hero">
          <span className="detail-avatar">
            {contact.nama
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
          <p className="kicker">PROFIL KONTAK</p>
          <h2>{contact.nama}</h2>
          <p>Bagian dari lingkaran kecilmu</p>
        </div>
        <div className="detail-list">
          <div>
            <CalendarDays size={18} />
            <span>
              <small>Tanggal lahir</small>
              {new Date(contact.tanggal_lahir).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div>
            <MapPin size={18} />
            <span>
              <small>Alamat</small>
              {contact.alamat}
            </span>
          </div>
          {(contact.phones || []).map((phone) => (
            <div key={phone.id}>
              <Phone size={18} />
              <span>
                <small>{phone.jenis}</small>
                {phone.nomor_telepon}
              </span>
            </div>
          ))}
        </div>
        <button className="primary-button save-button" onClick={onEdit}>
          <Edit3 size={16} /> Ubah kontak
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd, hasQuery }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Heart size={28} />
      </div>
      <h3>{hasQuery ? "Kontak tidak ditemukan." : "Lingkaranmu menunggu."}</h3>
      <p>
        {hasQuery
          ? "Coba nama lain atau hapus pencarianmu."
          : "Tambahkan kontak pertamamu dan mulai isi ruang ini."}
      </p>
      {!hasQuery && (
        <button className="primary-button" onClick={onAdd}>
          <Plus size={17} /> Tambah kontak pertama
        </button>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
