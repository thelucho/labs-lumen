"use client";

import { ArrowRight, WarningCircle, X } from "@phosphor-icons/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { project, type SelectableId } from "@/data/building";
import { getUnit } from "@/lib/building";
import { selectableTitle } from "@/lib/format";
import { useUIStore } from "@/lib/store";

const CONTACT_OPTIONS = ["WhatsApp", "Llamada", "Email"] as const;
type ContactOption = (typeof CONTACT_OPTIONS)[number];

interface Values {
  name: string;
  email: string;
  phone: string;
  contact: ContactOption;
  message: string;
  accepted: boolean;
}

type Errors = Partial<Record<keyof Values, string>>;

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: Values): Errors {
  const errors: Errors = {};
  if (v.name.trim().split(/\s+/).length < 2) errors.name = "Ingresá nombre y apellido.";
  if (!v.email.trim()) errors.email = "Ingresá un email.";
  else if (!EMAIL.test(v.email.trim())) errors.email = "Revisá el formato del email (ej.: nombre@dominio.com).";
  if (v.phone.replace(/\D/g, "").length < 8) errors.phone = "Ingresá un teléfono con código de área (mínimo 8 dígitos).";
  if (!v.accepted) errors.accepted = "Necesitamos tu aceptación para responder la consulta.";
  return errors;
}

function suggestedMessage(id: SelectableId): string {
  if (getUnit(id)) {
    return `Hola, quisiera recibir más información sobre ${selectableTitle(id)}: disponibilidad, formas de pago y fecha de entrega.`;
  }
  return "Hola, quisiera conocer más sobre los amenities del edificio: SUM, pileta y gimnasio.";
}

const inputClass =
  "mt-2 w-full rounded-xs border px-3.5 py-3 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-stone-400 focus:border-ink";

const labelClass = "label-tech text-stone-600";

const submitButton =
  "group flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm text-white transition-colors duration-200 hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs text-ink">
          <WarningCircle size={14} weight="light" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-stone-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function InquiryForm({ targetId, onClose }: { targetId: SelectableId; onClose: () => void }) {
  const uid = useId();
  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    phone: `${uid}-phone`,
    unit: `${uid}-unit`,
    message: `${uid}-message`,
    accepted: `${uid}-accepted`,
  };
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    phone: "",
    contact: "WhatsApp",
    message: suggestedMessage(targetId),
    accepted: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const doneHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (sent) doneHeading.current?.focus();
  }, [sent]);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    // Después del primer intento, los errores se corrigen mientras se escribe.
    if (submitted) setErrors(validate(next));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(ids) as (keyof typeof ids)[]).find((k) => k in found);
    if (first) {
      form.current?.querySelector<HTMLElement>(`#${CSS.escape(ids[first])}`)?.focus();
      return;
    }
    // Demo: no se envía nada a ningún lado.
    setSent(true);
  }

  const describedBy = (key: keyof Values) => (errors[key] ? `${ids[key as keyof typeof ids]}-error` : undefined);
  const borderFor = (key: keyof Values) => (errors[key] ? "border-ink bg-stone-50" : "border-stone-200 bg-white");

  if (sent) {
    return (
      <div className="px-6 py-8 sm:px-8">
        <p className={labelClass}>{selectableTitle(targetId)}</p>
        <h2 ref={doneHeading} tabIndex={-1} className="mt-3 font-display text-heading font-medium outline-none">
          Gracias, {values.name.trim().split(/\s+/)[0]}.
        </h2>
        <p className="mt-4 text-sm leading-relaxed">
          En un sitio real, {project.developer} te contactaría por {values.contact.toLowerCase()} al{" "}
          {values.contact === "Email" ? values.email : values.phone} para responder tu consulta.
        </p>
        <p role="status" className="mt-6 rounded-sm bg-stone-50 px-4 py-3 text-sm">
          Esto es una demo: el formulario no envía datos.
        </p>
        <button
          type="button"
          onClick={onClose}
          className={`${submitButton} mt-8`}
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <form ref={form} noValidate onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-6 sm:px-8">
      <Field id={ids.name} label="Nombre y apellido" error={errors.name}>
        <input
          id={ids.name}
          name="name"
          autoComplete="name"
          required
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={describedBy("name")}
          className={`${inputClass} ${borderFor("name")}`}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={ids.email} label="Email" error={errors.email}>
          <input
            id={ids.email}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
            className={`${inputClass} ${borderFor("email")}`}
          />
        </Field>
        <Field id={ids.phone} label="Teléfono" error={errors.phone}>
          <input
            id={ids.phone}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="11 5555 0000"
            required
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone")}
            className={`${inputClass} ${borderFor("phone")} tabular-nums`}
          />
        </Field>
      </div>

      <Field id={ids.unit} label="Unidad">
        <input
          id={ids.unit}
          name="unit"
          readOnly
          value={selectableTitle(targetId)}
          className={`${inputClass} border-stone-200 bg-stone-50 text-stone-600`}
        />
      </Field>

      <fieldset>
        <legend className={labelClass}>
          Cómo preferís que te contactemos
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CONTACT_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm transition-colors duration-200 has-checked:border-ink has-checked:bg-ink has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
            >
              <input
                type="radio"
                name="contact"
                value={option}
                checked={values.contact === option}
                onChange={() => update("contact", option)}
                className="sr-only"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <Field id={ids.message} label="Mensaje (opcional)">
        <textarea
          id={ids.message}
          name="message"
          rows={3}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          className={`${inputClass} border-stone-200 bg-white resize-none leading-relaxed`}
        />
      </Field>

      <div>
        <label className="flex items-start gap-3 text-sm">
          <input
            id={ids.accepted}
            type="checkbox"
            name="accepted"
            checked={values.accepted}
            onChange={(e) => update("accepted", e.target.checked)}
            aria-invalid={!!errors.accepted}
            aria-describedby={describedBy("accepted")}
            className="mt-0.5 size-4 accent-ink"
          />
          <span>Acepto que {project.developer} me contacte para responder esta consulta.</span>
        </label>
        {errors.accepted && (
          <p id={`${ids.accepted}-error`} className="mt-1.5 flex items-center gap-1.5 pl-7 text-xs text-ink">
            <WarningCircle size={14} weight="light" aria-hidden />
            {errors.accepted}
          </p>
        )}
      </div>

      <button
        type="submit"
        className={submitButton}
      >
        Enviar consulta
        <ArrowRight size={18} weight="light" aria-hidden className="transition-transform duration-200 ease-arch group-hover:translate-x-1" />
      </button>
      <p className="-mt-2 text-center text-xs text-stone-600">Demo: el formulario no envía datos.</p>
    </form>
  );
}

