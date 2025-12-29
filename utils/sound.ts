export const playSound = (type: 'like' | 'delete' | 'success') => {
    const sounds = {
        like: '/assets/sounds/notification.mp3',
        delete: '/assets/sounds/trash.mp3',
        success: '/assets/sounds/notification.mp3'
    };

    const audio = new Audio(sounds[type]);
    audio.volume = type === 'delete' ? 1.0 : 0.5;

    const playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Limit delete sound duration
            if (type === 'delete') {
                setTimeout(() => {
                    // Quick fade out manual
                    const fadeOut = setInterval(() => {
                        if (audio.volume > 0.1) {
                            audio.volume -= 0.1;
                        } else {
                            clearInterval(fadeOut);
                            audio.pause();
                            audio.currentTime = 0;
                        }
                    }, 50);

                    // Hard stop backup
                    setTimeout(() => {
                        audio.pause();
                        audio.currentTime = 0;
                    }, 600);
                }, 800); // Start fading at 800ms
            }
        }).catch(e => {
            console.warn('Sound playback failed:', e);
        });
    }
};
