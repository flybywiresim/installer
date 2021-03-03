import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Store from "electron-store";

import universalLanguageDetect from '@unly/universal-language-detector';

import de from './de/translation.json';
import en from './en/translation.json';
import nb from './nb/translation.json';

const settings = new Store;

export const supportedLanguages = ['de', 'en', 'nb'];

let lang = universalLanguageDetect({
    supportedLanguages,
    fallbackLanguage: 'en',
});

const setLang = settings.get('mainSettings.lang');

if (setLang !== undefined) {
    lang = setLang.toString();
}

export const resources = {
    de: {
        translation: de
    },
    en: {
        translation: en,
    },
    nb: {
        translation: nb,
    }
} as const;

i18n
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: true,
        supportedLngs: supportedLanguages,

        lng: lang,

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },

        resources,
    });
