import {
  type Connection,
  Server,
  type WSMessage,
  routePartykitRequest,
} from "partyserver";

import type { RtcMessage as RtcMessage, Message } from "../shared";

export class Chat extends Server<Env> {
  static options = { hibernate: false };

  messages = [] as RtcMessage[];

  broadcastMessage(message: Message, exclude?: string[]) {
    this.broadcast(JSON.stringify(message), exclude);
  }

  onStart() {
    this.ctx.storage.deleteAll();
    // this is where you can initialize things that need to be done before the server starts
    // for example, load previous messages from a database or a service

    // create the messages table if it doesn't exist
    this.ctx.storage.sql.exec(
      `CREATE TABLE IF NOT EXISTS messages (mid TEXT PRIMARY KEY, uid TEXT, type TEXT, data TEXT)`,
    );

    // load the messages from the database
    this.messages = this.ctx.storage.sql
      .exec(`SELECT * FROM messages`)
      .toArray() as RtcMessage[];
  }

  onConnect(connection: Connection) {
    var ids = this.messages.map(function(v){
      return { uid: v.uid, mid: v.mid, type: v.type };
    });
    connection.send(
      JSON.stringify({
        type: "all",
        messages: this.messages,
      } satisfies Message),
    );
  }

  saveMessage(message: RtcMessage) {
    // check if the message already exists
    const existingMessage = this.messages.find((m) => m.mid === message.mid);
    if (existingMessage) {
      this.messages = this.messages.map((m) => {
        if (m.mid === message.mid) {
          return message;
        }
        return m;
      });
    } else {
      this.messages.push(message);
    }

    this.ctx.storage.sql.exec(
      `INSERT INTO messages (uid, mid, type, data) VALUES ('${
        message.uid
      }', '${
        message.mid
      }', '${
        message.type
      }', ${JSON.stringify(
        message.data,
      )}) ON CONFLICT (mid) DO UPDATE SET data = ${JSON.stringify(
        message.data,
      )}`,
    );
  }

  onMessage(connection: Connection, message: WSMessage) {
    // let's broadcast the raw message to everyone else
    this.broadcast(message, [connection.id]);

    // let's update our local messages store
    const parsed = JSON.parse(message as string) as Message;
    if (parsed.type === "offer" || parsed.type === "answer") {
      this.saveMessage(parsed);
    }
  }
}

export default {
  async fetch(request, env) {
    return (
      (await routePartykitRequest(request, { ...env })) ||
      env.ASSETS.fetch(request)
    );
  },
} satisfies ExportedHandler<Env>;
