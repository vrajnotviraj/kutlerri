class Component extends DCLogic {
  state = { pin: 1, openFaq: 0, quoteSent: false };

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
    // Prospects on the demand map. Position is distance from the store, so the
    // rings mean something: a pin further out sits on a wider ring.
    const places = [
      {
        name: "Harbor Point Legal", left: "24%", top: "27%",
        state: "Outreach sent", live: false, value: "$520",
        blurb: "A 45-person firm eight tenths of a mile out that runs partner lunches most Fridays. First approach is with the office manager."
      },
      {
        name: "Horizon Health", left: "71%", top: "34%",
        state: "Quote requested", live: true, value: "$780",
        blurb: "An office of 180 a mile away that orders team lunch most Thursdays. They replied to the first approach and asked for a quote."
      },
      {
        name: "Kestrel Software", left: "33%", top: "68%",
        state: "Reorder due", live: true, value: "$940",
        blurb: "A monthly account that has gone quiet for five weeks. Flagged for a manager to call rather than another automated email."
      },
      {
        name: "Bellwether Studio", left: "63%", top: "72%",
        state: "Researching", live: false, value: "$310",
        blurb: "A small studio just inside three miles. Kutlerri is still working out whether they order lunch often enough to be worth an approach."
      },
      {
        name: "Corley Manufacturing", left: "48%", top: "13%",
        state: "Outreach sent", live: false, value: "$1,240",
        blurb: "A shift operation four miles out. Large headcount, and the buyer is a plant administrator rather than an office manager."
      }
    ];

    const pins = places.map((p, i) => ({
      name: p.name,
      left: p.left,
      top: p.top,
      on: this.state.pin === i,
      select: () => this.setState({ pin: i })
    }));

    const s = places[this.state.pin] || places[0];

    const faqData = [
      ["Do we need a catering menu already?", "It helps, but it is not required. If you do not have one, we build a starting menu from what your kitchen already produces well at volume."],
      ["Who actually sends the outreach?", "Kutlerri drafts and sends it, and our team supervises it. Nothing goes out under your name that you have not signed off on in the setup."],
      ["What happens when a buyer replies?", "The agent handles the routine back and forth: headcount, dietary notes, delivery window, setup. A quote comes to you for approval before it goes out."],
      ["Does this work if we already have a catering manager?", "Yes, and it usually works better. The agent does the prospecting and the follow-up so your manager spends their time on the accounts worth a relationship."],
      ["How long before we see pipeline?", "The demand map is ready in the first week. Real quotes depend on your market and your menu, and we set the expectation with you before starting."],
      ["Can we cap how much outreach goes out?", "Yes. You set the volume per store per week, and the agent works within it."]
    ];

    const faqs = faqData.map(([q, a], i) => ({
      q: q,
      a: a,
      open: this.state.openFaq === i,
      toggle: () => this.setState({ openFaq: this.state.openFaq === i ? -1 : i })
    }));

    return {
      pins: pins,
      sel: {
        name: s.name,
        state: s.state,
        chipClass: s.live ? "chip" : "chip chip-quiet",
        blurb: s.blurb,
        value: s.value
      },

      // Named by the work, not by a stage number.
      funnel: [
        { name: "Map the demand", body: "Every business within range of the store, scored on whether it actually orders lunch.", owner: "Agent" },
        { name: "Find the buyer", body: "The person who places the order, not the general inbox nobody reads.", owner: "Agent" },
        { name: "Make the approach", body: "Outreach written for that business, sent at a time that suits how they buy.", owner: "Agent, supervised" },
        { name: "Quote the order", body: "Headcount, dietary notes and delivery window gathered, then a quote drafted for approval.", owner: "You approve" },
        { name: "Close it", body: "Follow-up continues until the order is placed or the buyer says no.", owner: "Agent, supervised" },
        { name: "Keep the account", body: "Reorder reminders on the cadence that account actually buys on.", owner: "Agent" }
      ],

      faqs: faqs,
      quoteSent: this.state.quoteSent,
      quoteLabel: this.state.quoteSent ? "Quote sent" : "Approve and send",
      approveQuote: () => this.setState({ quoteSent: true })
    };
  }
}
