import { defineCustomElement, ref } from 'vue';
import DialogP from './DialogP.js';

customElements.define('dialog-p', defineCustomElement(DialogP));
const HOST =
  window.env === 'dev' ? 'wss://localhost:2222' : 'wss://hueyond.run';

export default {
  setup() {
    const UNLINKED_NAME = '未登录';

    const text = ref('');
    const ws = ref(null);
    const myName = ref(UNLINKED_NAME);
    const paragraphs = ref([]);

    function login() {
      if (ws.value === null) {
        ws.value = new WebSocket(`${HOST}/chat`);

        ws.value.onclose = () => {
          ws.value = null;
        };

        ws.value.onmessage = (event) => {
          const { userName, init, text, createdAt } = JSON.parse(event.data);

          if (init === true) {
            myName.value = userName;
          } else {
            paragraphs.value.push({
              fromWho: userName === myName.value ? 'me' : userName,
              text,
              createdAt,
            });
          }
        };
      }
    }

    function send() {
      if (ws.value !== null) {
        const msg = {
          text: text.value,
          createdAt: Date.now(),
        };
        ws.value.send(JSON.stringify(msg));

        text.value = '';
      }
    }

    function logout() {
      if (ws.value !== null) {
        ws.value.close();
        ws.value = null;

        myName.value = UNLINKED_NAME;
      }
    }

    return {
      text,
      ws,
      myName,
      paragraphs,
      login,
      send,
      logout,
    };
  },

  template: /*html*/ `
    <div class='headline'>
      <div>聊天室</div>
      <div>
        <span>你的名字: {{myName}}</span>
        <div>
          <button @click='login'>登录</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <button @click='logout'>退出</button>
        </div>
      </div>
    </div>

    <div class='dialog'>
      <dialog-p v-for='par of paragraphs'
        :key='par.createdAt'
        :msg='par' />
    </div>

    <div class='composition'>
      <textarea type='text'
        v-model='text'
        @keyup.ctrl.enter.exact='send'
      ></textarea>
      <button @click='send'>发送</button>
    </div>
  `,
};
