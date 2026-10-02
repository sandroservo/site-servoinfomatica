import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
