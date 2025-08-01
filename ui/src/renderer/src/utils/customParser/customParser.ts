import MarkdownIt from 'markdown-it';
import Prism from 'prismjs';
import { getBaseUrl } from '../../services/configService/configService';

import { getEntryClasses } from '../../services/adminService/adminService';
import { authAxios } from '../../services/axiosInstance/axiosInstance';
import { parseWithExtensions, parseWithExtensionsInline } from './markdownExtensions';

export async function parseMarkdown(
    mdContent: string,
    fileData?: any[],
): Promise<{ html: string; metadata: Record<string, any> } | undefined> {
    try {
        const response = await getEntryClasses();
        if (response.status === 200) {
            const entryColors = new Map<string, string>();
            for (const entry of response.data) {
                entryColors.set(entry.subtype, entry.color);
            }

            const md = new MarkdownIt({
                html: true,
                highlight: (code: string, lang: string): string => {
                    if (lang && Prism.languages[lang]) {
                        try {
                            return Prism.highlight(code, Prism.languages[lang], lang);
                        } catch {}
                    }
                    return '';
                },
            });

            return await parseWithExtensions(
                md,
                mdContent,
                fileData,
                entryColors,
                authAxios,
            );
        }
    } catch (error: any) {
        // Handle network or authorization errors by returning undefined.
        if (
            error.code === 'ERR_NETWORK' ||
            (error.response && error.response.status === 401)
        ) {
            return;
        }
        throw error;
    }
}

export function parseMarkdownInline(mdContent: string | undefined): string | undefined {
    if (!mdContent) return mdContent;
    try {
        const md = new MarkdownIt({
            html: false,
        });

        return parseWithExtensionsInline(md, mdContent);
    } catch (error: any) {
        // Handle network or authorization errors by returning undefined.
        if (
            error.code === 'ERR_NETWORK' ||
            (error.response && error.response.status === 401)
        ) {
            return '';
        }
        throw error;
    }
}

export function parseWorker() {
    // In some React component or service file
    const worker = new Worker(new URL('./parserWorker.ts', import.meta.url), {
        type: 'module',
    });

    worker.postMessage({
        token: localStorage.getItem('access'),
        apiBaseUrl: getBaseUrl(),
    });

    return worker;
}

export default parseMarkdown;
