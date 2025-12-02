export type RtcMessage = {
  mid: string;
  uid: string;
  data: string;
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
