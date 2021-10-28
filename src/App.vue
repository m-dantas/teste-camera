<template>
  <div>
    <div id="modal" class="modal" v-if="modal">
      <div class="mobile__img"></div>
      <div class="modal__wrapper">
          <span class="modal__wrapper__close" @click="$emit('closed', $event)"></span>
          <div class="modal__wrapper__camera" :class="detectBrowser.firefox && loaded && 'modal__wrapper__camera--w_auto'">
            <video
              autoplay
              class="modal__wrapper__camera__feed"
              :class="detectBrowser.firefox && loaded && 'modal__wrapper__camera__feed--w_auto'">
            </video>
            <span class="modal__wrapper__camera__frame"></span>
            <span class="modal__wrapper__camera__frame2"></span>
            <span class="modal__wrapper__camera__frame3"></span>
            <span class="modal__wrapper__camera__frame4"></span>
              <button class="modal__wrapper__camera__snap" id="takePicture" @click="takePicture">
                Iniciar
              </button>
              <div class="modal__wrapper__camera__picture">
              <canvas class="modal__wrapper__camera__picture__canvas"></canvas>
            </div>
          </div>
          <div class="modal__wrapper--error" v-if="erro">
            <p class="modal__wrapper--error__paragraph">{{ erroMessage }}</p>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint no-alert: 0 */
/* eslint max-len: 0 */
export default {
  name: 'Camera',
  props: {
    outErro: { type: Boolean, required: true },
    outMessage: { type: String, required: true },
  },
  data() {
    return {
      modal: true,
      erro: false,
      loaded: false,
      imageBase64: '',
      erroMessage: '',
      videoPlayer: '',
    };
  },
  watch: {
    $props: {
      handler() {
        this.erro = this.outErro;
        this.erroMessage = this.outMessage;
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    isMobile() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
      }
      return false;
    },
    detectBrowser() {
      if (navigator.userAgent.toLowerCase().indexOf('firefox') !== -1) {
        return { video: { width: 335, height: 600 }, firefox: true };
      }
      if (this.isMobile && navigator.userAgent.toLowerCase().indexOf('firefox') !== -1) {
        return { video: { width: 335, height: 600 }, firefox: true };
      }
      return {
        video: {
          width: {
            min: 335,
            ideal: 415,
            max: 415,
          },
          height: {
            min: 371,
            ideal: 460,
            max: 460,
          },
          facingMode: 'user',
        },
        firefox: false,
      };
    },
  },
  mounted() {
    if (window.innerWidth < 769) {
      const modal = document.getElementById('modal');
      modal.classList.remove('modal');
      modal.classList.add('mobile');
    }
  },
  methods: {
    closeModal() {
      this.modal = false;
      this.stopStreamedVideo();
    },
    init() {
      if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        console.log(this.detectBrowser);
        navigator.mediaDevices
          .getUserMedia({ video: this.detectBrowser.video })
          .then((stream) => {
            this.videoPlayer = document.querySelector('video');
            this.videoPlayer.srcObject = stream;
            this.videoPlayer.play().then(() => {
              this.loaded = true;
            }).catch((err) => console.log(err));
          })
          .catch((err) => {
            console.log(err);
            document.getElementById('takePicture').disabled = true;
            if (err.message === 'Requested device not found') {
              this.erro = true;
              this.erroMessage = 'Câmera não encontrada.';
            } else if (err.message === 'Permission denied') {
              this.erro = true;
              this.erroMessage = 'Acesso a câmera negado.';
            }
          });
      }
    },
    takePicture() {
      // eslint-disable-next-line no-restricted-globals
      const ratio = screen.height < screen.width ? 0.902 : 1.108;
      const picture = document.querySelector('canvas');
      // eslint-disable-next-line no-restricted-globals
      picture.width = screen.width < 769 ? 335 : 415;
      // eslint-disable-next-line no-restricted-globals
      picture.height = screen.width < 769 ? 335 / ratio : 460;
      const ctx = picture.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        document.querySelector('video'),
        0,
        0,
        picture.width,
        picture.height,
      );
      this.imageBase64 = picture.toDataURL('image/png');
      this.postPicture();
    },
    stopStreamedVideo() {
      const tracks = this.videoPlayer.srcObject.getTracks();
      tracks[0].stop();
      this.videoPlayer.srcObject = null;
    },
    postPicture() {
      this.erro = false;
      const date = new Date();
      this.$emit('takePicture', {
        error: false,
        data: { data: date.toLocaleDateString('pt-BR'), hora: date.toLocaleTimeString('pt-BR').slice(0, 5) },
        json: this.imageBase64,
      });
    },
  },
  created() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.modal,
