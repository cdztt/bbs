import { defineCustomElement, ref } from 'vue';
import BeiAn from './BeiAn.js';

customElements.define('bei-an', defineCustomElement(BeiAn));

export default {
  setup() {
    const nickName = ref('');

    async function register() {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
        body: nickName.value,
      }).then((res) => res.text());

      // window.alert(res);
      window.location.replace('/');
    }

    return {
      nickName,
      register,
    };
  },

  template: /*html*/ `
  <div>
    <input
      v-model.trim='nickName'
      placeholder='请输入昵称, 不超过10个字符'
      maxlength=10
    />
    <button @click='register'>确定</button>
  </div>

  <bei-an/>
  `,
};
