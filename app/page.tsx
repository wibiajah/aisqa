"use client";

import { Fragment, FormEvent, useEffect, useMemo, useState } from "react";

type AccountType = "aset" | "liabilitas" | "ekuitas" | "pendapatan" | "beban";
type Tab = "dashboard" | "jurnal" | "buku-besar" | "laporan";

type Account = {
  code: string;
  name: string;
  type: AccountType;
  normal: "debit" | "kredit";
};

type JournalEntry = {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
};

const storageKey = "akuntansi-kuliah-v2";

const accounts: Account[] = [
  { code: "101", name: "Kas", type: "aset", normal: "debit" },
  { code: "102", name: "Bank", type: "aset", normal: "debit" },
  { code: "103", name: "Piutang Usaha", type: "aset", normal: "debit" },
  { code: "121", name: "Peralatan", type: "aset", normal: "debit" },
  { code: "201", name: "Utang Usaha", type: "liabilitas", normal: "kredit" },
  { code: "301", name: "Modal Pemilik", type: "ekuitas", normal: "kredit" },
  { code: "401", name: "Pendapatan Jasa", type: "pendapatan", normal: "kredit" },
  { code: "501", name: "Beban Sewa", type: "beban", normal: "debit" },
  { code: "502", name: "Beban Listrik", type: "beban", normal: "debit" },
  { code: "503", name: "Beban Gaji", type: "beban", normal: "debit" },
];

const initialEntries: JournalEntry[] = [];

const accountTypeLabels: Record<AccountType, string> = {
  aset: "Aset",
  liabilitas: "Liabilitas",
  ekuitas: "Ekuitas",
  pendapatan: "Pendapatan",
  beban: "Beban",
};

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getAccount(code: string) {
  return accounts.find((account) => account.code === code) ?? accounts[0];
}

