// SoundManager.js
import Sound from 'react-native-sound';

let backgroundMusic = null;

export const playBackgroundMusic = () => {
  if (!backgroundMusic) {
    backgroundMusic = new Sound('background.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
        return;
      }
      backgroundMusic.setNumberOfLoops(-1); // infinite loop
      backgroundMusic.play();
    });
  }
};

export const stopBackgroundMusic = () => {
  if (backgroundMusic) {
    backgroundMusic.stop(() => {
      backgroundMusic.release();
      backgroundMusic = null;
    });
  }
};

export const muteBackgroundMusic = () => {
  if (backgroundMusic) {
    backgroundMusic.setVolume(0);
  }
};

export const unmuteBackgroundMusic = () => {
  if (backgroundMusic) {
    backgroundMusic.setVolume(1);
  }
};
