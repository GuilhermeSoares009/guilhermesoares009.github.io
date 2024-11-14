/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!******************************************************************!*\
  !*** ./node_modules/@justinribeiro/lite-youtube/lite-youtube.js ***!
  \******************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LiteYTEmbed: () => (/* binding */ LiteYTEmbed)
/* harmony export */ });
class LiteYTEmbed extends HTMLElement {
    constructor() {
        super();
        this.isIframeLoaded = false;
        this.setupDom();
    }
    static get observedAttributes() {
        return ['videoid', 'playlistid'];
    }
    connectedCallback() {
        this.addEventListener('pointerover', LiteYTEmbed.warmConnections, {
            once: true,
        });
        this.addEventListener('click', () => this.addIframe());
    }
    get videoId() {
        return encodeURIComponent(this.getAttribute('videoid') || '');
    }
    set videoId(id) {
        this.setAttribute('videoid', id);
    }
    get playlistId() {
        return encodeURIComponent(this.getAttribute('playlistid') || '');
    }
    set playlistId(id) {
        this.setAttribute('playlistid', id);
    }
    get videoTitle() {
        return this.getAttribute('videotitle') || 'Video';
    }
    set videoTitle(title) {
        this.setAttribute('videotitle', title);
    }
    get videoPlay() {
        return this.getAttribute('videoPlay') || 'Play';
    }
    set videoPlay(name) {
        this.setAttribute('videoPlay', name);
    }
    get videoStartAt() {
        return this.getAttribute('videoStartAt') || '0';
    }
    get autoLoad() {
        return this.hasAttribute('autoload');
    }
    get noCookie() {
        return this.hasAttribute('nocookie');
    }
    get posterQuality() {
        return this.getAttribute('posterquality') || 'hqdefault';
    }
    get posterLoading() {
        return (this.getAttribute('posterloading') ||
            'lazy');
    }
    get params() {
        return `start=${this.videoStartAt}&${this.getAttribute('params')}`;
    }
    set params(opts) {
        this.setAttribute('params', opts);
    }
    setupDom() {
        const shadowDom = this.attachShadow({ mode: 'open' });
        let nonce = '';
        if (window.liteYouTubeNonce) {
            nonce = `nonce="${window.liteYouTubeNonce}"`;
        }
        shadowDom.innerHTML = `
      <style ${nonce}>
        :host {
          contain: content;
          display: block;
          position: relative;
          width: 100%;
          padding-bottom: calc(100% / (16 / 9));
        }

        @media (max-width: 40em) {
          :host([short]) {
            padding-bottom: calc(100% / (9 / 16));
          }
        }

        #frame, #fallbackPlaceholder, iframe {
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
        }

        #frame {
          cursor: pointer;
        }

        #fallbackPlaceholder {
          object-fit: cover;
        }

        #frame::before {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          background-image: linear-gradient(180deg, #111 -20%, transparent 90%);
          height: 60px;
          width: 100%;
          z-index: 1;
        }

        #playButton {
          width: 68px;
          height: 48px;
          background-color: transparent;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24 27 14v20" fill="white"/></svg>');
          z-index: 1;
          border: 0;
          border-radius: inherit;
        }

        #playButton:before {
          content: '';
          border-style: solid;
          border-width: 11px 0 11px 19px;
          border-color: transparent transparent transparent #fff;
        }

        #playButton,
        #playButton:before {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate3d(-50%, -50%, 0);
          cursor: inherit;
        }

        /* Post-click styles */
        .activated {
          cursor: unset;
        }

        #frame.activated::before,
        #frame.activated > #playButton {
          display: none;
        }
      </style>
      <div id="frame">
        <picture>
          <source id="webpPlaceholder" type="image/webp">
          <source id="jpegPlaceholder" type="image/jpeg">
          <img id="fallbackPlaceholder" referrerpolicy="origin" loading="lazy">
        </picture>
        <button id="playButton"></button>
      </div>
    `;
        this.domRefFrame = shadowDom.querySelector('#frame');
        this.domRefImg = {
            fallback: shadowDom.querySelector('#fallbackPlaceholder'),
            webp: shadowDom.querySelector('#webpPlaceholder'),
            jpeg: shadowDom.querySelector('#jpegPlaceholder'),
        };
        this.domRefPlayButton = shadowDom.querySelector('#playButton');
    }
    setupComponent() {
        this.initImagePlaceholder();
        this.domRefPlayButton.setAttribute('aria-label', `${this.videoPlay}: ${this.videoTitle}`);
        this.setAttribute('title', `${this.videoPlay}: ${this.videoTitle}`);
        if (this.autoLoad || this.isYouTubeShort()) {
            this.initIntersectionObserver();
        }
    }
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case 'videoid':
            case 'playlistid':
            case 'videoTitle':
            case 'videoPlay': {
                if (oldVal !== newVal) {
                    this.setupComponent();
                    if (this.domRefFrame.classList.contains('activated')) {
                        this.domRefFrame.classList.remove('activated');
                        this.shadowRoot.querySelector('iframe').remove();
                        this.isIframeLoaded = false;
                    }
                }
                break;
            }
            default:
                break;
        }
    }
    addIframe(isIntersectionObserver = false) {
        if (!this.isIframeLoaded) {
            let autoplay = isIntersectionObserver ? 0 : 1;
            const wantsNoCookie = this.noCookie ? '-nocookie' : '';
            let embedTarget;
            if (this.playlistId) {
                embedTarget = `?listType=playlist&list=${this.playlistId}&`;
            }
            else {
                embedTarget = `${this.videoId}?`;
            }
            if (this.isYouTubeShort()) {
                this.params = `loop=1&mute=1&modestbranding=1&playsinline=1&rel=0&enablejsapi=1&playlist=${this.videoId}`;
                autoplay = 1;
            }
            const iframeHTML = `
<iframe frameborder="0" title="${this.videoTitle}"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen
  src="https://www.youtube${wantsNoCookie}.com/embed/${embedTarget}autoplay=${autoplay}&${this.params}"
></iframe>`;
            this.domRefFrame.insertAdjacentHTML('beforeend', iframeHTML);
            this.domRefFrame.classList.add('activated');
            this.isIframeLoaded = true;
            this.attemptShortAutoPlay();
            this.dispatchEvent(new CustomEvent('liteYoutubeIframeLoaded', {
                detail: {
                    videoId: this.videoId,
                },
                bubbles: true,
                cancelable: true,
            }));
        }
    }
    initImagePlaceholder() {
        const posterUrlWebp = `https://i.ytimg.com/vi_webp/${this.videoId}/${this.posterQuality}.webp`;
        const posterUrlJpeg = `https://i.ytimg.com/vi/${this.videoId}/${this.posterQuality}.jpg`;
        this.domRefImg.fallback.loading = this.posterLoading;
        this.domRefImg.webp.srcset = posterUrlWebp;
        this.domRefImg.jpeg.srcset = posterUrlJpeg;
        this.domRefImg.fallback.src = posterUrlJpeg;
        this.domRefImg.fallback.setAttribute('aria-label', `${this.videoPlay}: ${this.videoTitle}`);
        this.domRefImg?.fallback?.setAttribute('alt', `${this.videoPlay}: ${this.videoTitle}`);
    }
    initIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0,
        };
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isIframeLoaded) {
                    LiteYTEmbed.warmConnections();
                    this.addIframe(true);
                    observer.unobserve(this);
                }
            });
        }, options);
        observer.observe(this);
    }
    attemptShortAutoPlay() {
        if (this.isYouTubeShort()) {
            setTimeout(() => {
                this.shadowRoot
                    .querySelector('iframe')
                    ?.contentWindow?.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
            }, 2000);
        }
    }
    isYouTubeShort() {
        return (this.getAttribute('short') === '' &&
            window.matchMedia('(max-width: 40em)').matches);
    }
    static addPrefetch(kind, url) {
        const linkElem = document.createElement('link');
        linkElem.rel = kind;
        linkElem.href = url;
        linkElem.crossOrigin = 'true';
        document.head.append(linkElem);
    }
    static warmConnections() {
        if (LiteYTEmbed.isPreconnected || window.liteYouTubeIsPreconnected)
            return;
        LiteYTEmbed.addPrefetch('preconnect', 'https://i.ytimg.com/');
        LiteYTEmbed.addPrefetch('preconnect', 'https://s.ytimg.com');
        LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube.com');
        LiteYTEmbed.addPrefetch('preconnect', 'https://www.google.com');
        LiteYTEmbed.addPrefetch('preconnect', 'https://googleads.g.doubleclick.net');
        LiteYTEmbed.addPrefetch('preconnect', 'https://static.doubleclick.net');
        LiteYTEmbed.isPreconnected = true;
        window.liteYouTubeIsPreconnected = true;
    }
}
LiteYTEmbed.isPreconnected = false;
customElements.define('lite-youtube', LiteYTEmbed);
//# sourceMappingURL=lite-youtube.js.map
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQseURBQXlEO0FBQzVHLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0BqdXN0aW5yaWJlaXJvL2xpdGUteW91dHViZS9saXRlLXlvdXR1YmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlIHJlcXVpcmUgc2NvcGVcbnZhciBfX3dlYnBhY2tfcmVxdWlyZV9fID0ge307XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJleHBvcnQgY2xhc3MgTGl0ZVlURW1iZWQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuaXNJZnJhbWVMb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zZXR1cERvbSgpO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgICAgcmV0dXJuIFsndmlkZW9pZCcsICdwbGF5bGlzdGlkJ107XG4gICAgfVxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJvdmVyJywgTGl0ZVlURW1iZWQud2FybUNvbm5lY3Rpb25zLCB7XG4gICAgICAgICAgICBvbmNlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuYWRkSWZyYW1lKCkpO1xuICAgIH1cbiAgICBnZXQgdmlkZW9JZCgpIHtcbiAgICAgICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLmdldEF0dHJpYnV0ZSgndmlkZW9pZCcpIHx8ICcnKTtcbiAgICB9XG4gICAgc2V0IHZpZGVvSWQoaWQpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ3ZpZGVvaWQnLCBpZCk7XG4gICAgfVxuICAgIGdldCBwbGF5bGlzdElkKCkge1xuICAgICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuZ2V0QXR0cmlidXRlKCdwbGF5bGlzdGlkJykgfHwgJycpO1xuICAgIH1cbiAgICBzZXQgcGxheWxpc3RJZChpZCkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgncGxheWxpc3RpZCcsIGlkKTtcbiAgICB9XG4gICAgZ2V0IHZpZGVvVGl0bGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZSgndmlkZW90aXRsZScpIHx8ICdWaWRlbyc7XG4gICAgfVxuICAgIHNldCB2aWRlb1RpdGxlKHRpdGxlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCd2aWRlb3RpdGxlJywgdGl0bGUpO1xuICAgIH1cbiAgICBnZXQgdmlkZW9QbGF5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ3ZpZGVvUGxheScpIHx8ICdQbGF5JztcbiAgICB9XG4gICAgc2V0IHZpZGVvUGxheShuYW1lKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCd2aWRlb1BsYXknLCBuYW1lKTtcbiAgICB9XG4gICAgZ2V0IHZpZGVvU3RhcnRBdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCd2aWRlb1N0YXJ0QXQnKSB8fCAnMCc7XG4gICAgfVxuICAgIGdldCBhdXRvTG9hZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzQXR0cmlidXRlKCdhdXRvbG9hZCcpO1xuICAgIH1cbiAgICBnZXQgbm9Db29raWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc0F0dHJpYnV0ZSgnbm9jb29raWUnKTtcbiAgICB9XG4gICAgZ2V0IHBvc3RlclF1YWxpdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZSgncG9zdGVycXVhbGl0eScpIHx8ICdocWRlZmF1bHQnO1xuICAgIH1cbiAgICBnZXQgcG9zdGVyTG9hZGluZygpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmdldEF0dHJpYnV0ZSgncG9zdGVybG9hZGluZycpIHx8XG4gICAgICAgICAgICAnbGF6eScpO1xuICAgIH1cbiAgICBnZXQgcGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gYHN0YXJ0PSR7dGhpcy52aWRlb1N0YXJ0QXR9JiR7dGhpcy5nZXRBdHRyaWJ1dGUoJ3BhcmFtcycpfWA7XG4gICAgfVxuICAgIHNldCBwYXJhbXMob3B0cykge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgncGFyYW1zJywgb3B0cyk7XG4gICAgfVxuICAgIHNldHVwRG9tKCkge1xuICAgICAgICBjb25zdCBzaGFkb3dEb20gPSB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KTtcbiAgICAgICAgbGV0IG5vbmNlID0gJyc7XG4gICAgICAgIGlmICh3aW5kb3cubGl0ZVlvdVR1YmVOb25jZSkge1xuICAgICAgICAgICAgbm9uY2UgPSBgbm9uY2U9XCIke3dpbmRvdy5saXRlWW91VHViZU5vbmNlfVwiYDtcbiAgICAgICAgfVxuICAgICAgICBzaGFkb3dEb20uaW5uZXJIVE1MID0gYFxuICAgICAgPHN0eWxlICR7bm9uY2V9PlxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgY29udGFpbjogY29udGVudDtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgICAgcGFkZGluZy1ib3R0b206IGNhbGMoMTAwJSAvICgxNiAvIDkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIEBtZWRpYSAobWF4LXdpZHRoOiA0MGVtKSB7XG4gICAgICAgICAgOmhvc3QoW3Nob3J0XSkge1xuICAgICAgICAgICAgcGFkZGluZy1ib3R0b206IGNhbGMoMTAwJSAvICg5IC8gMTYpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAjZnJhbWUsICNmYWxsYmFja1BsYWNlaG9sZGVyLCBpZnJhbWUge1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgICAgbGVmdDogMDtcbiAgICAgICAgfVxuXG4gICAgICAgICNmcmFtZSB7XG4gICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgI2ZhbGxiYWNrUGxhY2Vob2xkZXIge1xuICAgICAgICAgIG9iamVjdC1maXQ6IGNvdmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgI2ZyYW1lOjpiZWZvcmUge1xuICAgICAgICAgIGNvbnRlbnQ6ICcnO1xuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICB0b3A6IDA7XG4gICAgICAgICAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzExMSAtMjAlLCB0cmFuc3BhcmVudCA5MCUpO1xuICAgICAgICAgIGhlaWdodDogNjBweDtcbiAgICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgICB6LWluZGV4OiAxO1xuICAgICAgICB9XG5cbiAgICAgICAgI3BsYXlCdXR0b24ge1xuICAgICAgICAgIHdpZHRoOiA2OHB4O1xuICAgICAgICAgIGhlaWdodDogNDhweDtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJ2RhdGE6aW1hZ2Uvc3ZnK3htbDt1dGY4LDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgNjggNDhcIj48cGF0aCBkPVwiTTY2LjUyIDcuNzRjLS43OC0yLjkzLTIuNDktNS40MS01LjQyLTYuMTlDNTUuNzkuMTMgMzQgMCAzNCAwUzEyLjIxLjEzIDYuOSAxLjU1Yy0yLjkzLjc4LTQuNjMgMy4yNi01LjQyIDYuMTlDLjA2IDEzLjA1IDAgMjQgMCAyNHMuMDYgMTAuOTUgMS40OCAxNi4yNmMuNzggMi45MyAyLjQ5IDUuNDEgNS40MiA2LjE5QzEyLjIxIDQ3Ljg3IDM0IDQ4IDM0IDQ4czIxLjc5LS4xMyAyNy4xLTEuNTVjMi45My0uNzggNC42NC0zLjI2IDUuNDItNi4xOUM2Ny45NCAzNC45NSA2OCAyNCA2OCAyNHMtLjA2LTEwLjk1LTEuNDgtMTYuMjZ6XCIgZmlsbD1cInJlZFwiLz48cGF0aCBkPVwiTTQ1IDI0IDI3IDE0djIwXCIgZmlsbD1cIndoaXRlXCIvPjwvc3ZnPicpO1xuICAgICAgICAgIHotaW5kZXg6IDE7XG4gICAgICAgICAgYm9yZGVyOiAwO1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IGluaGVyaXQ7XG4gICAgICAgIH1cblxuICAgICAgICAjcGxheUJ1dHRvbjpiZWZvcmUge1xuICAgICAgICAgIGNvbnRlbnQ6ICcnO1xuICAgICAgICAgIGJvcmRlci1zdHlsZTogc29saWQ7XG4gICAgICAgICAgYm9yZGVyLXdpZHRoOiAxMXB4IDAgMTFweCAxOXB4O1xuICAgICAgICAgIGJvcmRlci1jb2xvcjogdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgI2ZmZjtcbiAgICAgICAgfVxuXG4gICAgICAgICNwbGF5QnV0dG9uLFxuICAgICAgICAjcGxheUJ1dHRvbjpiZWZvcmUge1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICB0b3A6IDUwJTtcbiAgICAgICAgICBsZWZ0OiA1MCU7XG4gICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtNTAlLCAtNTAlLCAwKTtcbiAgICAgICAgICBjdXJzb3I6IGluaGVyaXQ7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBQb3N0LWNsaWNrIHN0eWxlcyAqL1xuICAgICAgICAuYWN0aXZhdGVkIHtcbiAgICAgICAgICBjdXJzb3I6IHVuc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgI2ZyYW1lLmFjdGl2YXRlZDo6YmVmb3JlLFxuICAgICAgICAjZnJhbWUuYWN0aXZhdGVkID4gI3BsYXlCdXR0b24ge1xuICAgICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgICAgIH1cbiAgICAgIDwvc3R5bGU+XG4gICAgICA8ZGl2IGlkPVwiZnJhbWVcIj5cbiAgICAgICAgPHBpY3R1cmU+XG4gICAgICAgICAgPHNvdXJjZSBpZD1cIndlYnBQbGFjZWhvbGRlclwiIHR5cGU9XCJpbWFnZS93ZWJwXCI+XG4gICAgICAgICAgPHNvdXJjZSBpZD1cImpwZWdQbGFjZWhvbGRlclwiIHR5cGU9XCJpbWFnZS9qcGVnXCI+XG4gICAgICAgICAgPGltZyBpZD1cImZhbGxiYWNrUGxhY2Vob2xkZXJcIiByZWZlcnJlcnBvbGljeT1cIm9yaWdpblwiIGxvYWRpbmc9XCJsYXp5XCI+XG4gICAgICAgIDwvcGljdHVyZT5cbiAgICAgICAgPGJ1dHRvbiBpZD1cInBsYXlCdXR0b25cIj48L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gICAgICAgIHRoaXMuZG9tUmVmRnJhbWUgPSBzaGFkb3dEb20ucXVlcnlTZWxlY3RvcignI2ZyYW1lJyk7XG4gICAgICAgIHRoaXMuZG9tUmVmSW1nID0ge1xuICAgICAgICAgICAgZmFsbGJhY2s6IHNoYWRvd0RvbS5xdWVyeVNlbGVjdG9yKCcjZmFsbGJhY2tQbGFjZWhvbGRlcicpLFxuICAgICAgICAgICAgd2VicDogc2hhZG93RG9tLnF1ZXJ5U2VsZWN0b3IoJyN3ZWJwUGxhY2Vob2xkZXInKSxcbiAgICAgICAgICAgIGpwZWc6IHNoYWRvd0RvbS5xdWVyeVNlbGVjdG9yKCcjanBlZ1BsYWNlaG9sZGVyJyksXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZG9tUmVmUGxheUJ1dHRvbiA9IHNoYWRvd0RvbS5xdWVyeVNlbGVjdG9yKCcjcGxheUJ1dHRvbicpO1xuICAgIH1cbiAgICBzZXR1cENvbXBvbmVudCgpIHtcbiAgICAgICAgdGhpcy5pbml0SW1hZ2VQbGFjZWhvbGRlcigpO1xuICAgICAgICB0aGlzLmRvbVJlZlBsYXlCdXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgYCR7dGhpcy52aWRlb1BsYXl9OiAke3RoaXMudmlkZW9UaXRsZX1gKTtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgYCR7dGhpcy52aWRlb1BsYXl9OiAke3RoaXMudmlkZW9UaXRsZX1gKTtcbiAgICAgICAgaWYgKHRoaXMuYXV0b0xvYWQgfHwgdGhpcy5pc1lvdVR1YmVTaG9ydCgpKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRJbnRlcnNlY3Rpb25PYnNlcnZlcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhuYW1lLCBvbGRWYWwsIG5ld1ZhbCkge1xuICAgICAgICBzd2l0Y2ggKG5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3ZpZGVvaWQnOlxuICAgICAgICAgICAgY2FzZSAncGxheWxpc3RpZCc6XG4gICAgICAgICAgICBjYXNlICd2aWRlb1RpdGxlJzpcbiAgICAgICAgICAgIGNhc2UgJ3ZpZGVvUGxheSc6IHtcbiAgICAgICAgICAgICAgICBpZiAob2xkVmFsICE9PSBuZXdWYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXR1cENvbXBvbmVudCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kb21SZWZGcmFtZS5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2YXRlZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRvbVJlZkZyYW1lLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2YXRlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2lmcmFtZScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0lmcmFtZUxvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBhZGRJZnJhbWUoaXNJbnRlcnNlY3Rpb25PYnNlcnZlciA9IGZhbHNlKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0lmcmFtZUxvYWRlZCkge1xuICAgICAgICAgICAgbGV0IGF1dG9wbGF5ID0gaXNJbnRlcnNlY3Rpb25PYnNlcnZlciA/IDAgOiAxO1xuICAgICAgICAgICAgY29uc3Qgd2FudHNOb0Nvb2tpZSA9IHRoaXMubm9Db29raWUgPyAnLW5vY29va2llJyA6ICcnO1xuICAgICAgICAgICAgbGV0IGVtYmVkVGFyZ2V0O1xuICAgICAgICAgICAgaWYgKHRoaXMucGxheWxpc3RJZCkge1xuICAgICAgICAgICAgICAgIGVtYmVkVGFyZ2V0ID0gYD9saXN0VHlwZT1wbGF5bGlzdCZsaXN0PSR7dGhpcy5wbGF5bGlzdElkfSZgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZW1iZWRUYXJnZXQgPSBgJHt0aGlzLnZpZGVvSWR9P2A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5pc1lvdVR1YmVTaG9ydCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbXMgPSBgbG9vcD0xJm11dGU9MSZtb2Rlc3RicmFuZGluZz0xJnBsYXlzaW5saW5lPTEmcmVsPTAmZW5hYmxlanNhcGk9MSZwbGF5bGlzdD0ke3RoaXMudmlkZW9JZH1gO1xuICAgICAgICAgICAgICAgIGF1dG9wbGF5ID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGlmcmFtZUhUTUwgPSBgXG48aWZyYW1lIGZyYW1lYm9yZGVyPVwiMFwiIHRpdGxlPVwiJHt0aGlzLnZpZGVvVGl0bGV9XCJcbiAgYWxsb3c9XCJhY2NlbGVyb21ldGVyOyBhdXRvcGxheTsgZW5jcnlwdGVkLW1lZGlhOyBneXJvc2NvcGU7IHBpY3R1cmUtaW4tcGljdHVyZVwiIGFsbG93ZnVsbHNjcmVlblxuICBzcmM9XCJodHRwczovL3d3dy55b3V0dWJlJHt3YW50c05vQ29va2llfS5jb20vZW1iZWQvJHtlbWJlZFRhcmdldH1hdXRvcGxheT0ke2F1dG9wbGF5fSYke3RoaXMucGFyYW1zfVwiXG4+PC9pZnJhbWU+YDtcbiAgICAgICAgICAgIHRoaXMuZG9tUmVmRnJhbWUuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBpZnJhbWVIVE1MKTtcbiAgICAgICAgICAgIHRoaXMuZG9tUmVmRnJhbWUuY2xhc3NMaXN0LmFkZCgnYWN0aXZhdGVkJyk7XG4gICAgICAgICAgICB0aGlzLmlzSWZyYW1lTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuYXR0ZW1wdFNob3J0QXV0b1BsYXkoKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2xpdGVZb3V0dWJlSWZyYW1lTG9hZGVkJywge1xuICAgICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgICAgICB2aWRlb0lkOiB0aGlzLnZpZGVvSWQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaW5pdEltYWdlUGxhY2Vob2xkZXIoKSB7XG4gICAgICAgIGNvbnN0IHBvc3RlclVybFdlYnAgPSBgaHR0cHM6Ly9pLnl0aW1nLmNvbS92aV93ZWJwLyR7dGhpcy52aWRlb0lkfS8ke3RoaXMucG9zdGVyUXVhbGl0eX0ud2VicGA7XG4gICAgICAgIGNvbnN0IHBvc3RlclVybEpwZWcgPSBgaHR0cHM6Ly9pLnl0aW1nLmNvbS92aS8ke3RoaXMudmlkZW9JZH0vJHt0aGlzLnBvc3RlclF1YWxpdHl9LmpwZ2A7XG4gICAgICAgIHRoaXMuZG9tUmVmSW1nLmZhbGxiYWNrLmxvYWRpbmcgPSB0aGlzLnBvc3RlckxvYWRpbmc7XG4gICAgICAgIHRoaXMuZG9tUmVmSW1nLndlYnAuc3Jjc2V0ID0gcG9zdGVyVXJsV2VicDtcbiAgICAgICAgdGhpcy5kb21SZWZJbWcuanBlZy5zcmNzZXQgPSBwb3N0ZXJVcmxKcGVnO1xuICAgICAgICB0aGlzLmRvbVJlZkltZy5mYWxsYmFjay5zcmMgPSBwb3N0ZXJVcmxKcGVnO1xuICAgICAgICB0aGlzLmRvbVJlZkltZy5mYWxsYmFjay5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBgJHt0aGlzLnZpZGVvUGxheX06ICR7dGhpcy52aWRlb1RpdGxlfWApO1xuICAgICAgICB0aGlzLmRvbVJlZkltZz8uZmFsbGJhY2s/LnNldEF0dHJpYnV0ZSgnYWx0JywgYCR7dGhpcy52aWRlb1BsYXl9OiAke3RoaXMudmlkZW9UaXRsZX1gKTtcbiAgICB9XG4gICAgaW5pdEludGVyc2VjdGlvbk9ic2VydmVyKCkge1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgcm9vdDogbnVsbCxcbiAgICAgICAgICAgIHJvb3RNYXJnaW46ICcwcHgnLFxuICAgICAgICAgICAgdGhyZXNob2xkOiAwLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcigoZW50cmllcywgb2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5LmlzSW50ZXJzZWN0aW5nICYmICF0aGlzLmlzSWZyYW1lTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIExpdGVZVEVtYmVkLndhcm1Db25uZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZElmcmFtZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIudW5vYnNlcnZlKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzKTtcbiAgICB9XG4gICAgYXR0ZW1wdFNob3J0QXV0b1BsYXkoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzWW91VHViZVNob3J0KCkpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93Um9vdFxuICAgICAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcignaWZyYW1lJylcbiAgICAgICAgICAgICAgICAgICAgPy5jb250ZW50V2luZG93Py5wb3N0TWVzc2FnZSgne1wiZXZlbnRcIjpcImNvbW1hbmRcIixcImZ1bmNcIjpcIicgKyAncGxheVZpZGVvJyArICdcIixcImFyZ3NcIjpcIlwifScsICcqJyk7XG4gICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpc1lvdVR1YmVTaG9ydCgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmdldEF0dHJpYnV0ZSgnc2hvcnQnKSA9PT0gJycgJiZcbiAgICAgICAgICAgIHdpbmRvdy5tYXRjaE1lZGlhKCcobWF4LXdpZHRoOiA0MGVtKScpLm1hdGNoZXMpO1xuICAgIH1cbiAgICBzdGF0aWMgYWRkUHJlZmV0Y2goa2luZCwgdXJsKSB7XG4gICAgICAgIGNvbnN0IGxpbmtFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICAgICAgICBsaW5rRWxlbS5yZWwgPSBraW5kO1xuICAgICAgICBsaW5rRWxlbS5ocmVmID0gdXJsO1xuICAgICAgICBsaW5rRWxlbS5jcm9zc09yaWdpbiA9ICd0cnVlJztcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmQobGlua0VsZW0pO1xuICAgIH1cbiAgICBzdGF0aWMgd2FybUNvbm5lY3Rpb25zKCkge1xuICAgICAgICBpZiAoTGl0ZVlURW1iZWQuaXNQcmVjb25uZWN0ZWQgfHwgd2luZG93LmxpdGVZb3VUdWJlSXNQcmVjb25uZWN0ZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIExpdGVZVEVtYmVkLmFkZFByZWZldGNoKCdwcmVjb25uZWN0JywgJ2h0dHBzOi8vaS55dGltZy5jb20vJyk7XG4gICAgICAgIExpdGVZVEVtYmVkLmFkZFByZWZldGNoKCdwcmVjb25uZWN0JywgJ2h0dHBzOi8vcy55dGltZy5jb20nKTtcbiAgICAgICAgTGl0ZVlURW1iZWQuYWRkUHJlZmV0Y2goJ3ByZWNvbm5lY3QnLCAnaHR0cHM6Ly93d3cueW91dHViZS5jb20nKTtcbiAgICAgICAgTGl0ZVlURW1iZWQuYWRkUHJlZmV0Y2goJ3ByZWNvbm5lY3QnLCAnaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbScpO1xuICAgICAgICBMaXRlWVRFbWJlZC5hZGRQcmVmZXRjaCgncHJlY29ubmVjdCcsICdodHRwczovL2dvb2dsZWFkcy5nLmRvdWJsZWNsaWNrLm5ldCcpO1xuICAgICAgICBMaXRlWVRFbWJlZC5hZGRQcmVmZXRjaCgncHJlY29ubmVjdCcsICdodHRwczovL3N0YXRpYy5kb3VibGVjbGljay5uZXQnKTtcbiAgICAgICAgTGl0ZVlURW1iZWQuaXNQcmVjb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICB3aW5kb3cubGl0ZVlvdVR1YmVJc1ByZWNvbm5lY3RlZCA9IHRydWU7XG4gICAgfVxufVxuTGl0ZVlURW1iZWQuaXNQcmVjb25uZWN0ZWQgPSBmYWxzZTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbGl0ZS15b3V0dWJlJywgTGl0ZVlURW1iZWQpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGl0ZS15b3V0dWJlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==