"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator, FileText, Printer, ShieldCheck, X } from "lucide-react";
import { currency, members } from "@/lib/mock-data";

const applicationSchema = z.object({
  name: z.string().min(2, "Enter the applicant’s full name"),
  type: z.enum(["Short Term Loan (STL)", "Long Term Loan", "Rice / Commodity Loan"]),
  amount: z.number().min(30000, "Minimum request is ₦30,000").max(500000, "Maximum request is ₦500,000"),
  purpose: z.string().min(4, "Add a short loan purpose"),
  grade: z.string().min(1), station: z.string().min(1), psn: z.string().regex(/^\d{5}$/, "Enter a 5-digit PSN"),
  subscription: z.number().min(5000), bank: z.string().min(1), account: z.string().regex(/^\d{10}$/, "Enter a 10-digit demo account number"),
  appointment: z.string().min(1), phone: z.string().min(10, "Enter a valid phone number"), dob: z.string().min(1),
  guarantorOne: z.string().min(2, "Enter guarantor one’s name"), guarantorOnePsn: z.string().regex(/^\d{5}$/, "Enter a 5-digit PSN"), guarantorOnePhone: z.string().min(10),
  guarantorTwo: z.string().min(2, "Enter guarantor two’s name"), guarantorTwoPsn: z.string().regex(/^\d{5}$/, "Enter a 5-digit PSN"), guarantorTwoPhone: z.string().min(10),
  salaryConsent: z.literal(true, { error: "Applicant authorization is required" }),
});
type LoanValues = z.infer<typeof applicationSchema>;
const wordsBelowTwenty = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const tensWords = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
function underThousand(n: number): string {
  const parts: string[] = [];
  if (n >= 100) { parts.push(`${wordsBelowTwenty[Math.floor(n / 100)]} hundred`); n %= 100; }
  if (n >= 20) { parts.push(`${tensWords[Math.floor(n / 10)]}${n % 10 ? `-${wordsBelowTwenty[n % 10]}` : ""}`); }
  else if (n > 0) parts.push(wordsBelowTwenty[n]);
  return parts.join(" ");
}
function amountInWords(amount: number) {
  if (!amount) return "zero naira";
  const thousands = Math.floor(amount / 1000);
  const remainder = amount % 1000;
  return `${thousands ? `${underThousand(thousands)} thousand${remainder ? ` ${underThousand(remainder)}` : ""}` : underThousand(remainder)} naira only`;
}

