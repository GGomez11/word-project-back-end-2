export interface Word {
    word: string;
    id: number;
    results: {
        definition: string;
        synonym?: string;
        partOfSpeech: string;
    }[];
    pronunciation?: string;
}