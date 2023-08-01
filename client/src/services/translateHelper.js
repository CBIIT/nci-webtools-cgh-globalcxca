// useTranslationHelper.js

import { useTranslation } from "react-i18next";

export function useTranslationHelper() {
  const { t } = useTranslation();

  function translate(key) {
    return t(key);
  }

  return { translate };
}
