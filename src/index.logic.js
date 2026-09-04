class Component extends DCLogic {
  state = { openFaq: 0, tab: "All", step: 0 };

  componentDidMount() {
    this._onKey = (ev) => {
      if (ev.key === "Escape") {
        const open = document.querySelector(".nav-toggle[open]");
        if (open) open.removeAttribute("open");
      }
    };
    document.addEventListener("keydown", this._onKey);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (reduce || !gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);
    this._gsapCtx = gsap.context(() => {
      gsap.from(".hero-copy > *", {
        opacity: 0,
        y: 34,
        duration: 1.15,
        stagger: 0.12,
        ease: "power4.out"
      });

      gsap.fromTo(".hero-media img",
        { scale: 0.92, opacity: 0.68 },
        {
          scale: 1.08,
          opacity: 0.24,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-cinematic",
            start: "top top",
            end: "bottom top",
            scrub: 1
          }
        }
      );

      gsap.utils.toArray(".outcome-card").forEach((card) => {
        gsap.fromTo(card,
          { scale: 0.88, opacity: 0.28 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "top 42%",
              scrub: 0.8
            }
          }
        );
      });

      if (window.matchMedia("(min-width: 860px)").matches) {
        const cards = gsap.utils.toArray(".decision-stack .stack-card");
        cards.forEach((card, index) => {
          if (index === cards.length - 1) return;
          ScrollTrigger.create({
            trigger: card,
            start: "top top",
            endTrigger: cards[cards.length - 1],
            end: "top top",
            pin: true,
            pinSpacing: false
          });
          gsap.to(card, {
            scale: 0.91,
            opacity: 0.38,
            rotateX: -4,
            ease: "none",
            scrollTrigger: {
              trigger: cards[index + 1],
              start: "top bottom",
              end: "top top",
              scrub: 1
            }
          });
        });
      }
    });
  }

  componentWillUnmount() {
    if (this._onKey) document.removeEventListener("keydown", this._onKey);
    if (this._gsapCtx) this._gsapCtx.revert();
  }

  renderVals() {
    // --- FAQ ---------------------------------------------------------------
    const faqData = [
      ["Will my team have to learn new software?", "No. Kutlerri is fully managed. Your team sees the decisions that need judgment, the dollars attached to them and the measured result. We handle the agents and systems behind that."],
      ["Does Kutlerri replace our POS?", "No. Your POS stays where it is. Kutlerri reads from it."],
      ["What systems does Kutlerri connect to?", "POS, delivery marketplaces, labor, inventory, reviews, accounting and catering tools. We confirm the exact connections during onboarding."],
      ["Does my team have to operate the agents?", "No. Recommendations arrive as decisions with a dollar amount attached. Most operators only touch approvals."],
      ["What does fully managed mean?", "Our team runs the analysis, the outreach and the follow-through as an extension of yours. You are not handed a login and left with it."],
      ["Which agents are available today?", "Catering is live. The others are in closely monitored beta with operator partners."],
      ["How does outcome-based pricing work?", "Where it applies, our economics are tied to the revenue created or the cost recovered. We agree the outcome and how it gets measured before we start."],
      ["How do you measure the impact?", "Against your own baseline: catering revenue, contribution on promotional spend, prep variance, scheduled hours against needed hours."],
      ["Does Kutlerri make changes automatically?", "Only the routine work you approved in advance. Pricing, campaigns and anything with real money attached waits for a human."],
      ["Does Kutlerri work for single-location restaurants?", "It is built for groups of roughly three locations and up. A single site can still use catering, though the economics work best across several stores."],
      ["What happens to our restaurant data?", "It stays yours. We use it to run your agents and produce your recommendations."]
    ];

    const faqs = faqData.map(([q, a], i) => ({
      q: q,
      a: a,
      open: this.state.openFaq === i,
      toggle: () => this.setState({ openFaq: this.state.openFaq === i ? -1 : i })
    }));

    // --- Agent directory ---------------------------------------------------
    const BETA = "Monitored beta";
    const all = [
      ["Catering", "Build a repeatable corporate catering engine.", "Live", "Grow revenue", "icon-catering"],
      ["Menu Engineering", "Fix the items quietly killing your margin.", BETA, "Grow revenue", "icon-menu"],
      ["Guest Retention", "Catch valuable guests before they disappear.", BETA, "Grow revenue", "icon-retention"],
      ["Review Recovery", "Know when a bad night costs you a regular.", BETA, "Grow revenue", "icon-review"],
      ["Prep Forecast", "Know what to prep before the waste happens.", BETA, "Protect margin", "icon-prep"],
      ["Waste Control", "Stop paying twice for the same ingredient.", BETA, "Protect margin", "icon-waste"],
      ["Labor Scheduling", "Find the shifts you pay for and do not use.", BETA, "Protect margin", "icon-labor"],
      ["Delivery Spend", "Stop funding promos that lose money.", BETA, "Protect margin", "icon-delivery"],
      ["Site Selection", "Judge a location before you sign the lease.", BETA, "Expand", "icon-site"]
    ];

    const tabs = ["All", "Grow revenue", "Protect margin", "Expand"].map((g) => ({
      label: g,
      on: this.state.tab === g,
      select: () => this.setState({ tab: g })
    }));

    const agents = all
      .filter((row) => this.state.tab === "All" || row[3] === this.state.tab)
      .map((row) => ({
        name: row[0],
        promise: row[1],
        status: row[2],
        icon: row[4],
        chipClass: row[2] === "Live" ? "chip" : "chip chip-quiet"
      }));

    // --- Approval demo -----------------------------------------------------
    // Three states of one real recommendation. The figures change with the
    // step, so the reader watches the same decision move rather than reading
    // three separate cards.
    const steps = [
      {
        chip: "Needs your decision",
        chipClass: "chip chip-warn",
        title: "Tuesday afternoons are overstaffed.",
        body: "Six of the last eight weeks, Austin South has carried more hours between 2 and 5 PM than the covers justify. Dropping one person from that window is the smallest change that closes it.",
        hours: "11",
        weeks: "6 of 8",
        moneyLabel: "Worth a month",
        money: "$1,084",
        action: "Approve the change"
      },
      {
        chip: "In progress",
        chipClass: "chip",
        title: "Approved. The schedule is already updated.",
        body: "The Tuesday afternoon shift is rebuilt from next week. Our team is watching service times for the first three weeks in case the covers move and the hours need to come back.",
        hours: "0",
        weeks: "3 to watch",
        moneyLabel: "Expected a month",
        money: "$1,084",
        action: "See the result"
      },
      {
        chip: "Measured",
        chipClass: "chip",
        title: "Logged against the baseline we agreed.",
        body: "Labor cost at Austin South came down without service times moving. It lands on the line you already track, measured the way we said it would be at kickoff.",
        hours: "0",
        weeks: "Held",
        moneyLabel: "Recovered, first month",
        money: "$1,032",
        action: "Start over"
      }
    ];
    const i = this.state.step;
    const s = steps[i];

    return {
      systems: ["POS", "DoorDash", "Uber Eats", "Labor", "Inventory", "Reviews", "Accounting", "Catering", "Guest data"],

      // Three flat lists rather than a nested loop, so each phase renders on
      // its own and the markup stays one level deep.
      morning: [
        { at: "7:10 AM", what: "Prep Forecast sends every kitchen its plan for the day.", who: "Prep Forecast, all stores" },
        { at: "9:20 AM", what: "Catering finds a new corporate buyer a mile from Austin South.", who: "Catering, Austin South" }
      ],
      midday: [
        { at: "11:40 AM", what: "An inbound catering request gets quoted and followed up.", who: "Catering, Store 03" },
        { at: "2:15 PM", what: "Waste Control spots the avocado order running long again.", who: "Waste Control, Austin South" }
      ],
      close: [
        { at: "3:30 PM", what: "Delivery Spend flags a DoorDash promo that is losing money.", who: "Delivery Spend, DoorDash" },
        { at: "5:10 PM", what: "A loyal guest leaves a one-star review and a manager hears about it.", who: "Review Recovery, Store 04" }
      ],

      faqs: faqs,
      tabs: tabs,
      agents: agents,

      stepNo: i + 1,
      s1: i >= 0,
      s2: i >= 1,
      s3: i >= 2,
      atStart: i === 0,
      stepChip: s.chip,
      stepChipClass: s.chipClass,
      stepTitle: s.title,
      stepBody: s.body,
      stepAction: s.action,
      figHours: s.hours,
      figWeeks: s.weeks,
      figMoneyLabel: s.moneyLabel,
      figMoney: s.money,
      advance: () => this.setState({ step: (this.state.step + 1) % 3 })
    };
  }
}
