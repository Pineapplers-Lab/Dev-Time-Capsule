import { cn } from "@/lib/utils";
import { forwardRef, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "dark" | "outline";
    size?: "sm" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "lg", ...props }, ref) => {
        const base = "rounded-3xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl";

        const variants = {
            primary: "bg-[#0071e3] text-white hover:bg-[#0077ED] shadow-[#0071e3]/20 disabled:opacity-20 disabled:grayscale",
            dark: "bg-[#1D1D1F] text-white hover:bg-[#323235]",
            outline: "border border-[#E8E8ED] bg-white hover:bg-[#F5F5F7]",
        };

        const sizes = {
            sm: "px-4 py-2 text-[13px]",
            lg: "py-5 text-[17px] w-full",
        };

        return (
            <button
                ref={ref}
                className={cn(base, variants[variant], sizes[size], className)}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button };