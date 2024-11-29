import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorFallback } from '@graasp/ui/apps';

import * as Sentry from '@sentry/react';

const ErrorBoundary: FC<{ children?: ReactNode }> = ({ children }) => {
  const { t } = useTranslation('ERROR_BOUNDARY', {
    keyPrefix: 'FALLBACK',
  });
  return (
    <Sentry.ErrorBoundary
      // eslint-disable-next-line react/no-unstable-nested-components
      fallback={({ error, componentStack, eventId }) => (
        <ErrorFallback
          error={error}
          componentStack={componentStack}
          eventId={eventId}
          captureUserFeedback={Sentry.captureUserFeedback}
          title={t('MESSAGE_TITLE')}
          formTitle={t('MESSAGE_FEEDBACK')}
          nameLabel={t('NAME_LABEL')}
          nameHelper={t('NAME_HELPER')}
          emailLabel={t('EMAIL_LABEL')}
          emailHelper={t('EMAIL_HELPER')}
          commentLabel={t('COMMENT_LABEL')}
          commentHelper={t('COMMENT_HELPER')}
          thanksMessage={t('THANKS_FOR_FEEDBACK')}
          sendButtonLabel={t('SEND')}
          errorDetailsLabel={t('ERROR_DETAILS')}
        />
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default ErrorBoundary;
