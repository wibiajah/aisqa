"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Photo = {
  id: string;
  title: string;
  src: string;
  createdAt: string;
};

type Note = {
  id: string;
  title: string;
  body: string;
  type: "catatan" | "tugas" | "janji";
  createdAt: string;
};

type Mood = "ceria" | "badmood" | "bt" | "kangen";

const storageKey = "aisqa-world-v1";

const defaultPhotos: Photo[] = [
  {
    id: "molly",
    title: "Molly",
    src: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "mountain",
    title: "Rencana naik gunung",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    createdAt: new Date().toISOString(),
  },
];

const defaultNotes: Note[] = [
  {
    id: "serius",
    title: "Catatan dari aku",
    body: "Aku buat tempat ini supaya ada ruang yang rapi untuk menyimpan hal-hal penting tentang kamu dan tentang kita.",
    type: "janji",
    createdAt: new Date().toISOString(),
  },
  {
    id: "kuliah",
    title: "Kuliah",
    body: "Tempat menyimpan catatan, tugas, deadline, atau hal kecil yang perlu diingat.",
    type: "tugas",
    createdAt: new Date().toISOString(),
  },
];

const favorites = [
  "Molly",
  "kucing",
  "susu coklat",
  "matcha",
  "seblak",
  "merah",
  "biru",
  "naik gunung",
];

