import { ref } from 'vue';

export default {
  setup() {
    const nickName = ref('');

    async function login() {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
        body: nickName.value,
      }).then((res) => res.text());

      window.alert(res);
      window.location.replace('/');
    }

    return {
      nickName,
      login,
    };
  },

  template: /*html*/ `
  <div>
    <input
      v-model.trim='nickName'
      placeholder='请输入昵称,不超过12个字符'
      maxlength=12
    />
    <br />
    <button @click='login'>确定</button>
  </div>
  `,
};