export default function Home() {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [date, setDate] = useState("2026-05-30");
  const [description, setDescription] = useState("");
  const [debitAccount, setDebitAccount] = useState("101");
  const [creditAccount, setCreditAccount] = useState("401");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        return;
      }

      try {
        const parsed = JSON.parse(stored) as JournalEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries]);

  const sortedEntries = useMemo(
    () => [...entries].sort((first, second) => first.date.localeCompare(second.date)),
    [entries],
  );

  const accountBalances = useMemo(() => {
    return accounts.map((account) => {
      const debit = entries
        .filter((entry) => entry.debitAccount === account.code)
        .reduce((total, entry) => total + entry.amount, 0);
      const credit = entries
        .filter((entry) => entry.creditAccount === account.code)
        .reduce((total, entry) => total + entry.amount, 0);
      const balance = account.normal === "debit" ? debit - credit : credit - debit;

      return { ...account, debit, credit, balance };
    });
  }, [entries]);

  const summary = useMemo(() => {
    const byType = (type: AccountType) =>
      accountBalances
        .filter((account) => account.type === type)
        .reduce((total, account) => total + account.balance, 0);

    const totalDebit = entries.reduce((total, entry) => total + entry.amount, 0);
    const totalCredit = entries.reduce((total, entry) => total + entry.amount, 0);
    const revenue = byType("pendapatan");
    const expenses = byType("beban");
    const netIncome = revenue - expenses;

    return {
      assets: byType("aset"),
      liabilities: byType("liabilitas"),
      equity: byType("ekuitas"),
      revenue,
      expenses,
      netIncome,
      totalDebit,
      totalCredit,
      equationRight: byType("liabilitas") + byType("ekuitas") + netIncome,
    };
  }, [accountBalances, entries]);

  function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!description.trim() || !numericAmount || numericAmount <= 0) {
      return;
    }

    setEntries((current) => [
      {
        id: crypto.randomUUID(),
        date,
        description: description.trim(),
        debitAccount,
        creditAccount,
        amount: numericAmount,
      },
      ...current,
    ]);
    setDescription("");
    setAmount("");
    setActiveTab("jurnal");
  }

  function deleteEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function clearEntries() {
    setEntries(initialEntries);
    setActiveTab("dashboard");
  }

  const trialBalanceDebit = accountBalances.reduce(
    (total, account) => total + (account.normal === "debit" ? account.balance : 0),
    0,
  );
  const trialBalanceCredit = accountBalances.reduce(
    (total, account) => total + (account.normal === "kredit" ? account.balance : 0),
    0,
  );

  return (
    <main className="min-h-screen bg-[#eef3ef] text-[#111814]">
      <section className="hero-panel">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8eb69c]">
              Tugas Kuliah
            </p>
            <h1 className="text-lg font-black text-white sm:text-2xl">
              Aplikasi Keuangan Akuntansi
            </h1>
          </div>
          <button
            className="shrink-0 rounded-[8px] bg-white px-3 py-2 text-xs font-black text-[#123424] transition hover:bg-[#c9f2d8] sm:px-4 sm:text-sm"
            onClick={clearEntries}
            type="button"
          >
            Kosongkan Data
          </button>
        </nav>

        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 pb-7 pt-3 sm:gap-6 sm:px-8 sm:pb-8 sm:pt-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-[8px] bg-[#c9f2d8] px-3 py-2 text-sm font-black text-[#123424]">
              Jurnal umum, buku besar, dan laporan otomatis
            </p>
            <h2 className="max-w-2xl text-4xl font-black leading-[0.98] text-white sm:text-6xl lg:text-7xl">
              Jurnal Catatan Keuangan.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/76 sm:text-base">
              Catat transaksi debit-kredit, lalu aplikasi menyusun saldo akun,
              neraca saldo, laba rugi, dan posisi keuangan secara otomatis.
            </p>
          </div>

          <div className="ledger-card">
            <div className="ledger-card-header">
              <span>Persamaan Dasar Akuntansi</span>
              <strong>{summary.assets === summary.equationRight ? "Seimbang" : "Periksa"}</strong>
            </div>
            <div className="accounting-equation">
              <div>
                <span>Aset</span>
                <strong>{rupiah(summary.assets)}</strong>
              </div>
              <b>=</b>
              <div>
                <span>Liabilitas + Ekuitas + Laba</span>
                <strong>{rupiah(summary.equationRight)}</strong>
              </div>
            </div>
            <div className="ledger-spine">
              {accountBalances.slice(0, 6).map((account) => (
                <span
                  key={account.code}
                  style={{ width: `${Math.max(16, Math.min(100, account.balance / 140000))}%` }}
                >
                  {account.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-5 sm:gap-5 sm:px-8 sm:py-6 lg:grid-cols-[360px_1fr]">
        <aside className="grid content-start gap-5">
          <form className="panel" onSubmit={addEntry}>
            <div className="mb-4">
              <p className="eyebrow">Input Transaksi</p>
              <h2 className="section-title">Jurnal Baru</h2>
            </div>

            <label className="field-label">
              Tanggal
              <input
                className="field"
                onChange={(event) => setDate(event.target.value)}
                type="date"
                value={date}
              />
            </label>

            <label className="field-label">
              Keterangan
              <input
                className="field"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Contoh: menerima pendapatan jasa"
                value={description}
              />
            </label>

            <label className="field-label">
              Akun Debit
              <select
                className="field"
                onChange={(event) => setDebitAccount(event.target.value)}
                value={debitAccount}
              >
                {accounts.map((account) => (
                  <option key={account.code} value={account.code}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Akun Kredit
              <select
                className="field"
                onChange={(event) => setCreditAccount(event.target.value)}
                value={creditAccount}
              >
                {accounts.map((account) => (
                  <option key={account.code} value={account.code}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Nominal
              <input
                className="field"
                min="0"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Contoh: 1500000"
                type="number"
                value={amount}
              />
            </label>

            <button className="primary-button" type="submit">
              Simpan Jurnal
            </button>
          </form>

          <div className="panel">
            <p className="eyebrow">Ringkasan</p>
            <div className="metric-list">
              <div>
                <span>Total Debit</span>
                <strong>{rupiah(summary.totalDebit)}</strong>
              </div>
              <div>
                <span>Total Kredit</span>
                <strong>{rupiah(summary.totalCredit)}</strong>
              </div>
              <div>
                <span>Laba Bersih</span>
                <strong className={summary.netIncome >= 0 ? "text-[#14783d]" : "text-[#b42318]"}>
                  {rupiah(summary.netIncome)}
                </strong>
              </div>
            </div>
          </div>
        </aside>

        <div className="grid gap-5">
          <div
            className="app-tabs"
            style={{
              alignItems: "center",
              display: "flex",
              gap: 6,
              height: 50,
              maxHeight: 50,
              minHeight: 50,
              overflowX: "auto",
              padding: 6,
            }}
          >
            {[
              ["dashboard", "Dashboard"],
              ["jurnal", "Jurnal Umum"],
              ["buku-besar", "Buku Besar"],
              ["laporan", "Laporan"],
            ].map(([tab, label]) => (
              <button
                className={activeTab === tab ? "is-active" : ""}
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                style={{
                  alignItems: "center",
                  display: "flex",
                  height: 38,
                  justifyContent: "center",
                  maxHeight: 38,
                  minHeight: 38,
                  padding: "0 12px",
                }}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "dashboard" ? (
            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  ["Aset", summary.assets],
                  ["Liabilitas", summary.liabilities],
                  ["Ekuitas", summary.equity],
                  ["Laba Bersih", summary.netIncome],
                ].map(([label, value]) => (
                  <div className="stat-card" key={label}>
                    <span>{label}</span>
                    <strong>{rupiah(Number(value))}</strong>
                  </div>
                ))}
              </div>

              <div className="panel">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">Aktivitas</p>
                    <h2 className="section-title">Transaksi Terbaru</h2>
                  </div>
                  <button className="ghost-button" onClick={() => setActiveTab("jurnal")} type="button">
                    Lihat Jurnal
                  </button>
                </div>
                <div className="timeline">
                  {sortedEntries.length > 0 ? sortedEntries.slice(-5).reverse().map((entry) => (
                    <article key={entry.id}>
                      <time>{formatDate(entry.date)}</time>
                      <div>
                        <strong>{entry.description}</strong>
                        <p>
                          Debit {getAccount(entry.debitAccount).name} dan kredit{" "}
                          {getAccount(entry.creditAccount).name}
                        </p>
                      </div>
                      <span>{rupiah(entry.amount)}</span>
                    </article>
                  )) : (
                    <div className="empty-state">Belum ada transaksi. Isi jurnal baru dari form di sebelah kiri.</div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "jurnal" ? (
            <div className="panel">
              <div className="mb-4">
                <p className="eyebrow">Double Entry</p>
                <h2 className="section-title">Jurnal Umum</h2>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Keterangan</th>
                      <th>Akun</th>
                      <th>Debit</th>
                      <th>Kredit</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEntries.map((entry) => (
                      <Fragment key={entry.id}>
                        <tr key={`${entry.id}-debit`}>
                          <td>{formatDate(entry.date)}</td>
                          <td>{entry.description}</td>
                          <td>{getAccount(entry.debitAccount).name}</td>
                          <td>{rupiah(entry.amount)}</td>
                          <td>-</td>
                          <td rowSpan={2}>
                            <button className="delete-button" onClick={() => deleteEntry(entry.id)} type="button">
                              Hapus
                            </button>
                          </td>
                        </tr>
                        <tr key={`${entry.id}-credit`}>
                          <td></td>
                          <td></td>
                          <td className="credit-account">{getAccount(entry.creditAccount).name}</td>
                          <td>-</td>
                          <td>{rupiah(entry.amount)}</td>
                        </tr>
                      </Fragment>
                    ))}
                    {sortedEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6}>Belum ada transaksi jurnal.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeTab === "buku-besar" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {accountBalances.map((account) => (
                <article className="ledger-account" key={account.code}>
                  <div className="ledger-account-head">
                    <div>
                      <span>{account.code}</span>
                      <h3>{account.name}</h3>
                    </div>
                    <strong>{rupiah(account.balance)}</strong>
                  </div>
                  <div className="mini-ledger">
                    <span>Debit {rupiah(account.debit)}</span>
                    <span>Kredit {rupiah(account.credit)}</span>
                  </div>
                  <p>{accountTypeLabels[account.type]} - saldo normal {account.normal}</p>
                </article>
              ))}
            </div>
          ) : null}

          {activeTab === "laporan" ? (
            <div className="grid gap-5">
              <div className="panel">
                <p className="eyebrow">Laporan</p>
                <h2 className="section-title">Neraca Saldo</h2>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Kode</th>
                        <th>Akun</th>
                        <th>Debit</th>
                        <th>Kredit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accountBalances.map((account) => (
                        <tr key={account.code}>
                          <td>{account.code}</td>
                          <td>{account.name}</td>
                          <td>{account.normal === "debit" ? rupiah(account.balance) : "-"}</td>
                          <td>{account.normal === "kredit" ? rupiah(account.balance) : "-"}</td>
                        </tr>
                      ))}
                      <tr className="total-row">
                        <td></td>
                        <td>Total</td>
                        <td>{rupiah(trialBalanceDebit)}</td>
                        <td>{rupiah(trialBalanceCredit)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="panel">
                  <p className="eyebrow">Laporan</p>
                  <h2 className="section-title">Laba Rugi</h2>
                  <div className="report-list">
                    <div>
                      <span>Pendapatan</span>
                      <strong>{rupiah(summary.revenue)}</strong>
                    </div>
                    <div>
                      <span>Beban</span>
                      <strong>{rupiah(summary.expenses)}</strong>
                    </div>
                    <div className="report-total">
                      <span>Laba Bersih</span>
                      <strong>{rupiah(summary.netIncome)}</strong>
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <p className="eyebrow">Laporan</p>
                  <h2 className="section-title">Posisi Keuangan</h2>
                  <div className="report-list">
                    <div>
                      <span>Total Aset</span>
                      <strong>{rupiah(summary.assets)}</strong>
                    </div>
                    <div>
                      <span>Liabilitas</span>
                      <strong>{rupiah(summary.liabilities)}</strong>
                    </div>
                    <div>
                      <span>Ekuitas + Laba</span>
                      <strong>{rupiah(summary.equity + summary.netIncome)}</strong>
                    </div>
                    <div className="report-total">
                      <span>Status</span>
                      <strong>{summary.assets === summary.equationRight ? "Seimbang" : "Belum seimbang"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
