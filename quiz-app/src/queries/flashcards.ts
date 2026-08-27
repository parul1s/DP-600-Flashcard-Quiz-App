import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./flashcards.dax?raw";

export const flashcardsColumnMetadata: ColumnMetadataMap = {
    "[Category]": { name: "Category", displayName: "Category" },
    "[Question]": { name: "Question", displayName: "Question" },
    "[Answer]": { name: "Answer", displayName: "Answer" },
};

export function flashcards() {
    return {
        connection: "flashcards",
        query,
        columnMetadata: flashcardsColumnMetadata,
    };
}