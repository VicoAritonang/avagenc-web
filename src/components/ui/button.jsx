import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 disabled:pointer-events-none disabled:opacity-50 steel-shine",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900 hover:from-slate-200 hover:to-slate-300 shadow-lg shadow-black/50 font-semibold",
                destructive:
                    "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-900/50",
                outline:
                    "border-2 border-slate-500/50 bg-slate-800/30 text-slate-200 hover:bg-slate-700/50 hover:border-slate-400/70 backdrop-blur-sm",
                secondary:
                    "bg-gradient-to-br from-slate-700/60 to-slate-800/60 text-slate-100 hover:from-slate-600/70 hover:to-slate-700/70 border border-slate-600/30 backdrop-blur-sm",
                ghost: "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200",
                link: "text-slate-300 underline-offset-4 hover:underline hover:text-slate-100",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-12 rounded-lg px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
    return (
        <button
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button, buttonVariants }