/**
 * Modal "Solicitar información" (SPEC §6.2). `<dialog>` nativo: showModal()
 * deja el resto inerte (el foco no sale), Esc cierra y el navegador devuelve
 * el foco al botón que lo abrió.
 */
export function InquiryModal() {
  const isOpen = useUIStore((s) => s.isModalOpen);
  const selectedId = useUIStore((s) => s.selectedId);
  const closeModal = useUIStore((s) => s.closeModal);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (isOpen && !d.open) {
      d.showModal();
      // showModal enfoca la X (primer enfocable); arrancamos en el primer campo.
      d.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    }
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  // Focus trap estricto: el <dialog> nativo deja salir el foco a la interfaz
  // del navegador; acá el último Tab vuelve al primero y viceversa.
  function handleKeyDown(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key !== "Tab") return;
    const focusables = [...e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !e.currentTarget.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const target = isOpen ? selectedId : null;
  const isUnit = target ? !!getUnit(target) : false;

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      data-lenis-prevent
      onClose={closeModal}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        // Click en el fondo (fuera de la caja) cierra.
        if (e.target === e.currentTarget) closeModal();
      }}
      className="m-auto max-h-[92svh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto overscroll-contain rounded-lg bg-paper p-0 text-ink backdrop:bg-ink/55"
    >
      {target && (
        <>
          <header className="flex items-start justify-between gap-4 border-b border-stone-200 px-6 pt-6 pb-5 sm:px-8">
            <div>
              <p className={labelClass}>{project.name}</p>
              <h2 id={titleId} className="mt-3 font-display text-heading font-medium">
                {isUnit ? "Solicitar información" : "Consultar por amenities"}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Cerrar formulario"
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-stone-200 text-ink transition-colors duration-200 hover:border-ink focus-visible:outline-2 focus-visible:outline-ink"
            >
              <X size={20} weight="light" aria-hidden />
            </button>
          </header>
          <InquiryForm key={target} targetId={target} onClose={closeModal} />
        </>
      )}
    </dialog>
  );
}
