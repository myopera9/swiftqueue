
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTransition } from "react";

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const onSelectChange = (newLocale: string) => {
        startTransition(() => {
            router.replace(pathname, { locale: newLocale });
        });
    };

    return (
        <Select value={locale} onValueChange={onSelectChange} disabled={isPending}>
            <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
            </SelectContent>
        </Select>
    );
}
