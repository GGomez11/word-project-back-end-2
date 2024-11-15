export interface Word {
    word: string;
    id: number;
    results: {
        definition: string;
        synonym?: string;
        partOfSpeech: string;
    }[];
    pronunciation?: {
        written: string;
        audioURL: string;
    }
}