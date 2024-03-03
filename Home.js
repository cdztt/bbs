import { defineCustomElement, nextTick, onMounted, ref, watch } from 'vue';
import BeiAn from './BeiAn.js';
import DialogP from './DialogP.js';

customElements.define('dialog-p', defineCustomElement(DialogP));
customElements.define('bei-an', defineCustomElement(BeiAn));

function getParagraphs() {
  let p = window.sessionStorage.getItem('paragraphs');
  if (p === null) {
    window.sessionStorage.setItem('paragraphs', JSON.stringify([]));
    p = window.sessionStorage.getItem('paragraphs');
  }
  return JSON.parse(p);
}

export default {
  setup() {
    const text = ref('');
    const ws = ref(null);
    const paragraphs = ref(getParagraphs());
    const dialogRef = ref(null);
    const onlineUsers = ref([]);

    const hasLogin = window.userName !== '';
    const myName = hasLogin ? window.nickName : '未登录';

    function connectWs() {
      if (ws.value === null) {
        // const HOST =
        //   window.env === 'dev' ? 'wss://localhost' : 'wss://hueyond.run';
        const HOST =
          window.env === 'dev' ? 'ws://localhost' : 'ws://hueyond.run';
        ws.value = new WebSocket(`${HOST}/chat`);

        ws.value.onopen = () => {
          const msg = {
            type: 'state',
          };
          ws.value.send(JSON.stringify(msg));
        };

        ws.value.onmessage = (event) => {
          const {
            onlineUsers: users,
            nickName,
            userName,
            text,
            createdAt,
          } = JSON.parse(event.data);

          if (users) {
            // state
            onlineUsers.value = users;
          } else {
            // dialog
            paragraphs.value.push({
              fromWho: userName === window.userName ? '我' : nickName,
              text,
              createdAt,
            });
            window.sessionStorage.setItem(
              'paragraphs',
              JSON.stringify(paragraphs.value)
            );
          }
        };
      }
    }

    onMounted(() => {
      if (hasLogin) {
        connectWs();
      }
    });

    watch(
      () => paragraphs.value.length,
      async () => {
        if (dialogRef.value) {
          await nextTick();
          dialogRef.value.scrollTop = dialogRef.value.scrollHeight;
        }
      }
    );

    function send() {
      if (ws.value !== null) {
        console.log('sending', ws.value);
        const msg = {
          type: 'dialog',
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
        await fetch('/api/logout');
        const msg = {
          type: 'state',
        };
        ws.value.send(JSON.stringify(msg));
        window.location.reload();
      }
    }

    return {
      myName,
      hasLogin,
      text,
      paragraphs,
      send,
      logout,
      dialogRef,
      onlineUsers,
    };
  },

  template: /*html*/ `
    <div class='headline'>
      <div>聊天室</div>
      <div>
        <span>你的名字: {{myName}}</span>
        <div>
          <button :disabled='hasLogin'
            @click='window.location.assign("/register")'
          >
            登录
          </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <button :disabled='!hasLogin'
            @click='logout'
          >
            退出
          </button>
        </div>
      </div>
    </div>

    <div class='main'>
      <div class='chat'>
        <div class='dialog'
        ref='dialogRef'
        >
          <dialog-p v-for='p of paragraphs'
          :key='p.createdAt'
          :msg='p' />
        </div>

        <div class='composition'>
          <textarea type='text'
            v-model='text'
            placeholder='按 Ctrl + Enter 发送'
            @keyup.ctrl.enter.exact='send'
          ></textarea>
          <button @click='send'>发送</button>
        </div>
      </div>

      <div class='online-list dialog'>
        <div>
          当前在线用户:
        </div>
        <li v-for='name of onlineUsers'>
          {{name === window.nickName ? '(我)' : ''}}{{name}}
        </li>
      </div>
    </div>


    <bei-an/>
  `,
};
