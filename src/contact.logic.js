class Component extends DCLogic {
  state = { sent: false };

  componentDidMount() {
    this._onKey = (ev) => {
      if (ev.key === "Escape") {
        const open = document.querySelector(".nav-toggle[open]");
        if (open) open.removeAttribute("open");
      }
    };
    document.addEventListener("keydown", this._onKey);
  }

  componentWillUnmount() {
    if (this._onKey) document.removeEventListener("keydown", this._onKey);
  }

  renderVals() {
    return {
      sent: this.state.sent,
      notSent: !this.state.sent,
      submit: (e) => { e.preventDefault(); this.setState({ sent: true }); },
      reset: () => this.setState({ sent: false })
    };
  }
}
