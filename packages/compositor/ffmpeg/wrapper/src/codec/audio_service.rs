use ffi::AVAudioServiceType::*;
use ffi::*;

#[derive(Eq, PartialEq, Clone, Copy, Debug)]
pub enum AudioService {
    Main,
    Effects,
    VisuallyImpaired,
    HearingImpaired,
    Dialogue,
    Commentary,
    Emergency,
    VoiceOver,
    Karaoke,
}

impl From<AVAudioServiceType> for AudioService {
    fn from(value: AVAudioServiceType) -> Self {
        match value {
            AV_AUDIO_SERVICE_TYPE_MAIN => AudioService::Main,
            AV_AUDIO_SERVICE_TYPE_EFFECTS => AudioService::Effects,
            AV_AUDIO_SERVICE_TYPE_VISUALLY_IMPAIRED => AudioService::VisuallyImpaired,
            AV_AUDIO_SERVICE_TYPE_HEARING_IMPAIRED => AudioService::HearingImpaired,
            AV_AUDIO_SERVICE_TYPE_DIALOGUE => AudioService::Dialogue,
            AV_AUDIO_SERVICE_TYPE_COMMENTARY => AudioService::Commentary,
            AV_AUDIO_SERVICE_TYPE_EMERGENCY => AudioService::Emergency,
            AV_AUDIO_SERVICE_TYPE_VOICE_OVER => AudioService::VoiceOver,
            AV_AUDIO_SERVICE_TYPE_KARAOKE => AudioService::Karaoke,
            AV_AUDIO_SERVICE_TYPE_NB => AudioService::Main,
        }
    }
}

impl From<AudioService> for AVAudioServiceType {
    fn from(value: AudioService) -> AVAudioServiceType {
        match value {
            AudioService::Main => AV_AUDIO_SERVICE_TYPE_MAIN,
            AudioService::Effects => AV_AUDIO_SERVICE_TYPE_EFFECTS,
            AudioService::VisuallyImpaired => AV_AUDIO_SERVICE_TYPE_VISUALLY_IMPAIRED,
            AudioService::HearingImpaired => AV_AUDIO_SERVICE_TYPE_HEARING_IMPAIRED,
            AudioService::Dialogue => AV_AUDIO_SERVICE_TYPE_DIALOGUE,
            AudioService::Commentary => AV_AUDIO_SERVICE_TYPE_COMMENTARY,
            AudioService::Emergency => AV_AUDIO_SERVICE_TYPE_EMERGENCY,
            AudioService::VoiceOver => AV_AUDIO_SERVICE_TYPE_VOICE_OVER,
            AudioService::Karaoke => AV_AUDIO_SERVICE_TYPE_KARAOKE,
        }
    }
}
