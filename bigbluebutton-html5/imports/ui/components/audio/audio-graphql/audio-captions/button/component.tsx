import React, { useEffect, useRef } from 'react';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import ButtonEmoji from '/imports/ui/components/common/button/button-emoji/ButtonEmoji';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Styled from './styles';
import {
  getSpeechVoices, isAudioTranscriptionEnabled, setAudioCaptions, setSpeechLocale,
} from '../service';
import { defineMessages, useIntl } from 'react-intl';
import { MenuSeparatorItemType, MenuOptionItemType } from '/imports/ui/components/common/menu/menuTypes';
import useAudioCaptionEnable from '/imports/ui/core/local-states/useAudioCaptionEnable';
import { User } from '/imports/ui/Types/user';
import { useMutation } from '@apollo/client';
import { SET_SPEECH_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';

const intlMessages = defineMessages({
  start: {
    id: 'app.audio.captions.button.start',
    description: 'Start audio captions',
  },
  stop: {
    id: 'app.audio.captions.button.stop',
    description: 'Stop audio captions',
  },
  transcriptionSettings: {
    id: 'app.audio.captions.button.transcriptionSettings',
    description: 'Audio captions settings modal',
  },
  transcription: {
    id: 'app.audio.captions.button.transcription',
    description: 'Audio speech transcription label',
  },
  transcriptionOn: {
    id: 'app.switch.onLabel',
  },
  transcriptionOff: {
    id: 'app.switch.offLabel',
  },
  language: {
    id: 'app.audio.captions.button.language',
    description: 'Audio speech recognition language label',
  },
  'de-DE': {
    id: 'app.audio.captions.select.de-DE',
    description: 'Audio speech recognition german language',
  },
  'en-US': {
    id: 'app.audio.captions.select.en-US',
    description: 'Audio speech recognition english language',
  },
  'es-ES': {
    id: 'app.audio.captions.select.es-ES',
    description: 'Audio speech recognition spanish language',
  },
  'fr-FR': {
    id: 'app.audio.captions.select.fr-FR',
    description: 'Audio speech recognition french language',
  },
  'hi-ID': {
    id: 'app.audio.captions.select.hi-ID',
    description: 'Audio speech recognition indian language',
  },
  'it-IT': {
    id: 'app.audio.captions.select.it-IT',
    description: 'Audio speech recognition italian language',
  },
  'ja-JP': {
    id: 'app.audio.captions.select.ja-JP',
    description: 'Audio speech recognition japanese language',
  },
  'pt-BR': {
    id: 'app.audio.captions.select.pt-BR',
    description: 'Audio speech recognition portuguese language',
  },
  'ru-RU': {
    id: 'app.audio.captions.select.ru-RU',
    description: 'Audio speech recognition russian language',
  },
  'zh-CN': {
    id: 'app.audio.captions.select.zh-CN',
    description: 'Audio speech recognition chinese language',
  },
});

interface AudioCaptionsButtonProps {
  isRTL: boolean;
  availableVoices: string[];
  currentSpeechLocale: string;
  isSupported: boolean;
  isVoiceUser: boolean;
}

const DISABLED = '';

const AudioCaptionsButton: React.FC<AudioCaptionsButtonProps> = ({
  isRTL,
  currentSpeechLocale,
  availableVoices,
  isSupported,
  isVoiceUser,
}) => {
  const intl = useIntl();
  const [active] = useAudioCaptionEnable();
  const [setSpeechLocaleMutation] = useMutation(SET_SPEECH_LOCALE);
  const setUserSpeechLocale = (speechLocale: string, provider: string) => {
    setSpeechLocaleMutation({
      variables: {
        locale: speechLocale,
        provider,
      },
    });
  };
  const isTranscriptionDisabled = () => currentSpeechLocale === DISABLED;
  const fallbackLocale = availableVoices.includes(navigator.language)
    ? navigator.language
    : 'en-US'; // Assuming 'en-US' is the default fallback locale

  const getSelectedLocaleValue = isTranscriptionDisabled()
    ? fallbackLocale
    : currentSpeechLocale;

  const selectedLocale = useRef(getSelectedLocaleValue);

  useEffect(() => {
    if (!isTranscriptionDisabled()) selectedLocale.current = getSelectedLocaleValue;
  }, [currentSpeechLocale]);

  const shouldRenderChevron = isSupported && isVoiceUser;

  const toggleTranscription = () => {
    setSpeechLocale(isTranscriptionDisabled() ? selectedLocale.current : DISABLED, setUserSpeechLocale);
  };

  const getAvailableLocales = () => {
    let indexToInsertSeparator = -1;
    const availableVoicesObjectToMenu: (MenuOptionItemType | MenuSeparatorItemType)[] = availableVoices
      .map((availableVoice: string, index: number) => {
        if (availableVoice === availableVoices[0]) {
          indexToInsertSeparator = index;
        }
        return (
          {
            icon: '',
            label: intl.formatMessage(intlMessages[availableVoice as keyof typeof intlMessages]),
            key: availableVoice,
            iconRight: selectedLocale.current === availableVoice ? 'check' : null,
            customStyles: (selectedLocale.current === availableVoice) && Styled.SelectedLabel,
            disabled: isTranscriptionDisabled(),
            onClick: () => {
              selectedLocale.current = availableVoice;
              setSpeechLocale(selectedLocale.current, setUserSpeechLocale);
            },
          }
        );
      });
    if (indexToInsertSeparator >= 0) {
      availableVoicesObjectToMenu.splice(indexToInsertSeparator, 0, {
        key: 'separator-01',
        isSeparator: true,
      });
    }
    return [
      ...availableVoicesObjectToMenu,
    ];
  };

  const getAvailableLocalesList = () => (
    [{
      key: 'availableLocalesList',
      label: intl.formatMessage(intlMessages.language),
      customStyles: Styled.TitleLabel,
      disabled: true,
    },
    ...getAvailableLocales(),
    {
      key: 'divider',
      label: intl.formatMessage(intlMessages.transcription),
      customStyles: Styled.TitleLabel,
      disabled: true,
    },
    {
      key: 'separator-02',
      isSeparator: true,
    },
    {
      key: 'transcriptionStatus',
      label: intl.formatMessage(
        isTranscriptionDisabled()
          ? intlMessages.transcriptionOn
          : intlMessages.transcriptionOff,
      ),
      customStyles: isTranscriptionDisabled()
        ? Styled.EnableTrascription : Styled.DisableTrascription,
      disabled: false,
      onClick: toggleTranscription,
    }]
  );
  const onToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAudioCaptions(!active);
  };

  const startStopCaptionsButton = (
    <Styled.ClosedCaptionToggleButton
      icon={active ? 'closed_caption' : 'closed_caption_stop'}
      label={intl.formatMessage(active ? intlMessages.stop : intlMessages.start)}
      color={active ? 'primary' : 'default'}
      ghost={!active}
      hideLabel
      circle
      size="lg"
      onClick={onToggleClick}
    />
  );

  return (
    shouldRenderChevron
      ? (
        <Styled.SpanButtonWrapper>
          <BBBMenu
            trigger={(
              <>
                { startStopCaptionsButton }
                <ButtonEmoji
                  emoji="device_list_selector"
                  hideLabel
                  label={intl.formatMessage(intlMessages.transcriptionSettings)}
                  tabIndex={0}
                  rotate
                />
              </>
            )}
            actions={getAvailableLocalesList()}
            opts={{
              id: 'default-dropdown-menu',
              keepMounted: true,
              transitionDuration: 0,
              elevation: 3,
              getcontentanchorel: null,
              fullwidth: 'true',
              anchorOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
              transformOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
            }}
          />
        </Styled.SpanButtonWrapper>
      ) : startStopCaptionsButton
  );
};

const AudioCaptionsButtonContainer: React.FC = () => {
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const {
    data: currentUser,
    loading: currentUserLoading,
  } = useCurrentUser(
    (user: Partial<User>) => ({
      speechLocale: user.speechLocale,
      voice: user.voice,
    }),
  );

  if (currentUserLoading) return null;
  if (!currentUser) return null;

  const availableVoices = getSpeechVoices();
  const currentSpeechLocale = currentUser.speechLocale || '';
  const isSupported = availableVoices.length > 0;
  const isVoiceUser = !!currentUser.voice;

  if (!isAudioTranscriptionEnabled()) return null;

  return (
    <AudioCaptionsButton
      isRTL={isRTL}
      availableVoices={availableVoices}
      currentSpeechLocale={currentSpeechLocale}
      isSupported={isSupported}
      isVoiceUser={isVoiceUser}
    />
  );
};

export default AudioCaptionsButtonContainer;
