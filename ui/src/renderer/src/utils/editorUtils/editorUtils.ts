import { snippetCompletion } from '@codemirror/autocomplete';
import { tags } from '@codemirror/highlight';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { yamlFrontmatter, yamlLanguage } from '@codemirror/lang-yaml';
import { LanguageSupport, LRLanguage, syntaxTree } from '@codemirror/language';
import { Diagnostic, linter } from '@codemirror/lint';
import { basicSetup, EditorState } from '@uiw/react-codemirror';
import dayjs from 'dayjs';
import jsyaml from 'js-yaml';
import {
    fetchCompletionTries,
    fetchLspTypes,
} from '../../services/queryService/queryService';
import { getSnippets } from '../../services/snippetsService/snippetsService';
import { DynamicTrie } from './trie';

/*==============================================================================
  HELPER FUNCTIONS
==============================================================================*/

/**
 * Replaces all '/' characters in a string with double underscores ('__').
 * Example: "path/to/example" becomes "path__to__example".
 */
function replaceSlashWithDoubleUnderscore(str: string): string {
    return str.replace(/\//g, '__');
}

/**
 * Replaces all double underscores ('__') in a string with '/' characters.
 * Example: "path__to__example" becomes "path/to/example".
 */
function replaceDoubleUnderscoreWithSlash(str: string): string {
    return str.replace(/__/g, '/');
}

/*==============================================================================
  INTERFACES
==============================================================================*/
interface EnhancerOptions {
    lintDelay?: number;
    minSuggestionLength?: number;
    maxSuggestions?: number;
    [key: string]: any;
}

interface Snippet {
    id: string;
    owner: any;
    name: string;
    content: string;
    created_on: string;
}

type LspEntryClass = {
    type: string;
    subtype: string;
    description: string;
    regex: string | null;
    options: string | null;
    color: string;
    format: string | null;
};

interface Suggestion {
    from: number;
    type: string;
    match: string;
}

interface AutocompleteContext {
    pos: number;
    explicit?: boolean;
    state: EditorState;
    matchBefore: (regex: RegExp) => { from: number; to: number; text: string };
}

interface AutocompleteResult {
    from: number;
    to?: number;
    options: Array<{ type: string; label: string }>;
}

interface MarkdownLanguageConfig {
    base: LRLanguage;
    codeLanguages?: readonly any[];
    extensions?: readonly any[];
}

/*==============================================================================
  CRADLE EDITOR CLASS
  Provides autocomplete, linting, markdown integration, and link auto-
  formatting functionalities for a text editor with LSP integration.
==============================================================================*/
export class CradleEditor {
    /*---------------------------------------------------------------------------
    Static Properties (Cache for EntryClasses, Tries, and Snippets)
  ---------------------------------------------------------------------------*/
    private static entryClassesPromise: Promise<any> | null = null;
    private static cachedEntryClasses: { [key: string]: LspEntryClass } | null = null;

    private static triesPromise: Promise<any> | null = null;
    private static cachedTries: { [key: string]: DynamicTrie } | null = null;

    private static cachedBigTrie: DynamicTrie | null = null;

    private static snippetsPromise: Promise<any> | null = null;
    private static cachedSnippets: Snippet[] | null = null;

    /*---------------------------------------------------------------------------
    Instance Properties
  ---------------------------------------------------------------------------*/
    private entryClasses: { [key: string]: LspEntryClass } | null;
    private tries: { [key: string]: DynamicTrie } | null;
    private bigTrie: DynamicTrie | null;
    private snippets: Snippet[] | null;
    private _ready: Promise<boolean>;
    private _onError: ((error: Error) => void) | null;
    private _onLspLoaded: (bool: boolean) => void;

    private combinedRegex: RegExp | null = null; // for scanning large text
    private combinedWordRegex: RegExp | null = null; // for whole-word matching

    /*---------------------------------------------------------------------------
    Constructor & Initialization
  ---------------------------------------------------------------------------*/
    constructor(
        options: EnhancerOptions = {},
        onLspLoaded: (bool: boolean) => void,
        onError: ((error: Error) => void) | null = null,
    ) {
        this.entryClasses = null;
        this.tries = null;
        this.snippets = null;
        this._onError = onError;
        this._onLspLoaded = onLspLoaded;
        this._ready = this.initializeEntryClassesTriesAndSnippets().then((ready) => {
            this._onLspLoaded(ready);
            return ready;
        });
    }

    /**
     * Creates the combined regex patterns from all entry classes that define a regex.
     * Builds two regexes:
     *  - combinedRegex: used to scan larger texts (with global & ignore-case flags)
     *  - combinedWordRegex: used for whole-word matching (anchored with ^ and $)
     */
    private buildCombinedRegex(): void {
        if (!this.entryClasses) return;
        const patterns: string[] = [];
        for (const [type, criteria] of Object.entries(this.entryClasses)) {
            if (criteria.format == 'regex') {
                // Wrap each pattern in a named capturing group using the entry type.
                patterns.push(
                    `(?<${replaceSlashWithDoubleUnderscore(type)}>(?<=^|\\s)${criteria.regex}(?=$|\\s))`,
                );
            }
        }
        if (patterns.length > 0) {
            const pattern = patterns.join('|');
            this.combinedRegex = new RegExp(pattern, 'gi'); // For scanning text
            this.combinedWordRegex = this.combinedRegex;
        }
    }

    /**
     * Wait until the entry classes, tries, and snippets are fetched and cached.
     * Uses static caching to ensure only one fetch is made for each resource.
     */
    private async initializeEntryClassesTriesAndSnippets(): Promise<boolean> {
        try {
            // Fetch entry classes
            if (CradleEditor.cachedEntryClasses) {
                this.entryClasses = CradleEditor.cachedEntryClasses;
            } else {
                if (!CradleEditor.entryClassesPromise) {
                    CradleEditor.entryClassesPromise = fetchLspTypes().then(
                        (response) => response.data,
                    );
                }
                const entryClasses = await CradleEditor.entryClassesPromise;
                this.entryClasses = entryClasses;
                CradleEditor.cachedEntryClasses = entryClasses;
            }

            // Fetch tries
            if (CradleEditor.cachedTries) {
                this.tries = CradleEditor.cachedTries;
            } else {
                if (!CradleEditor.triesPromise) {
                    CradleEditor.triesPromise = fetchCompletionTries().then(
                        (response) => {
                            const tries: { [key: string]: DynamicTrie } = {};
                            for (const [type, trie] of Object.entries(response.data)) {
                                tries[type] = new DynamicTrie(null, type, -1);
                                tries[type].mergeTrie('', trie);
                            }

                            for (const entryClass of Object.values(this.entryClasses)) {
                                if (entryClass.format) continue;
                                if (entryClass.type == 'entity') continue;

                                tries[entryClass.subtype] = new DynamicTrie(
                                    async (x) => {
                                        try {
                                            let result = await fetchCompletionTries(
                                                entryClass.subtype,
                                                x,
                                            );
                                            if (
                                                result.data &&
                                                result.data[entryClass.subtype]
                                            ) {
                                                let trie =
                                                    result.data[entryClass.subtype];

                                                for (const char of x) {
                                                    if (!trie.c || !trie.c[char]) {
                                                        return {};
                                                    }
                                                    trie = trie.c[char];
                                                }

                                                return trie;
                                            }
                                            return {};
                                        } catch (error) {
                                            console.error(
                                                'Error fetching trie data:',
                                                error,
                                            );
                                            if (this._onError)
                                                this._onError(error as Error);
                                            return {};
                                        }
                                    },
                                    entryClass.subtype,
                                    3,
                                );
                            }
                            return tries;
                        },
                    );
                }
                const tries = await CradleEditor.triesPromise;
                this.tries = tries;
                CradleEditor.cachedTries = tries;
            }

            if (CradleEditor.cachedBigTrie) {
                this.bigTrie = CradleEditor.cachedBigTrie;
            } else {
                const bigTrie = new DynamicTrie(null, '', -1);

                for (const entryClass of Object.values(this.entryClasses)) {
                    if (!entryClass.format || entryClass.type != 'entity') continue;
                    if (!this.tries) continue;
                    if (!this.tries[entryClass.subtype]) continue;
                    bigTrie.merge(this.tries[entryClass.subtype]);
                }
                this.bigTrie = bigTrie;
                CradleEditor.cachedBigTrie = bigTrie;
            }

            // Fetch snippets
            if (CradleEditor.cachedSnippets) {
                this.snippets = CradleEditor.cachedSnippets;
            } else {
                if (!CradleEditor.snippetsPromise) {
                    CradleEditor.snippetsPromise = getSnippets().then(
                        (response) => response.data || [],
                    );
                }
                const snippets = await CradleEditor.snippetsPromise;
                this.snippets = snippets;
                CradleEditor.cachedSnippets = snippets;
            }

            this.buildCombinedRegex();
            return true;
        } catch (error) {
            console.log(error);
            if (this._onError) this._onError(error as Error);
            else throw error;
            return false;
        }
    }

    /**
     * Returns a promise that resolves when the editor is ready.
     */
    ready(): Promise<boolean> {
        return this._ready;
    }

    /**
     * Returns the cached snippets once they are loaded.
     * Should be called after ensuring the editor is ready.
     */
    getSnippets(): Snippet[] | null {
        return this.snippets;
    }

    /**
     * Static method to get cached snippets without needing an instance.
     * Returns null if snippets haven't been fetched yet.
     */
    static getCachedSnippets(): Snippet[] | null {
        return CradleEditor.cachedSnippets;
    }

    /**
     * Static method to invalidate the snippet cache and force a refresh on next access.
     * Useful when snippets are created, updated, or deleted.
     */
    static invalidateSnippetsCache(): void {
        CradleEditor.cachedSnippets = null;
        CradleEditor.snippetsPromise = null;
    }

    /**
     * Instance method to refresh snippets from the server.
     * This will update both the instance and static cache.
     */
    async refreshSnippets(): Promise<Snippet[]> {
        try {
            CradleEditor.invalidateSnippetsCache();
            const response = await getSnippets();
            const snippets = response.data || [];
            this.snippets = snippets;
            CradleEditor.cachedSnippets = snippets;
            return snippets;
        } catch (error) {
            console.error('Error refreshing snippets:', error);
            if (this._onError) this._onError(error as Error);
            throw error;
        }
    }

    /**
     * Public method to get snippet completions for testing or external use.
     * @param filter Optional filter string to match against snippet names
     */
    getSnippetCompletions(filter?: string): Array<any> {
        return this.createSnippetCompletions(filter);
    }

    /*============================================================================
    AUTOCOMPLETE METHODS
  =============================================================================*/

    /**
     * Creates snippet completion objects from cached snippets.
     * Converts snippet content into CodeMirror snippet completions with placeholders.
     * @param filter Optional filter string to match against snippet names
     */
    private createSnippetCompletions(filter?: string): Array<any> {
        if (!this.snippets) return [];

        let filteredSnippets = this.snippets;

        // Filter snippets by name if filter is provided
        if (filter && filter.trim().length > 0) {
            const filterLower = filter.toLowerCase();
            filteredSnippets = this.snippets.filter((snippet) =>
                snippet.name.toLowerCase().includes(filterLower),
            );
        }

        return filteredSnippets.map((snippet) =>
            snippetCompletion(snippet.content, {
                label: snippet.name,
                type: 'text',
                info: `${snippet.content.substring(0, 100)}${snippet.content.length > 100 ? '...' : ''}`,
            }),
        );
    }

    /**
     * Public method to retrieve the autocomplete extension.
     * It registers the autocomplete function with the markdown language.
     */
    autocomplete(): any {
        return [
            markdownLanguage.data.of({
                autocomplete: this.provideAutocompleteSuggestions.bind(this),
            }),
            yamlLanguage.data.of({
                autocomplete: this.provideAutocompleteSuggestionsForYaml.bind(this),
            }),
        ];
    }

    /**
     * Returns suggestions for a chunk of text using an optimized approach.
     * This method first builds a combined regex with named groups from all entry classes
     * that have a regex. Then it runs a simplified Aho–Corasick algorithm using the bigTrie.
     */
    private getSuggestionsForText(text: string): Suggestion[] {
        if (!this.combinedRegex) return [];
        const suggestions: Suggestion[] = [];
        const madeSuggestions = new Set<string>();

        // 1. Process class-based suggestions using a combined regex with named groups.
        let match: RegExpExecArray | null;
        while ((match = this.combinedRegex.exec(text)) !== null) {
            if (match.groups) {
                // Iterate over all named groups to see which one matched.
                for (const [groupName, groupMatch] of Object.entries(match.groups)) {
                    if (groupMatch) {
                        const type = replaceDoubleUnderscoreWithSlash(groupName);
                        const matchText = groupMatch;
                        const key = `${type}:${matchText}`;
                        suggestions.push({
                            type,
                            match: matchText.trimEnd(),
                            from: match.index, // use regex match index
                        });
                        madeSuggestions.add(key);
                        break;
                    }
                }
            }
        }

        if (!this.bigTrie) return [];

        // 2. Process instance-based suggestions using a simplified Aho–Corasick search on the bigTrie.
        for (let i = 0; i < text.length; i++) {
            // Only start a match if this position is a word (or line) boundary.
            if (i > 0 && /\w/.test(text[i - 1])) {
                continue; // Not at the beginning of a word.
            }

            let currentNode = this.bigTrie.root;
            let j = i;
            while (j < text.length) {
                const char = text[j];
                if (!currentNode.children[char]) break;
                currentNode = currentNode.children[char];
                if (currentNode.eow && currentNode.data) {
                    // Only consider this match if it ends at a word (or line) boundary.
                    if (j + 1 === text.length || !/\w/.test(text[j + 1])) {
                        const word = text.substring(i, j + 1);
                        for (const type of currentNode.data) {
                            const key = `${type}:${word}`;
                            if (!madeSuggestions.has(key)) {
                                suggestions.push({
                                    type,
                                    match: word,
                                    from: i,
                                });
                                madeSuggestions.add(key);
                            }
                        }
                    }
                }
                j++;
            }
        }

        return suggestions;
    }

    private async getSuggestionsForWord(word: string): Promise<Suggestion[]> {
        if (!this.entryClasses) return [];
        const suggestions: Suggestion[] = [];
        const madeSuggestions = new Set<string>();

        // 1. Use the combinedWordRegex to check for a full match against class-based regex patterns.
        if (this.combinedWordRegex) {
            const match = this.combinedWordRegex.exec(word);
            if (match && match.groups) {
                for (const [groupName, groupMatch] of Object.entries(match.groups)) {
                    if (groupMatch) {
                        const key = `${groupName}:${word}`;
                        if (!madeSuggestions.has(key)) {
                            suggestions.push({ type: groupName, match: word });
                            madeSuggestions.add(key);
                        }
                        break; // Only one group can match a full word.
                    }
                }
            }
        }

        // 2. Process instance-based suggestions using the bigTrie.
        if (this.bigTrie) {
            const matchingInstances = await this.bigTrie.allWordsWithPrefixFetch(word);
            matchingInstances.forEach((matchObj) => {
                for (const type of matchObj.types) {
                    const key = `${type}:${matchObj.word}`;
                    if (!madeSuggestions.has(key)) {
                        suggestions.push({ type, match: matchObj.word });
                        madeSuggestions.add(key);
                    }
                }
            });
        }

        return suggestions;
    }

    /**
     * Provides autocomplete suggestions when the cursor is outside a link.
     */
    private async autocompleteForPlainText(
        context: AutocompleteContext,
    ): Promise<AutocompleteResult> {
        const word = context.matchBefore(/\S*/);
        if (word.from === word.to && !context.explicit)
            return { from: context.pos, options: [] };

        const suggestions = (await this.getSuggestionsForWord(word.text)).map((s) => ({
            type: 'keyword',
            label: `[[${s.type}:${s.match}]]`,
        }));

        // Add snippet completions with filtering based on current word
        const snippetCompletions = this.createSnippetCompletions(word.text);

        return {
            from: word.from,
            to: word.to,
            options: [...suggestions, ...snippetCompletions],
        };
    }

    /**
     * Traverses up from a node until it finds a parent node with the specified type.
     * Returns a list with the path from the parent to that node, or null if no such parent exists.
     * @param node The starting node to traverse from
     * @param type The type of parent node to find
     * @returns Array of nodes from parent to child, or null if no parent found
     */
    private getParent(node: any, type: string): any[] | null {
        const path: any[] = [node];
        let current = node;
        let last_seen = 0;

        while (current.parent) {
            current = current.parent;
            path.unshift(current);
            if (current.name === type) {
                last_seen = -1;
            }
            last_seen++;
        }

        return last_seen == path.length ? null : path.slice(last_seen);
    }

    private async provideAutocompleteSuggestionsForYaml(
        context: AutocompleteContext,
    ): Promise<AutocompleteResult> {
        await this.ready();
        if (!this.entryClasses) return { from: context.pos, options: [] };

        const pos = context.pos;
        const tree = syntaxTree(context.state);
        let node = tree.resolve(pos, -1);

        let options: Array<{ label: string; type: string }> = [];
        let from = node.from;
        let to = node.to;

        let path = this.getParent(node, 'BlockMapping');
        if (path && path.length >= 2 && path.length <= 7) {
            let section = path[1];
            if (section && section.firstChild) {
                let sectxt = context.state.doc.sliceString(
                    section.firstChild.from,
                    section.firstChild.to,
                );
                let parent = node.parent;
                if (sectxt == 'entries' && parent != null) {
                    if (
                        parent.name == 'Key' ||
                        (node.name == 'Literal' && path.length == 3)
                    ) {
                        // Filling out type
                        options = Object.keys(this.entryClasses).map((item) => ({
                            label: item,
                            info: this.entryClasses[item].description
                                ? this.entryClasses[item].description
                                : '',
                            type: 'keyword',
                        }));
                        return { from, to, options: options };
                    } else if (node.name == 'Literal') {
                        // Filling out value
                        if (!this.tries) return { from: context.pos, options: [] };
                        let sibling = parent?.firstChild;
                        if (parent?.name == 'Item') {
                            sibling = parent?.parent?.parent?.firstChild;
                        }

                        if (!sibling) return { from: from, to: to, options: [] };
                        const t = context.state.doc.sliceString(
                            sibling.from,
                            sibling.to,
                        );

                        if (!this.tries[t]) return { from: from, to: to, options: [] };

                        const v = context.state.doc.sliceString(from, to);
                        options = (await this.tries[t].allWordsWithPrefixFetch(v)).map(
                            (item) => ({
                                label: item.word,
                                type: 'keyword',
                            }),
                        );
                        return { from, to, options: options };
                    }
                }
            }
        }
        if (node.name == 'Literal') {
            options = [
                {
                    label: 'title',
                    type: 'keyword',
                    info: 'A title for the note',
                },
                {
                    label: 'entries',
                    type: 'keyword',
                    info: 'A list of entries in this note',
                },
            ];

            // Add snippet completions for YAML context
            const snippetCompletions = this.createSnippetCompletions();

            return { from, to, options: [...options, ...snippetCompletions] };
        }

        // Default fallback - include snippet completions
        const snippetCompletions = this.createSnippetCompletions();
        return { from: context.pos, options: snippetCompletions };
    }

    /**
     * Provides autocomplete suggestions based on the cursor context.
     */
    private async provideAutocompleteSuggestions(
        context: AutocompleteContext,
    ): Promise<AutocompleteResult> {
        await this.ready();
        if (!this.entryClasses) return { from: context.pos, options: [] };

        const pos = context.pos;
        const tree = syntaxTree(context.state);
        let node = tree.resolve(pos, -1);

        let options: Array<{ label: string; type: string }> = [];
        let from = node.from;
        let to = node.to;
        let ratchet = false;
        let ratchetValue = false;

        switch (node.name) {
            case 'CradleLink':
                if (!node.lastChild || node.lastChild.name === 'CradleLinkType') {
                    to -= 2;
                } else if (node.lastChild.name === 'CradleLinkValue') {
                    to = node.lastChild.to;
                    ratchet = true;
                } else if (node.lastChild.name === 'CradleLinkAlias') {
                    to = node.lastChild.to;
                    ratchet = true;
                    ratchetValue = true;
                }
                from = to;
            case 'CradleLinkType':
                if (!ratchet) {
                    options = Object.keys(this.entryClasses).map((item) => ({
                        label: item + (node.nextSibling ? '' : ':'),
                        info: this.entryClasses[item].description
                            ? this.entryClasses[item].description
                            : '',
                        type: 'keyword',
                    }));
                    break;
                }
                ratchet = false;
            // fall through
            case 'CradleLinkValue': {
                if (!ratchetValue) {
                    if (!this.tries) return { from: context.pos, options: [] };
                    const sibling =
                        node.name === 'CradleLink' ? node.firstChild : node.prevSibling;
                    if (!sibling) break;
                    const t = context.state.doc.sliceString(sibling.from, sibling.to);

                    if (!this.tries[t]) break;
                    if (t == 'alias') break;

                    const v = context.state.doc.sliceString(from, to);
                    options = (await this.tries[t].allWordsWithPrefixFetch(v)).map(
                        (item) => ({
                            label: item.word,
                            type: 'keyword',
                        }),
                    );
                    break;
                }
                ratchetValue = false;
            }
            case 'CradleLinkAlias':
                if (!this.tries) return { from: context.pos, options: [] };
                if (!this.tries['alias']) return { from: context.pos, options: [] };

                const v = context.state.doc.sliceString(from, to);
                options = (await this.tries['alias'].allWordsWithPrefixFetch(v)).map(
                    (item) => ({
                        label: item.word,
                        type: 'keyword',
                    }),
                );
                break;
            case 'Paragraph':
            case 'TableCell':
                return await this.autocompleteForPlainText(context);
        }

        // If no specific options were found, add snippet completions as fallback
        if (options.length === 0) {
            const snippetCompletions = this.createSnippetCompletions();
            options = snippetCompletions;
        }

        return { from, to, options };
    }

    /*============================================================================
    SHARED TREE TRAVERSAL LOGIC
  =============================================================================*/

    private traverseTreeForSuggestions(
        editor: any,
        start: number,
        end: number,
        processSuggestion: (
            suggestion: Suggestion,
            absoluteStart: number,
            absoluteEnd: number,
        ) => void,
    ): void {
        const text: string = editor.state.doc.toString();
        const tree = syntaxTree(editor.state);
        const ignoreTypes = new Set([
            'Link',
            'Frontmatter',
            'Link',
            'CradleLink',
            'CodeBlock',
            'FencedCode',
            'InlineCode',
            'LinkLabel',
            'URL',
        ]);

        tree.iterate({
            from: start,
            to: end,
            enter: (syntaxNode: any) => {
                const node = syntaxNode.node;
                const nodeText = text.slice(node.from, node.to);
                if (ignoreTypes.has(node.name)) return false;
                if (!node.firstChild) {
                    if (!nodeText.trim()) return;

                    // Get all suggestions for the entire node text.
                    const suggestions = this.getSuggestionsForText(nodeText);

                    // Process suggestions
                    for (const s of suggestions) {
                        const absoluteStart = node.from + s.from;
                        const absoluteEnd = absoluteStart + s.match.length;
                        processSuggestion(s, absoluteStart, absoluteEnd);
                    }
                } else if (node.name === 'Paragraph') {
                    if (!nodeText.trim()) return;

                    // Get all suggestions for the entire node text.
                    const suggestions = this.getSuggestionsForText(nodeText);

                    const childRanges: Array<{ from: number; to: number }> = [];
                    if (node.firstChild) {
                        let child = node.firstChild;
                        while (child) {
                            childRanges.push({ from: child.from, to: child.to });
                            child = child.nextSibling;
                        }
                    }
                    for (const suggestion of suggestions) {
                        const absoluteStart = node.from + suggestion.from;
                        const absoluteEnd = absoluteStart + suggestion.match.length;

                        const liesWithinChild = childRanges.some(
                            (range) =>
                                absoluteStart >= range.from && absoluteEnd <= range.to,
                        );
                        if (liesWithinChild) continue;

                        processSuggestion(suggestion, absoluteStart, absoluteEnd);
                    }
                }
            },
        });
    }

    /*============================================================================
    AUTO-FORMAT LINK METHODS
  =============================================================================*/

    /**
     * Auto-formats plain text into cradle links where applicable.
     */
    autoFormatLinks(
        editor: any,
        start: number,
        end: number,
        onlyTimestamps: boolean,
    ): [number, string] {
        const text: string = editor.state.doc.toString();
        const changes: Array<{ from: number; to: number; replacement: string }> = [];
        const tree = syntaxTree(editor.state);

        // First, add timestamps to existing cradle links that don't have them
        tree.iterate({
            from: start,
            to: end,
            enter: (syntaxNode) => {
                const node = syntaxNode.node;
                if (node.name === 'CradleLink') {
                    if (
                        node.lastChild &&
                        node.lastChild.name !== 'CradleLinkTimestamp'
                    ) {
                        const timestamp = dayjs().format('DD-MM-YYYY');
                        changes.push({
                            from: node.to,
                            to: node.to,
                            replacement: `(${timestamp})`,
                        });
                    }
                    return true;
                }
            },
        });

        if (!onlyTimestamps) {
            // Then, convert plain text to cradle links with timestamps
            this.traverseTreeForSuggestions(
                editor,
                start,
                end,
                (suggestion, absoluteStart, absoluteEnd) => {
                    const timestamp = dayjs().format('DD-MM-YYYY');
                    const replacement = `[[${suggestion.type}:${suggestion.match}]](${timestamp})`;
                    changes.push({
                        from: absoluteStart,
                        to: absoluteEnd,
                        replacement,
                    });
                },
            );
        }

        // When there is an overlap, keep the bigger one
        const filteredChanges = changes.filter(
            (change) =>
                !changes.some(
                    (other) =>
                        other !== change &&
                        change.from < other.to &&
                        change.to > other.from &&
                        other.to - other.from > change.to - change.from,
                ),
        );

        filteredChanges.sort((a, b) => b.from - a.from);
        let formattedText = text;
        for (const change of filteredChanges) {
            formattedText =
                formattedText.slice(0, change.from) +
                change.replacement +
                formattedText.slice(change.to);
        }
        return [filteredChanges.length, formattedText];
    }

    /*============================================================================
    LINTING METHODS
  =============================================================================*/

    /**
     * Returns a CodeMirror lint extension that checks for valid cradle links and
     * suggests link formatting.
     */
    lint(): any {
        return linter(async (view) => {
            await this.ready();
            if (!this.entryClasses) return [];

            const diagnostics: Diagnostic[] = [];
            const text = view.state.doc.toString();
            const tree = syntaxTree(view.state);

            // First handle link validation
            tree.iterate({
                from: 0,
                to: view.state.doc.length,
                enter: (syntaxNode) => {
                    const node = syntaxNode.node;
                    if (
                        node.name == 'Frontmatter' ||
                        node.name == 'FrontMatterContent'
                    ) {
                        let frontmatter = text.slice(node.from, node.to);
                        let yml = frontmatter
                            .substring(3, frontmatter.length - 4)
                            .trim();
                        try {
                            const parsedYaml = jsyaml.load(yml);

                            // Handle entries if they exist
                            if (
                                parsedYaml &&
                                parsedYaml.entries &&
                                typeof parsedYaml.entries === 'object'
                            ) {
                                for (const [type, value] of Object.entries(
                                    parsedYaml.entries,
                                )) {
                                    if (!this.entryClasses[type]) {
                                        diagnostics.push({
                                            from: node.from + 3,
                                            to: node.to - 3,
                                            severity: 'error' as const,
                                            message: `Invalid entry type: ${type}`,
                                        });
                                        if (Array.isArray(value)) {
                                            // Validate each item in the array
                                            value.forEach((item, index) => {
                                                const valueDiagnostics =
                                                    this.validateLinkValue(
                                                        type,
                                                        String(item),
                                                        node.from,
                                                    );
                                                if (valueDiagnostics.length > 0) {
                                                    // Adjust the position for each array item
                                                    const adjustedDiagnostics =
                                                        valueDiagnostics.map((d) => ({
                                                            ...d,
                                                            from: d.from + index * 2, // Approximate position adjustment
                                                            to: d.to + index * 2,
                                                        }));
                                                    diagnostics.push(
                                                        ...adjustedDiagnostics,
                                                    );
                                                }
                                            });
                                        } else if (typeof value !== 'object') {
                                            const valueDiagnostics =
                                                this.validateLinkValue(
                                                    type,
                                                    String(value),
                                                    node.from,
                                                );
                                            if (valueDiagnostics.length > 0) {
                                                diagnostics.push(...valueDiagnostics);
                                            }
                                        } else {
                                            diagnostics.push({
                                                from: node.from + 3,
                                                to: node.to - 3,
                                                severity: 'error' as const,
                                                message: `Invalid value for ${type}`,
                                            });
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            var loc = e.mark;
                            var from = loc ? loc.position : 0;
                            var to = from;
                            diagnostics.push({
                                from: from,
                                to: to,
                                message: e.reason,
                                severity: 'error' as const,
                            });
                        }
                        return false;
                    }
                    if (node.name === 'CradleLinkType') {
                        if (!this.entryClasses) return false;

                        const nodeText = text.slice(node.from, node.to);
                        const matches = Object.keys(this.entryClasses).filter(
                            (x) => x === nodeText,
                        );
                        if (matches.length === 0) {
                            diagnostics.push({
                                from: node.from,
                                to: node.to,
                                severity: 'error',
                                message: `Invalid link type: ${nodeText}`,
                            });
                        }
                        return false;
                    } else if (node.name === 'CradleLinkValue') {
                        // Validate link value.
                        const sibling = node.prevSibling;
                        if (!sibling) return false;
                        const t = text.slice(sibling.from, sibling.to);
                        const value = text.slice(node.from, node.to);
                        diagnostics.push(
                            ...this.validateLinkValue(t, value, node.from),
                        );
                        return false;
                    } else if (node.name === 'CradleLink') {
                        if (
                            node.lastChild &&
                            node.lastChild.name !== 'CradleLinkTimestamp'
                        ) {
                            diagnostics.push({
                                from: node.from,
                                to: node.to,
                                severity: 'warning',
                                message:
                                    'Add a timestamp to this link for better tracking',
                                actions: [
                                    {
                                        name: 'Add Timestamp',
                                        apply(view, from, to) {
                                            view.dispatch({
                                                changes: {
                                                    from: node.to,
                                                    to: node.to,
                                                    insert: `(${dayjs().format('DD-MM-YYYY')})`,
                                                },
                                            });
                                        },
                                    },
                                ],
                            });
                        }
                        return true;
                    } else if (node.name === 'CradleLinkAlias') {
                        return false;
                    }
                },
            });

            this.traverseTreeForSuggestions(
                view,
                0,
                view.state.doc.length,
                (suggestion, absoluteStart, absoluteEnd) => {
                    diagnostics.push({
                        from: absoluteStart,
                        to: absoluteEnd,
                        severity: 'warning',
                        message: `Possible link: [[${suggestion.type}:${suggestion.match}]]`,
                        actions: [
                            {
                                name: 'Link',
                                apply(view, from, to) {
                                    view.dispatch({
                                        changes: {
                                            from,
                                            to,
                                            insert: `[[${suggestion.type}:${suggestion.match}]]`,
                                        },
                                    });
                                },
                            },
                        ],
                    });
                },
            );

            return diagnostics;
        });
    }

    /**
     * Validates a link value against its corresponding criteria.
     * Returns an array of diagnostics if the value does not match regex or enums.
     */
    private validateLinkValue(
        linkType: string,
        value: string,
        from: number,
    ): Diagnostic[] {
        if (!this.entryClasses) return [];
        const diagnostics: Diagnostic[] = [];

        const criteria = this.entryClasses[linkType];
        if (!criteria) return [];

        if (criteria.regex) {
            const regex = new RegExp(`^${criteria.regex}$`);
            if (!(regex.test(value) || regex.test(value.toLowerCase()))) {
                diagnostics.push({
                    from,
                    to: from + value.length,
                    severity: 'error',
                    message: `${value} does not match ${linkType}'s regex!`,
                });
            }
        }

        if (criteria.format == 'options' || criteria.type == 'entity') {
            if (!this.tries[linkType].search(value).found) {
                diagnostics.push({
                    from,
                    to: from + value.length,
                    severity: 'error',
                    message: `${value} is not a valid option for ${linkType}!`,
                });
            }
        }

        // TODO: Check for non-existent entities.
        return diagnostics;
    }

    /*============================================================================
    MARKDOWN LANGUAGE INTEGRATION
  =============================================================================*/

    /**
     * Creates a cradle markdown language with support for [[type:value|alias]] links.
     */
    markdown(config: MarkdownLanguageConfig): LanguageSupport {
        const CradleLinkExtension = {
            defineNodes: [
                {
                    name: 'CradleLink',
                    style: [tags.squareBracket],
                    children: [
                        { name: 'CradleLinkType' },
                        { name: 'CradleLinkValue' },
                        { name: 'CradleLinkAlias' },
                        { name: 'CradleLinkTimestamp' },
                    ],
                },
                { name: 'CradleLinkType', style: [tags.string] },
                { name: 'CradleLinkValue', style: [tags.strong] },
                { name: 'CradleLinkAlias', style: [tags.emphasis] },
                { name: 'CradleLinkTimestamp', style: [tags.emphasis] },
            ],
            parseInline: [
                {
                    name: 'CradleLink',
                    before: 'Link',
                    parse(cx, next, pos) {
                        // Check for opening "[["
                        if (next !== 91 || cx.char(pos + 1) !== 91) return -1;
                        const start = pos + 2;
                        let end = start;

                        // Find the closing "]]"
                        while (end < cx.end) {
                            if (cx.char(end) === 93 && cx.char(end + 1) === 93) break;
                            end++;
                        }
                        if (end >= cx.end) return -1;

                        // Parse the link content
                        let content = '';
                        for (let i = start; i < end; i++) {
                            content += String.fromCharCode(cx.char(i));
                        }

                        // Parse type, value, and alias
                        let linkType = '';
                        let linkValue: string | null = null;
                        let linkAlias: string | null = null;
                        const colonIndex = content.indexOf(':');
                        if (colonIndex === -1) {
                            linkType = content.trim();
                        } else {
                            linkType = content.slice(0, colonIndex).trim();
                            const remainder = content.slice(colonIndex + 1);

                            // Find unescaped pipe character
                            let pipeIndex = -1;
                            for (let i = 0; i < remainder.length; i++) {
                                if (
                                    remainder[i] === '|' &&
                                    (i === 0 || remainder[i - 1] !== '\\')
                                ) {
                                    pipeIndex = i;
                                    break;
                                }
                            }

                            if (pipeIndex === -1) {
                                linkValue = remainder.trim();
                            } else {
                                linkValue = remainder.slice(0, pipeIndex).trim();
                                linkAlias = remainder.slice(pipeIndex + 1).trim();
                            }
                        }

                        // Create the base node and add type, value, and alias
                        const node = cx.elt('CradleLink', pos, end + 2, []);
                        node.children.push(
                            cx.elt('CradleLinkType', start, start + linkType.length),
                        );
                        if (linkValue !== null) {
                            const valueStart = start + linkType.length + 1;
                            node.children.push(
                                cx.elt(
                                    'CradleLinkValue',
                                    valueStart,
                                    valueStart + linkValue.length,
                                ),
                            );
                            if (linkAlias != null) {
                                const aliasStart = valueStart + linkValue.length + 1;
                                node.children.push(
                                    cx.elt(
                                        'CradleLinkAlias',
                                        aliasStart,
                                        aliasStart + linkAlias.length,
                                    ),
                                );
                            }
                        }

                        // Look for timestamp after ]]
                        let timestampStart = end + 2;
                        while (
                            timestampStart < cx.end &&
                            cx.char(timestampStart) === 32
                        )
                            timestampStart++; // Skip spaces

                        if (cx.char(timestampStart) === 40) {
                            // Found opening parenthesis
                            let timestampEnd = timestampStart + 1;
                            while (
                                timestampEnd < cx.end &&
                                cx.char(timestampEnd) !== 41
                            )
                                timestampEnd++;

                            if (timestampEnd < cx.end) {
                                let timestamp = '';
                                for (
                                    let i = timestampStart + 1;
                                    i < timestampEnd;
                                    i++
                                ) {
                                    timestamp += String.fromCharCode(cx.char(i));
                                }

                                // Add timestamp node if valid format
                                const timeRegex =
                                    /^(?:(\d{2}:\d{2}\s+))?\d{2}-\d{2}-\d{4}$/;
                                if (timeRegex.test(timestamp)) {
                                    node.children.push(
                                        cx.elt(
                                            'CradleLinkTimestamp',
                                            timestampStart,
                                            timestampEnd + 1,
                                        ),
                                    );
                                    return cx.append(node, timestampEnd + 1);
                                }
                            }
                        }

                        return cx.append(node);
                    },
                },
            ],
        };

        return yamlFrontmatter({
            content: markdown({
                base: markdownLanguage,
                codeLanguages: config.codeLanguages || [],
                extensions: [
                    basicSetup,
                    CradleLinkExtension,
                    ...(config.extensions || []),
                ],
            }),
        });
    }

    public static clearCache() {
        CradleEditor.entryClassesPromise = null;
        CradleEditor.cachedEntryClasses = null;
        CradleEditor.triesPromise = null;
        CradleEditor.cachedTries = null;
        CradleEditor.cachedBigTrie = null;
    }
}
