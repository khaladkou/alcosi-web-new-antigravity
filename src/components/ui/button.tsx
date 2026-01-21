import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Slot } from '@radix-ui/react-slot'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'link' | 'secondary' | 'destructive'
    size?: 'sm' | 'md' | 'lg'
    asChild?: boolean
}

export const buttonVariants = ({ variant = 'default', size = 'md', className = '' }: {
    variant?: 'default' | 'outline' | 'ghost' | 'link' | 'secondary' | 'destructive',
    size?: 'sm' | 'md' | 'lg',
    className?: string
} = {}) => {
    return twMerge(
        clsx(
            'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
            {
                'bg-primary text-primary-foreground hover:bg-primary/90 shadow': variant === 'default',
                'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm': variant === 'destructive',
                'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
                'border border-input bg-transparent hover:bg-secondary hover:text-secondary-foreground': variant === 'outline',
                'hover:bg-secondary hover:text-secondary-foreground': variant === 'ghost',
                'text-primary underline-offset-4 hover:underline': variant === 'link',
                'h-9 px-3 text-sm': size === 'sm',
                'h-10 px-4 py-2': size === 'md',
                'h-11 px-8 rounded-md': size === 'lg',
            },
            className
        )
    )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'md', asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                ref={ref}
                className={buttonVariants({ variant, size, className })}
                {...props}
            />
        )
    }
)

Button.displayName = 'Button'
