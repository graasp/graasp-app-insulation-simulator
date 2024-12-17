import { useEffect } from 'react';

import { useLocalContext } from '@graasp/apps-query-client';

import i18n, { DEFAULT_LANGUAGE } from '../../config/i18n';
import PlayerView from './PlayerView';

const App = (): JSX.Element => {
  const context = useLocalContext();

  useEffect(() => {
    // handle a change of language
    const lang = context?.lang ?? DEFAULT_LANGUAGE;
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [context]);

  return <PlayerView />;
};

export default App;
