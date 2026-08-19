import type { NegotiationScript } from '../types';

export const NEGOTIATION_SCRIPTS: NegotiationScript[] = [
  {
    id: 'script-1',
    category: 'telecom',
    title: 'Internet & Cable Retention Discount Script',
    script_text: `Agent: "Hi, thanks for calling customer service. How can I help you today?"

You: "Hi! I'm looking at my monthly expenses, and my internet bill has gone up to [Current Price]. A competing provider in my area is offering a promotional rate of [Target Price, e.g. $45/mo] for the same speed. I've been a loyal customer for [X years], but I will need to cancel today unless we can match that promotional rate."

Agent: "Let me check what offers are available for your account..." (They may offer a small $5-$10 discount)

You: "I appreciate that effort, but [Small Discount] still isn't competitive with the competitor offer. Please connect me to your Retention / Cancellations department so I can process the cancellation."

(Once connected to Retention Department):
You: "I really enjoy the service reliability, but the price isn't sustainable. Is there a promo rate or loyalty credit you can apply so I can stay with you today?"`,
    tips: [
      'Always ask to speak with the "Retention" or "Disconnections" department — regular customer service reps lack authorization for deep discounts.',
      'Be polite, friendly, but completely firm. Silence after stating your target price forces the rep to look for options.',
      'Call during Tuesday-Thursday mid-morning hours when call volumes are lower.'
    ]
  },
  {
    id: 'script-2',
    category: 'gym',
    title: 'Gym Membership Fee Waiver & Cancellation Script',
    script_text: `You: "Hi, I need to cancel my membership / inquire about waiving the annual maintenance fee."

Manager: "Our contract states you have to pay the annual $49 enhancement fee and submit 30 days written notice in person."

You: "I understand that's standard policy, but due to [Recent Relocation / Financial Review / Schedule Change], I am unable to use the facilities. If you can waive the upcoming fee and process the cancellation effective today, I will gladly leave a positive review for your customer service team."`,
    tips: [
      'If you moved more than 25 miles away, bring a utility bill or lease agreement as proof to trigger penalty-free cancellation clauses.',
      'Ask for manager approval directly.'
    ]
  },
  {
    id: 'script-3',
    category: 'streaming',
    title: 'Digital News & Streaming Service Discount',
    script_text: `You: "Hello, my subscription rate increased to [Price]. I love reading/watching, but my budget for digital entertainment is capped. Can you extend my introductory promo price of $4/month for another 12 months?"`,
    tips: [
      'Most news sites (NYTimes, WSJ) have automated retention bots on chat that grant $1/week rates instantly when you initiate cancellation.'
    ]
  }
];
