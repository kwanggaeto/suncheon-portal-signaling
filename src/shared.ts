export type RtcMessage = {
  type: string;
  mid: string;
  uid: string;
  data: string | null;
};

export type Message =
  | {
      type: "offer";
      mid: string;
      uid: string;
      data: string;
    }
  | {
      type: "answer";
      mid: string;
      uid: string;
      data: string;
    }
  | {
      type: "candidate";
      mid: string;
      uid: string;
      data: string;
      sdpMid: string;
      sdpMidLineIndex: number;
    }
  | {
      type: "all";
      messages: RtcMessage[];
    };

export const names = [
  "Alice",
  "Bob",
  "Charlie",
  "David",
  "Eve",
  "Frank",
  "Grace",
  "Heidi",
  "Ivan",
  "Judy",
  "Kevin",
  "Linda",
  "Mallory",
  "Nancy",
  "Oscar",
  "Peggy",
  "Quentin",
  "Randy",
  "Steve",
  "Trent",
  "Ursula",
  "Victor",
  "Walter",
  "Xavier",
  "Yvonne",
  "Zoe",
];
