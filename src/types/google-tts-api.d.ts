declare module 'google-tts-api' {
    interface Option {
        lang?: string;
        slow?: boolean;
        host?: string;
        timeout?: number;
        splitPunct?: string;
    }

    export function getAudioUrl(text: string, option?: Option): string;

    export function getAllAudioUrls(
        text: string,
        option?: Option
    ): { url: string; shortText: string }[];
}
