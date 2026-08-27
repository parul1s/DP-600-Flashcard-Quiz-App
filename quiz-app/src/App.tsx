//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useMemo, useState } from "react";
import { BookOpen, Check, ChevronLeft, ChevronRight, CircleAlert, RotateCcw, SunMoon } from "lucide-react";
import { DataGrid } from "@microsoft/fabric-datagrid";
import { useCssTheme } from "@microsoft/fabric-visuals";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { useAppTheme } from "@/hooks/use-theme";
import { toDataTable } from "@/lib/to-data-table";
import { flashcards } from "@/queries/flashcards";

function App() {
    const theme = useCssTheme();
    const { isDark, toggleTheme } = useAppTheme();
    const { connection, query, columnMetadata } = flashcards();
    const { data, isLoading, error, refetch } = useSemanticModelQuery({ connection, query });
    const [category, setCategory] = useState("All cards");
    const [cardIndex, setCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [completed, setCompleted] = useState<Record<string, boolean>>({});

    const dataTable = data?.status === "success" ? toDataTable(data.table, columnMetadata) : undefined;
    const columns = dataTable?.columns ?? [];
    const categoryIndex = columns.findIndex((column) => column.name === "Category");
    const questionIndex = columns.findIndex((column) => column.name === "Question");
    const answerIndex = columns.findIndex((column) => column.name === "Answer");
    const cards = useMemo(() => dataTable?.rows ?? [], [dataTable]);
    const categories = useMemo(() => ["All cards", ...new Set(cards.map((row) => String(row[categoryIndex] ?? "Uncategorized")))], [cards, categoryIndex]);
    const visibleCards = category === "All cards" ? cards : cards.filter((row) => String(row[categoryIndex]) === category);
    const activeRow = visibleCards[cardIndex] ?? visibleCards[0];
    const activeKey = activeRow ? `${activeRow[categoryIndex]}-${activeRow[questionIndex]}` : "";
    const completedCount = visibleCards.filter((row) => completed[`${row[categoryIndex]}-${row[questionIndex]}`]).length;
    const totalCompleted = cards.filter((row) => completed[`${row[categoryIndex]}-${row[questionIndex]}`]).length;

    function selectCategory(nextCategory: string) {
        setCategory(nextCategory);
        setCardIndex(0);
        setShowAnswer(false);
    }

    function nextCard() {
        setCardIndex((current) => visibleCards.length ? (current + 1) % visibleCards.length : 0);
        setShowAnswer(false);
    }

    function previousCard() {
        setCardIndex((current) => visibleCards.length ? (current - 1 + visibleCards.length) % visibleCards.length : 0);
        setShowAnswer(false);
    }

    function markKnown() {
        if (!activeKey) return;
        setCompleted((current) => ({ ...current, [activeKey]: true }));
        nextCard();
    }

    return (
        <main className="min-h-full bg-background">
            <header className="border-b border-border bg-card/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-[1440px] items-center justify-between px-400 py-300 lg:px-800">
                    <div className="flex items-center gap-300">
                        <span className="flex icon-size-500 items-center justify-center rounded-md bg-primary text-primary-foreground"><BookOpen className="icon-size-300" /></span>
                        <div><p className="font-heading text-500 font-bold tracking-tight">Recall room</p><p className="text-200 text-muted-foreground">Semantic model study deck</p></div>
                    </div>
                    <button type="button" onClick={toggleTheme} className="flex items-center gap-200 rounded-md border border-border px-300 py-200 text-300 font-semibold transition-colors hover:bg-accent" aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}><SunMoon className="icon-size-200" /> <span className="hidden sm:inline">Theme</span></button>
                </div>
            </header>

            <div className="mx-auto grid max-w-[1440px] gap-800 px-400 py-700 lg:grid-cols-[220px_1fr] lg:px-800">
                <aside>
                    <p className="mb-300 text-200 font-bold uppercase tracking-[0.12em] text-muted-foreground">Decks</p>
                    <nav className="flex gap-200 overflow-x-auto lg:block lg:space-y-100" aria-label="Flashcard categories">
                        {categories.map((item) => {
                            const count = item === "All cards" ? cards.length : cards.filter((row) => String(row[categoryIndex]) === item).length;
                            return <button key={item} type="button" onClick={() => selectCategory(item)} className={`flex min-w-max w-full items-center justify-between rounded-md px-300 py-200 text-left text-300 transition-colors ${category === item ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"}`}><span>{item}</span><span className={`ml-300 text-200 ${category === item ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{count}</span></button>;
                        })}
                    </nav>
                    <div className="mt-700 hidden border-t border-border pt-500 lg:block"><p className="text-200 text-muted-foreground">Overall recall</p><p className="mt-100 font-numeric text-hero-700 font-bold">{totalCompleted}<span className="text-400 font-medium text-muted-foreground"> / {cards.length}</span></p></div>
                </aside>

                <section className="min-w-0">
                    <div className="mb-600 flex flex-wrap items-end justify-between gap-300"><div><p className="text-200 font-bold uppercase tracking-[0.12em] text-primary">Active deck</p><h1 className="mt-100 font-heading text-hero-800 font-bold tracking-tight">{category}</h1></div><div className="text-right"><p className="text-200 text-muted-foreground">Deck progress</p><p className="font-numeric text-600 font-bold">{completedCount} <span className="text-300 font-medium text-muted-foreground">/ {visibleCards.length}</span></p></div></div>
                    {isLoading && <div className="flex min-h-[360px] animate-pulse items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">Loading your deck...</div>}
                    {(error || data?.status === "error") && <div className="flex items-center gap-300 rounded-md border border-destructive/30 bg-destructive/10 p-400 text-300"><CircleAlert className="icon-size-300 text-destructive" /><span>{error?.message ?? (data?.status === "error" ? data.error.message : "Unable to load the deck.")}</span><button type="button" onClick={() => refetch()} className="ml-auto font-semibold underline">Retry</button></div>}
                    {!isLoading && !error && data?.status === "success" && !activeRow && <div className="rounded-lg border border-border bg-card p-800 text-center text-muted-foreground">No cards found in this deck.</div>}
                    {!isLoading && !error && activeRow && <>
                        <article className="study-card relative overflow-hidden rounded-lg border border-border bg-card p-600 shadow-sm sm:p-800">
                            <div className="absolute left-0 top-0 h-1 w-full bg-primary" />
                            <div className="flex items-center justify-between"><span className="rounded-full bg-accent px-300 py-100 text-200 font-bold uppercase tracking-[0.1em] text-accent-foreground">{String(activeRow[categoryIndex])}</span><span className="font-numeric text-300 text-muted-foreground">{cardIndex + 1} / {visibleCards.length}</span></div>
                            <div className="flex min-h-[250px] flex-col justify-center py-700"><p className="mb-300 text-200 font-bold uppercase tracking-[0.12em] text-muted-foreground">{showAnswer ? "Answer" : "Question"}</p><p className="max-w-3xl font-heading text-hero-700 font-bold leading-tight">{String(activeRow[showAnswer ? answerIndex : questionIndex])}</p></div>
                            <div className="flex flex-wrap items-center justify-between gap-300 border-t border-border pt-500"><button type="button" onClick={() => setShowAnswer((current) => !current)} className="rounded-md border border-border px-400 py-300 text-300 font-semibold hover:bg-accent">{showAnswer ? "Show question" : "Reveal answer"}</button><div className="flex items-center gap-200"><button type="button" onClick={previousCard} className="flex icon-size-500 items-center justify-center rounded-md border border-border hover:bg-accent" aria-label="Previous card"><ChevronLeft className="icon-size-300" /></button><button type="button" onClick={markKnown} className="flex items-center gap-200 rounded-md bg-primary px-400 py-300 text-300 font-bold text-primary-foreground hover:opacity-90"><Check className="icon-size-200" /> Got it</button><button type="button" onClick={nextCard} className="flex icon-size-500 items-center justify-center rounded-md border border-border hover:bg-accent" aria-label="Next card"><ChevronRight className="icon-size-300" /></button></div></div>
                        </article>
                        <div className="mt-800 flex items-center justify-between"><h2 className="font-heading text-500 font-bold">All flashcards</h2><button type="button" onClick={() => { setCompleted({}); setCardIndex(0); setShowAnswer(false); }} className="flex items-center gap-200 text-300 font-semibold text-muted-foreground hover:text-foreground"><RotateCcw className="icon-size-200" /> Reset progress</button></div>
                        <div className="mt-300 overflow-hidden rounded-lg border border-border bg-card"><DataGrid data={dataTable} theme={theme} pageSize={10} capabilities={{ pagination: true, virtualization: true }} /></div>
                    </>}
                </section>
            </div>
        </main>
    );
}

export default App;
