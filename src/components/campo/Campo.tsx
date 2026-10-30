import type { InputHTMLAttributes } from "react";
import "./Campo.css";

export interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    classname?: string;
}

export function Campo({
    placeholder,
    type = "text",
    className = "",
    classname = "",
    ...props
}: CampoProps) {
    const finalClassName = className || classname;
    const classes = ["campo", finalClassName].filter(Boolean).join(" ");

    return (
        <input
            className={classes}
            type={type}
            placeholder={placeholder || "Digite algo..."}
            {...props}
        />
    );
}

export default Campo;
