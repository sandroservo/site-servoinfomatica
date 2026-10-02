"use client";

export function DeleteButton({
  action,
  id,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Excluir ${label}? Essa ação não pode ser desfeita.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="h-9 rounded-full border border-black/10 px-3 text-sm font-semibold text-primary hover:bg-red-50">
        Excluir
      </button>
    </form>
  );
}
