import { Collection, Message, SnowflakeUtil, TextChannel } from 'discord.js'

class DiscordTextChannel {
  textChannel: TextChannel
  limit = 100

  constructor(textChannel: TextChannel, limit?: number) {
    this.textChannel = textChannel

    // Discord js dows support a maximum fetch limit of 100
    if (limit) this.limit = Math.min(limit, 100)
  }

  async fetchAllMessages() {
    console.log(`Fetching messages from ${this.textChannel.name}`)

    let messageArray: Message[] = []

    let count = 0
    let before = undefined
    let collection = undefined

    // while we get a collection size = limit keep fetching messages
    while (count === 0 || collection.size >= this.limit) {
      collection = await this.textChannel.messages.fetch({
        before: before && SnowflakeUtil.generate(before),
        limit: this.limit
      })

      // keep track of total fetched messages
      count += Math.max(1, collection?.size)

      // dynamic "console log" to show progress of fetching
      process.stdout.clearLine(-1)
      process.stdout.cursorTo(0)
      process.stdout.write(
        `Received ${collection.size} new messages (Total: ${count}).`
      )

      // prepare fetched messages and add them to the array
      const msgArray = this.prepareMessageArray(collection)
      // update snowflake for the next fetch
      before = msgArray[0].createdTimestamp
      messageArray = messageArray.concat(msgArray)
    }

    // cleanup of console log
    process.stdout.clearLine(-1)
    process.stdout.cursorTo(0)

    return messageArray
  }

  prepareMessageArray(messages: Collection<string, Message>): Message[] {
    const messageArray = Array.from(messages.values())

    messageArray
      // sort messages by createdTimestamp
      .sort((a, b) => {
        return a.createdTimestamp > b.createdTimestamp
          ? 1
          : a.createdTimestamp < b.createdTimestamp
          ? -1
          : 0
      })
      .map((msg) => {
        // look for attachements (e.g. pictures etc.)
        // and import the urls to the content of the message
        msg = DiscordTextChannel.importAttachmentsToMessageContent(msg)

        // look for user mentions and translate them to readable tags
        msg.content = this.makeUserMentionsReadable(msg.content)
      })

    return messageArray
  }

  makeUserMentionsReadable(content: string): string {
    // look for <@!123456789> = discords user mentions
    const matches = content.match(/<@![0-9]*>/)

    matches &&
      matches.map(async (match) => {
        // get the member associated with the matched id
        const member = await this.textChannel.client.users.fetch(
          match.replace('<@!', '').replace('>', '')
        )
        // replace the <@!123456789> with @username
        if (member) content = content.replace(match, '@' + member.username)
      })

    return content
  }

  static importAttachmentsToMessageContent(message: Message): Message {
    if (message.attachments.size > 0) {
      // if we have any attachments, loop through them and add the attachment.url
      // to the message content, separated by newlines
      message.attachments.map((attachment) => {
        message.content = message.content.concat(attachment.url + '\n')
      })
    }

    return message
  }
}

export default DiscordTextChannel