.mobile {
  align-items: center;
  background:rgb(105, 105, 105);
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;

  @media (max-width: 769px) {
    background: linear-gradient(to bottom, #00315D 45.6%, #fff 45.6%);
    flex-direction: column;
    justify-content: flex-start;
    z-index: 1;
  }

  &__img {
    display: none;

    img {
      width: 100%;
    }

    &__arrow-back {
      height: 18px;
      position: absolute;
      right: 42%;
      top: 35px;
      width: 10px;
    }

    @media (max-width: 769px) {
      display: block;
      margin: 25px auto 0;
      width: 210px;
    }
  }

  &__wrapper {
    align-items: center;
    background: #fff;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin: 0 10px;
    max-width: 870px;
    min-height: 660px;
    padding: 0 10px;
    position: relative;
    text-align: center;
    width: 100%;

    @media (max-width: 769px) {
      height: 0;
      max-width: 0;
      min-height: 0;
      width: 0;
    }

    &__close {
      cursor: pointer;

      &:after {
        background: #D9D9D9;
        content: '';
        height: 3px;
        position: absolute;
        right: 30px;
        top: 30px;
        transform: rotate(45deg);
        width: 25px;
      }

      &:before {
        background: #D9D9D9;
        content: '';
        height: 3px;
        position: absolute;
        right: 30px;
        top: 30px;
        transform: rotate(-45deg);
        width: 25px;
      }

      @media (max-width: 769px) {
        display: none;
      }
    }

    &__camera {
      box-sizing: border-box;
      display: block;
      height: 460px;
      margin-top: 60px;
      position: relative;
      width: 415px;

      &--w_auto {
        width: auto;
        @media (max-width: 769px) {
          width: 335px;
        }
        @media (max-width: 350px) {
          width: 300px;
        }
      }

      @media (max-width: 769px) {
        height: 430px;
        margin-top: 35px;
        width: 335px;
      }

      @media (max-width: 350px) {
        height: 395px;
        width: 300px;
      }

      &__feed {
        background-color: #171717;
        display: block;
        height: 460px;
        margin: 0 auto;
        width: 415px;

        @media (max-width: 769px) {
          height: 430px;
          width: 335px;
        }

        @media (max-width: 350px) {
          height: 395px;
          width: 300px;
        }

        &--w_auto {
          width: auto;
          min-width: 336px;
          @media (max-width: 769px) {
            width: 335px;
          }
          @media (max-width: 350px) {
            width: 300px;
          }
        }
      }

      &__picture {
        display: none;

        &__canvas {
          display: none;
        }
      }

      &__frame {
        &:after {
          background: #C9920E;
          content: '';
          height: 5px;
          left: 0;
          position: absolute;
          top: 0;
          width: 80px;
        }
        &:before {
          background: #C9920E;
          content: '';
          height: 5px;
          left: -38px;
          position: absolute;
          top: 38px;
          transform: rotate(90deg);
          width: 80px;
        }
      }

      &__frame2 {
        &:after {
          background: #C9920E;
          content: '';
          height: 5px;
          position: absolute;
          right: 0;
          top: 0;
          width: 80px;
        }
        &:before {
          background: #C9920E;
          content: '';
          height: 5px;
          position: absolute;
          right: -38px;
          top: 38px;
          transform: rotate(90deg);
          width: 80px;
        }
      }

      &__frame3 {
        &:after {
          background: #C9920E;
          bottom: 0;
          content: '';
          height: 5px;
          position: absolute;
          right: 0;
          width: 80px;
        }
        &:before {
          background: #C9920E;
          bottom: 38px;
          content: '';
          height: 5px;
          position: absolute;
          right: -38px;
          transform: rotate(90deg);
          width: 80px;
        }
      }

      &__frame4 {
        &:after {
          background: #C9920E;
          bottom: 0;
          content: '';
          height: 5px;
          left: 0;
          position: absolute;
          width: 80px;
        }
        &:before {
          background: #C9920E;
          bottom: 38px;
          content: '';
          height: 5px;
          left: -38px;
          position: absolute;
          transform: rotate(90deg);
          width: 80px;
        }
      }

      &__snap {
        background: #C9920E;
        border-radius: 30px;
        bottom: 30px;
        color: #fff;
        cursor: pointer;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 1rem;
        font-weight: bold;
        height: 40px;
        left: calc(50% - (145px / 2));
        position: absolute;
        width: 145px;

        @media (max-width: 769px) {
          font-size: 0.875rem;
        }
      }
    }

    &--error {
      color: #FF0000;
      display: flex;
      font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      line-height: 1.875rem;
      margin-top: 45px;

        @media (max-width: 769px) {
          font-size: 0.875rem;
          line-height: 1.3125rem;
          margin-top: 25px;
        }

      &__img {
        height: 23px;
        margin-right: 5px;
        margin-top: 5px;
        width: 23px;

        @media (max-width: 769px) {
          margin-right: 10px;
          margin-top: 0px;
        }

        @media (max-width: 350px) {
          margin-left: 10px;
        }
      }

      &__paragraph{
        max-width: 610px;

        @media (max-width: 769px) {
          max-width: 400px;
          text-align: start;
          width: 280px;
        }
      }
    }
  }
}
</style>
