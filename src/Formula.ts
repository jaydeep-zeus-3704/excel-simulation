export class Formula {
    public static evaluate(text: string): string {
        if (!text.startsWith("=")) {
            return text;
        }

        const expression = text.slice(1).trim();

        if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
            return "#ERROR";
        }

        try {
            const result = Function(`"use strict"; return (${expression})`)();

            if (!Number.isFinite(result)) {
                return "#ERROR";
            }

            return result.toString();
        } catch {
            return "#ERROR";
        }
    }
}