const moodCopy: Record<Mood, string> = {
  ceria: "Hari ini lagi enak. Semoga sisanya juga lancar.",
  badmood: "Kalau lagi kurang mood, pelan-pelan aja dulu.",
  bt: "Kalau lagi BT, ambil jeda sebentar.",
  kangen: "Kalau lagi kangen, simpan foto atau catatan kecil di sini.",
};

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>(defaultPhotos);
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [mood, setMood] = useState<Mood>("ceria");
  const [photoTitle, setPhotoTitle] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteType, setNoteType] = useState<Note["type"]>("catatan");
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const loadStoredData = window.setTimeout(() => {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        return;
      }

      try {
        const parsed = JSON.parse(stored) as { photos?: Photo[]; notes?: Note[] };
        setPhotos(parsed.photos?.length ? parsed.photos : defaultPhotos);
        setNotes(parsed.notes?.length ? parsed.notes : defaultNotes);
      } catch {
        localStorage.removeItem(storageKey);
      }
    }, 0);

    return () => window.clearTimeout(loadStoredData);
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ photos, notes }));
  }, [photos, notes]);

  const stats = useMemo(
    () => [
      { label: "Foto", value: photos.length },
      { label: "Catatan", value: notes.length },
      { label: "Janji", value: notes.filter((note) => note.type === "janji").length },
    ],
    [notes, photos],
  );

  function addPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotos((current) => [
        {
          id: crypto.randomUUID(),
          title: photoTitle || file.name,
          src: String(reader.result),
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
      setPhotoTitle("");
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  }

  function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!noteTitle.trim() || !noteBody.trim()) {
      return;
    }

    setNotes((current) => [
      {
        id: crypto.randomUUID(),
        title: noteTitle.trim(),
        body: noteBody.trim(),
        type: noteType,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setNoteTitle("");
    setNoteBody("");
    setNoteType("catatan");
  }

  function removePhoto(id: string) {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  }

  function removeNote(id: string) {
    setNotes((current) => current.filter((note) => note.id !== id));
  }

  return (
    <main className="min-h-screen bg-[#fff7fb] text-[#181016]">
      <section className="relative overflow-hidden bg-[#b40f2f] text-white">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(135deg,#ffffff_1px,transparent_1px),linear-gradient(45deg,#2f68ff_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="relative mx-auto grid min-h-[86svh] w-full max-w-6xl content-between px-5 py-5 sm:min-h-[88svh] sm:px-8 sm:py-7 lg:px-10">
          <nav className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                Untuk
              </p>
              <p className="text-base font-bold sm:text-lg">Aisqa Bariqi Shevanska</p>
            </div>
            <a
              href="#ruang-aisqa"
              className="rounded-[8px] bg-white px-4 py-2 text-sm font-bold text-[#b40f2f] shadow-sm transition hover:bg-[#dce8ff]"
            >
              Buka
            </a>
          </nav>

          <div className="grid gap-5 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-[8px] bg-[#1f5fff] px-3 py-2 text-xs font-semibold text-white sm:text-sm">
                Molly, matcha, seblak, dan catatan kecil
              </p>
              <h1 className="max-w-3xl text-[2.35rem] font-black leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
                Ruang sederhana untuk Aisqa.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/84 sm:mt-6 sm:text-lg sm:leading-8">
                Tempat menyimpan foto, tugas, catatan, dan hal-hal kecil yang
                penting buat kamu.
              </p>
            </div>

            <div className="grid gap-3 rounded-[8px] bg-white/12 p-4 backdrop-blur sm:p-5">
              {stats.map((item) => (
                <div
                  className="flex items-center justify-between border-b border-white/18 pb-3 last:border-0 last:pb-0"
                  key={item.label}
                >
                  <span className="text-xs text-white/75 sm:text-sm">{item.label}</span>
                  <strong className="text-2xl sm:text-3xl">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pb-3 sm:grid-cols-4 sm:gap-3">
            {favorites.map((favorite) => (
              <span
                className="rounded-[8px] bg-white/14 px-3 py-2 text-center text-xs font-semibold text-white sm:px-4 sm:text-sm"
                key={favorite}
              >
                {favorite}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:px-10"
        id="ruang-aisqa"
      >
        <aside className="grid content-start gap-5">
          <div className="rounded-[8px] border border-[#f1c7d1] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black text-[#b40f2f]">Mood hari ini</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(["ceria", "badmood", "bt", "kangen"] as Mood[]).map((item) => (
                <button
                  className={`rounded-[8px] border px-3 py-3 text-sm font-bold transition ${
                    mood === item
                      ? "border-[#1f5fff] bg-[#1f5fff] text-white"
                      : "border-[#f1c7d1] bg-[#fff7fb] text-[#181016]"
                  }`}
                  key={item}
                  onClick={() => setMood(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
            <p className="mt-4 rounded-[8px] bg-[#fff1f5] p-4 text-sm leading-6 text-[#5f2837]">
              {moodCopy[mood]}
            </p>
          </div>

          <form
            className="rounded-[8px] border border-[#c7d8ff] bg-white p-5 shadow-sm"
            onSubmit={addNote}
          >
            <h2 className="text-2xl font-black text-[#1f5fff]">Catatan & tugas</h2>
            <input
              className="mt-4 w-full rounded-[8px] border border-[#c7d8ff] px-4 py-3 text-sm outline-none focus:border-[#1f5fff]"
              onChange={(event) => setNoteTitle(event.target.value)}
              placeholder="Judul"
              value={noteTitle}
            />
            <textarea
              className="mt-3 min-h-28 w-full rounded-[8px] border border-[#c7d8ff] px-4 py-3 text-sm outline-none focus:border-[#1f5fff]"
              onChange={(event) => setNoteBody(event.target.value)}
              placeholder="Isi catatan, tugas, deadline, atau janji"
              value={noteBody}
            />
            <select
              className="mt-3 w-full rounded-[8px] border border-[#c7d8ff] bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#1f5fff]"
              onChange={(event) => setNoteType(event.target.value as Note["type"])}
              value={noteType}
            >
              <option value="catatan">Catatan</option>
              <option value="tugas">Tugas kuliah</option>
              <option value="janji">Janji</option>
            </select>
            <button className="mt-3 w-full rounded-[8px] bg-[#b40f2f] px-4 py-3 text-sm font-black text-white transition hover:bg-[#901026]">
              Simpan
            </button>
          </form>
        </aside>

        <div className="grid gap-5">
          <div className="rounded-[8px] border border-[#f1c7d1] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-black text-[#b40f2f]">Album Aisqa</h2>
                <p className="mt-1 text-sm leading-6 text-[#69424d]">
                  Simpan foto Molly, gunung, kuliah, makanan, atau momen lain.
                </p>
              </div>
              <label className="cursor-pointer rounded-[8px] bg-[#1f5fff] px-4 py-3 text-center text-sm font-black text-white transition hover:bg-[#174bd0]">
                Upload foto
                <input accept="image/*" className="sr-only" onChange={addPhoto} type="file" />
              </label>
            </div>
            <input
              className="mt-4 w-full rounded-[8px] border border-[#f1c7d1] px-4 py-3 text-sm outline-none focus:border-[#b40f2f]"
              onChange={(event) => setPhotoTitle(event.target.value)}
              placeholder="Judul foto sebelum upload"
              value={photoTitle}
            />

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo) => (
                <article
                  className="group overflow-hidden rounded-[8px] border border-[#f1c7d1] bg-[#fff7fb]"
                  key={photo.id}
                >
                  <button
                    className="block aspect-square w-full overflow-hidden"
                    onClick={() => setActivePhoto(photo)}
                    type="button"
                  >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                      alt={photo.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      src={photo.src}
                    />
                  </button>
                  <div className="grid gap-2 p-3">
                    <p className="line-clamp-2 min-h-10 text-sm font-bold text-[#321821]">
                      {photo.title}
                    </p>
                    <button
                      className="justify-self-start text-xs font-bold text-[#b40f2f]"
                      onClick={() => removePhoto(photo.id)}
                      type="button"
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {notes.map((note) => (
              <article
                className="rounded-[8px] border border-[#c7d8ff] bg-white p-5 shadow-sm"
                key={note.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-[#dce8ff] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#1f5fff]">
                      {note.type}
                    </span>
                    <h3 className="mt-3 text-xl font-black text-[#181016]">{note.title}</h3>
                  </div>
                  <button
                    className="shrink-0 rounded-full border border-[#f1c7d1] px-3 py-1 text-xs font-bold text-[#b40f2f]"
                    onClick={() => removeNote(note.id)}
                    type="button"
                  >
                    Hapus
                  </button>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#5f2837]">
                  {note.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {activePhoto ? (
        <div className="fixed inset-0 z-20 grid place-items-center bg-[#181016]/80 p-4">
          <div className="max-h-[90svh] w-full max-w-3xl overflow-hidden rounded-[8px] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={activePhoto.title}
              className="max-h-[72svh] w-full object-contain bg-black"
              src={activePhoto.src}
            />
            <div className="flex items-center justify-between gap-4 p-4">
              <p className="font-bold text-[#181016]">{activePhoto.title}</p>
              <button
                className="rounded-[8px] bg-[#b40f2f] px-4 py-2 text-sm font-black text-white"
                onClick={() => setActivePhoto(null)}
                type="button"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
