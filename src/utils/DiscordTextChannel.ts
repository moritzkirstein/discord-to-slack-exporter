import { Collection, Message, SnowflakeUtil, TextChannel } from 'discord.js'

class DiscordTextChannel {
  textChannel: TextChannel
  limit = 100

  constructor(textChannel: TextChannel, limit?: number) {
    this.textChannel = textChannel
    if (limit) this.limit = Math.min(limit, 100)
  }

  async fetchAllMessages(callback?: (messages: Message[]) => void) {
    console.log(`Fetching messages from ${this.textChannel.name}`)

    let messageArray: Message[] = []
    let collection = await this.textChannel.messages.fetch({
      before: undefined,
      limit: this.limit
    })

    let count = 0

    while (collection.size >= this.limit) {
      count += collection.size
      process.stdout.clearLine(-1)
      process.stdout.cursorTo(0)
      process.stdout.write(
        `Received ${collection.size} new messages (Total: ${count}).`
      )

      const msgArray = this.prepareMessageArray(collection)
      messageArray = messageArray.concat(msgArray)
      collection = await this.textChannel.messages.fetch({
        before: SnowflakeUtil.generate(msgArray[0].createdTimestamp),
        limit: this.limit
      })
    }

    process.stdout.clearLine(-1)
    process.stdout.cursorTo(0)

    return messageArray
  }

  prepareMessageArray(messages: Collection<string, Message>): Message[] {
    const messageArray = Array.from(messages.values())

    messageArray.sort((a, b) => {
      return a.createdTimestamp > b.createdTimestamp
        ? 1
        : a.createdTimestamp < b.createdTimestamp
        ? -1
        : 0
    })

    return messageArray
  }
}

export default DiscordTextChannel