export function LoanApplicationForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (values: LoanValues) => void }) {
  const [rate, setRate] = useState(10);
  const [tenure, setTenure] = useState(12);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoanValues>({ resolver: zodResolver(applicationSchema), defaultValues: { type: "Short Term Loan (STL)", amount: 250000, grade: "08", station: "High Court Makurdi", psn: members[0].psn, subscription: 10000, bank: "First Bank", account: members[0].account, appointment: "2018-06-01", phone: members[0].phone, dob: "1988-04-12", guarantorOne: members[1].name, guarantorOnePsn: members[1].psn, guarantorOnePhone: members[1].phone, guarantorTwo: members[2].name, guarantorTwoPsn: members[2].psn, guarantorTwoPhone: members[2].phone, salaryConsent: true } });
  const amount = watch("amount") || 0;
  const interestTotal = useMemo(() => amount * (rate / 100) * (tenure / 12), [amount, rate, tenure]);
  const monthlyPayment = tenure ? (amount + interestTotal) / tenure : 0;
  const error = (key: keyof LoanValues) => errors[key]?.message as string | undefined;
  const input = (label: string, name: keyof LoanValues, type = "text", numeric = false) => <label className="loan-field">{label}<input type={type} className="field-input" aria-invalid={Boolean(error(name))} {...register(name, numeric ? { valueAsNumber: true } : undefined)} />{error(name) && <small className="field-error">{error(name)}</small>}</label>;
  return <div className="loan-form-page"><div className="page-heading"><div><p className="eyebrow">NEW APPLICATION · DEMO FORM</p><h2>Loan application</h2><p className="muted">Complete the application for review by the cooperative.</p></div><button className="button button-outline" onClick={onClose}><X size={15} /> Close</button></div><form className="loan-application" onSubmit={handleSubmit(onSubmit)}>
    <section className="panel form-panel"><div className="form-section-title"><span>SECTION A</span><h3>Applicant information</h3></div><div className="loan-form-grid">{input("Applicant full name", "name")}<label className="loan-field">Loan type<select className="field-input" {...register("type")}><option>Short Term Loan (STL)</option><option>Long Term Loan</option><option>Rice / Commodity Loan</option></select></label>{input("Amount requested (₦)", "amount", "number", true)}<label className="loan-field">Amount in words<div className="field-input amount-words">{amountInWords(amount)}</div></label>{input("Purpose of loan", "purpose")}<label className="loan-field">Grade level<select className="field-input" {...register("grade")}>{Array.from({ length: 15 }, (_, i) => <option key={i} value={String(i + 3).padStart(2, "0")}>Grade {String(i + 3).padStart(2, "0")}</option>)}</select></label>{input("PSN", "psn")}<label className="loan-field">Present station<select className="field-input" {...register("station")}>{[...new Set(members.map((m) => m.station))].map((station) => <option key={station}>{station}</option>)}</select></label>{input("Monthly subscription (₦)", "subscription", "number", true)}<label className="loan-field">Bank<select className="field-input" {...register("bank")}>{[...new Set(members.map((m) => m.bank))].map((bank) => <option key={bank}>{bank}</option>)}</select></label>{input("Account number", "account")}<span /><label className="loan-field">Date of first appointment<input type="date" className="field-input" {...register("appointment")} /></label>{input("Phone number", "phone", "tel")}{input("Date of birth", "dob", "date")}</div></section>
    <section className="panel form-panel"><div className="form-section-title"><span>GUARANTORS</span><h3>Two guarantors required</h3></div><div className="loan-form-grid">{input("Guarantor 1 · full name", "guarantorOne")}{input("Guarantor 1 · PSN", "guarantorOnePsn")}{input("Guarantor 1 · phone", "guarantorOnePhone", "tel")}{input("Guarantor 2 · full name", "guarantorTwo")}{input("Guarantor 2 · PSN", "guarantorTwoPsn")}{input("Guarantor 2 · phone", "guarantorTwoPhone", "tel")}</div><div className="liability-notice"><ShieldCheck size={18} /><span>Guarantor liability notice: should the borrower leave service with an outstanding balance, the guarantors may be liable for repayment in accordance with the cooperative&apos;s by-laws.</span></div><div className="signature-grid"><div><span>Guarantor 1 signature</span><div className="signature-line">Signature placeholder</div></div><div><span>Guarantor 2 signature</span><div className="signature-line">Signature placeholder</div></div></div></section>
    <section className="panel form-panel"><div className="form-section-title"><span>SECTION B</span><h3>Salary deduction authorization</h3></div><label className="consent-check"><input type="checkbox" {...register("salaryConsent")} /> I authorize the cooperative to deduct the approved repayment from my monthly salary.</label>{error("salaryConsent") && <small className="field-error">{error("salaryConsent")}</small>}<div className="signature-grid"><div><span>Applicant signature</span><div className="signature-line">Signature placeholder</div></div><label className="loan-field">Date<input type="date" className="field-input" defaultValue="2026-11-19" /></label></div></section>
    <section className="panel form-panel calculator-panel"><div className="form-section-title"><span>LOAN CALCULATOR</span><h3><Calculator size={16} /> Estimate repayments</h3></div><div className="calculator-controls"><label>Annual interest rate (%)<input type="number" className="field-input" min="0" max="40" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label><label>Tenure<select className="field-input" value={tenure} onChange={(event) => setTenure(Number(event.target.value))}>{[3, 6, 9, 12, 18, 24].map((months) => <option key={months} value={months}>{months} months</option>)}</select></label><div><small>Estimated monthly repayment</small><strong>{currency(monthlyPayment)}</strong><small>{currency(interestTotal)} total flat interest</small></div></div><div className="table-wrap repayment-table"><table><thead><tr><th>MONTH</th><th>OPENING BALANCE</th><th>PRINCIPAL</th><th>INTEREST</th><th>REPAYMENT</th><th>CLOSING BALANCE</th></tr></thead><tbody>{Array.from({ length: Math.min(tenure, 12) }, (_, i) => { const principal = amount / tenure; const interest = interestTotal / tenure; const opening = amount - principal * i; return <tr key={i}><td>{i + 1}</td><td>{currency(opening)}</td><td>{currency(principal)}</td><td>{currency(interest)}</td><td>{currency(monthlyPayment)}</td><td>{currency(Math.max(0, opening - principal))}</td></tr>; })}</tbody></table></div></section>
    <section className="panel form-panel"><div className="form-section-title"><span>SECTION C</span><h3>Official use</h3></div><div className="loan-form-grid"><label className="loan-field">Amount approved (₦)<input className="field-input" type="number" defaultValue={amount} /></label><label className="loan-field">Interest rate (%)<input className="field-input" type="number" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label></div><div className="approval-actions"><button type="button" className="button button-outline" onClick={() => window.print()}><Printer size={15} /> Print loan form</button><button type="button" className="button button-outline" onClick={() => window.alert("Secretary approval recorded in this demo.")}>Secretary approval</button><button type="button" className="button button-outline" onClick={() => window.alert("Chairman approval recorded in this demo.")}>Chairman approval</button><button className="button button-primary" type="submit"><FileText size={15} /> Submit application</button></div></section>
  </form></div>;
}
