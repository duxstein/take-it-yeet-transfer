
// Sound effect URLs - these are placeholders for public domain sounds
const soundUrls = [
  "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3", // Error beep
  "https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3", // Clown horn
  "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3", // Game over
  "https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3", // Alert
  "https://assets.mixkit.co/active_storage/sfx/428/428-preview.mp3", // Fail sound
];

export const playRandomSound = () => {
  const randomSoundUrl = soundUrls[Math.floor(Math.random() * soundUrls.length)];
  const audio = new Audio(randomSoundUrl);
  
  // Try to play the sound with a catch for browser autoplay policies
  audio.play().catch(error => {
    console.log("Error playing sound (probably autoplay restrictions):", error);
  });
};
