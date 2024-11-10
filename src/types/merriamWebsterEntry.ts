// Interface representing a pronunciation sound with optional audio information
interface Sound {
    audio?: string;
    ref?: string;
    stat?: string;
}

// Interface representing pronunciation information
interface Pronunciation {
    mw: string;           // Main pronunciation format (e.g., IPA or phonetic)
    sound?: Sound;        // Optional sound object if audio is available
}

// Interface for headword information, including word itself and pronunciation
interface Hwi {
    hw: string;           // The headword (e.g., the word's spelling with syllable separation)
    prs?: Pronunciation[]; // Array of pronunciation entries
}

// Interface for a synonym list entry
interface Synonym {
    syn_list: Array<Array<string>>; // Synonym groups, where each group is an array of strings
}

// Interface for definition sections, including senses of the word and synonyms
interface Definition {
    sseq: Array<Array<Array<{
        sn?: string;      // Sense number (optional)
        dt: Array<[string, string | Array<string[]>]>; // Definition text and other elements
        syn_list?: Synonym[];  // Optional synonyms list
    }>>>;
}

// Main interface representing an entry in the dictionary
export interface MerriamWebsterEntry {
    meta: {
        id: string;
        uuid: string;
        sort?: string;
        src?: string;
        section?: string;
        stems: string[];
        offensive: boolean;
    };
    hwi: Hwi;              // Headword information
    fl?: string;           // Functional label (e.g., part of speech)
    def?: Definition[];    // Definitions array with potential synonyms
    shortdef?: string[];   // Simplified definitions
    syns?: any;
}