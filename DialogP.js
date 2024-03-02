export default {
  props: {
    msg: Object,
  },

  setup(props) {
    const {
      msg: { fromWho, text, createdAt },
    } = props;

    const name = ` ${fromWho} :`;
    const time = new Date(createdAt);
    const displayedTime = `( ${time.toLocaleTimeString()} ${time.toLocaleDateString()} )`;

    const textWithPadding = text
      .split('\n')
      .map((sentence) => `\x20\x20${sentence}`)
      .join('\n');

    return {
      name,
      displayedTime,
      textWithPadding,
    };
  },

  template: /*html*/ `
  <div :style='{"border-bottom": "1px dotted gray"}'>
    <div :style='{display: "flex", "justify-content": "space-between", "align-items": "end"}'>
      <span>{{name}}</span>
      <span>{{displayedTime}}</span>
    </div>
    <pre :style='{margin: 0, "font-size": "1rem", "font-weight": 600}'>{{textWithPadding}}</pre>
  </div>
  `,
};
