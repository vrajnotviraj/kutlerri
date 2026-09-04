class Component extends DCLogic {
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
      roles: [
        "Restaurant operations",
        "Agent engineering",
        "Data and integrations",
        "Customer delivery"
      ]
    };
  }
}
