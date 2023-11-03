import { defineCustomElement, onMounted, ref } from 'vue';
import DialogP from './DialogP.js';

customElements.define('dialog-p', defineCustomElement(DialogP));

const HOST =
  window.env === 'dev' ? 'wss://localhost:2222' : 'wss://hueyond.run';

export default {
  setup() {
    const text = ref('');
    const ws = ref(null);
    const paragraphs = ref([]);

    const myName = window.nickName !== 'visitor' ? window.nickName : '未登录';

    function login() {
      if (ws.value === null) {
        ws.value = new WebSocket(`${HOST}/chat`);

        ws.value.onclose = () => {
          ws.value = null;
        };

        ws.value.onmessage = (event) => {
          const { nickName, userName, text, createdAt } = JSON.parse(
            event.data
          );
          paragraphs.value.push({
            fromWho: userName === window.userName ? 'me' : nickName,
            text,
            createdAt,
          });
        };
      }
    }

    onMounted(() => {
      if (window.userName !== '') {
        login();
      }
    });

    function send() {
      if (ws.value !== null) {
        const msg = {
          nickName: window.nickName,
          userName: window.userName,
          text: text.value,
          createdAt: Date.now(),
        };

        ws.value.send(JSON.stringify(msg));
        text.value = '';
      }
    }

    async function logout() {
      if (ws.value !== null) {
        ws.value.close();
        ws.value = null;

        await fetch('/api/logout', {
          method: 'GET',
        });
        window.location.reload();
      }
    }

    return {
      myName,
      text,
      paragraphs,
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
          <button>
            <a href='/login'>登录</a>
          </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
        placeholder='按 Ctrl + Enter 发送'
        @keyup.ctrl.enter.exact='send'
      ></textarea>
      <button @click='send'>发送</button>
    </div>
  `,
};
