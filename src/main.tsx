import React from 'react';
import ReactDOM from 'react-dom/client';

import { MockSolution, mockApi } from '@graasp/apps-query-client';

import * as Sentry from '@sentry/react';

import { MOCK_API } from './config/env';
import { generateSentryConfig } from './config/sentry';
import './index.css';
import buildDatabase, { defaultMockContext, mockMembers } from './mocks/db';
import Root from './modules/Root';

Sentry.init({
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  ...generateSentryConfig(),
});

// setup mocked api for playwright or standalone app
// navigator.webdriver allows to determine if its in playwright if needed
/* istanbul ignore next */
if (MOCK_API) {
  mockApi(
    {
      externalUrls: [],
      appContext: defaultMockContext,
      database: buildDatabase(mockMembers),
    },
    MockSolution.ServiceWorker,
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
