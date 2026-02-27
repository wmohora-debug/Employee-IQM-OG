"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
    const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    const display = useTransform(spring, (current) => Math.round(current));

    return <motion.span>{display}</motion.span>;
}
