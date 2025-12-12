import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import tw from 'twrnc';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export { tw };
